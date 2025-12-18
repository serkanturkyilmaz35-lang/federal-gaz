'use server';

import { NextResponse } from 'next/server';
import { MailingCampaign, User, connectToDatabase, MailingLog, EmailTemplate } from '@/lib/models';
import { sendEmail, getCampaignEmailTemplate } from '@/lib/email';

interface SendResult {
    email: string;
    success: boolean;
    error?: string;
}

// POST - Send campaign to recipients
export async function POST(req: Request) {
    try {
        const { campaignId, externalRecipients } = await req.json();

        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        // Get campaign
        const campaign = await MailingCampaign.findByPk(campaignId);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Check if already sent
        if (campaign.status === 'sent') {
            return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
        }

        // Get recipients based on recipientType
        let recipients: { id: number | undefined; name: string; email: string }[] = [];

        if ((campaign.recipientType as string) === 'mixed') {
            // Mixed - combine both custom members and external recipients
            // Get custom members if any
            if (campaign.recipientIds) {
                const ids = JSON.parse(campaign.recipientIds) as number[];
                const users = await User.findAll({
                    where: { id: ids },
                    attributes: ['id', 'name', 'email'],
                });
                recipients = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
            }
            // Add external recipients if any
            if (externalRecipients && externalRecipients.length > 0) {
                const externals = externalRecipients.map((r: { name: string; email: string }) => ({
                    id: undefined,
                    name: r.name,
                    email: r.email
                }));
                recipients = [...recipients, ...externals];
            }
        } else if ((campaign.recipientType as string) === 'external') {
            // External recipients from Excel/CSV - no database ID
            // First check request body, then check campaign's stored external recipients
            let externals = externalRecipients;

            // If not in request, try to get from campaign's stored data
            if (!externals || externals.length === 0) {
                if (campaign.externalRecipients) {
                    try {
                        externals = typeof campaign.externalRecipients === 'string'
                            ? JSON.parse(campaign.externalRecipients)
                            : campaign.externalRecipients;
                    } catch (e) {
                        console.error('Failed to parse externalRecipients:', e);
                    }
                }
            }

            if (externals && externals.length > 0) {
                recipients = externals.map((r: { name: string; email: string }) => ({
                    id: undefined,
                    name: r.name || 'Alıcı',
                    email: r.email
                }));
            } else {
                return NextResponse.json({ error: 'No external recipients found' }, { status: 400 });
            }
        } else if (campaign.recipientType === 'custom') {
            // Custom selection - get specific users
            if (campaign.recipientIds) {
                const ids = JSON.parse(campaign.recipientIds) as number[];
                if (ids.length > 0) {
                    const users = await User.findAll({
                        where: { id: ids },
                        attributes: ['id', 'name', 'email'],
                    });
                    recipients = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
                }
            }
            // If custom but no recipients selected, return error instead of falling back
            if (recipients.length === 0) {
                return NextResponse.json({ error: 'No recipients selected for custom campaign' }, { status: 400 });
            }
        } else if (campaign.recipientType === 'all') {
            // Only fetch all members if explicitly set to 'all'
            const users = await User.findAll({
                attributes: ['id', 'name', 'email'],
            });
            recipients = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
        } else {
            // Unknown recipient type
            return NextResponse.json({ error: `Invalid recipient type: ${campaign.recipientType}` }, { status: 400 });
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
        }

        // Debug log - track what's being sent
        console.log('[Mailing Send] Campaign:', campaignId, 'Type:', campaign.recipientType, 'Recipients:', recipients.length);

        // Update campaign status to sending
        await campaign.update({
            status: 'sending',
            recipientCount: recipients.length,
        });

        // Send emails
        const results: SendResult[] = [];
        let sentCount = 0;
        let failedCount = 0;
        const errors: { email: string; error: string }[] = [];

        // Fetch the template *once* to get visual settings (Campaign Box, etc.)
        // Fetch the template *once* to get visual settings (Campaign Box, etc.)
        let templateData: any = {};

        // Define all visual overrides
        let customLogoUrl = campaign.customLogoUrl;
        let customProductImageUrl = campaign.customProductImageUrl;
        let headerImage = '';
        let footerImage = '';
        let buttonText = '';
        let buttonUrl = '';
        let footerContact = '';
        let headerHtml = '';
        let footerHtml = '';

        // Styling Overrides
        let styling: any = {};

        try {
            const template = await EmailTemplate.findOne({ where: { slug: campaign.templateSlug } });
            if (template) {
                templateData = template.templateData || {};

                // If campaign doesn't override these, use template's
                if (!customLogoUrl) customLogoUrl = template.logoUrl;
                if (!customProductImageUrl) customProductImageUrl = template.bannerImage;

                // Map other visual assets
                headerImage = template.headerImage;
                footerImage = template.footerImage;
                buttonText = template.buttonText;
                footerContact = template.footerContact;
                headerHtml = template.headerHtml;
                footerHtml = template.footerHtml;

                // Checks for buttonUrl in templateData or other fields if model has it
                // Assuming buttonUrl might be in templateData if not in model
                buttonUrl = templateData.buttonUrl;

                // Collect colors
                styling = {
                    headerBgColor: template.headerBgColor,
                    headerTextColor: template.headerTextColor,
                    bodyBgColor: template.bodyBgColor,
                    bodyTextColor: template.bodyTextColor,
                    buttonColor: template.buttonColor,
                    footerBgColor: template.footerBgColor,
                    footerTextColor: template.footerTextColor
                };
            }
        } catch (e) {
            console.error('Failed to fetch template details for sending:', e);
        }

        for (const recipient of recipients) {
            try {
                // Using templateSlug instead of templateId
                // Cast templateSlug to any or string to avoid type conflict if getCampaignEmailTemplate expects explicit union

                // Fetch the template details (visual settings) from DB if not already available
                // Optimization: We could fetch this ONCE outside the loop, but for now we do it per request or cached?
                // Better: Fetch it once outside the loop.
                const html = getCampaignEmailTemplate(campaign.templateSlug as any || 'modern', {
                    subject: campaign.subject || '',
                    content: campaign.content || '',
                    recipientName: recipient.name || '',
                    // Pass mapped visual settings
                    templateData: templateData,
                    customLogoUrl: customLogoUrl || undefined,
                    customProductImageUrl: customProductImageUrl || undefined,
                    campaignTitle: campaign.campaignTitle || undefined,
                    campaignHighlight: campaign.campaignHighlight || undefined,

                    // Visual Assets
                    headerImage: headerImage || undefined,
                    footerImage: footerImage || undefined,
                    buttonText: buttonText || undefined,
                    buttonUrl: buttonUrl || undefined,
                    footerContact: footerContact || undefined,

                    // Advanced HTML
                    headerHtml: headerHtml || undefined,
                    footerHtml: footerHtml || undefined,

                    // Styling
                    ...styling
                });

                const result = await sendEmail({
                    to: recipient.email,
                    subject: campaign.subject,
                    html,
                });

                // Create Log Entry
                try {
                    await MailingLog.create({
                        campaignId: campaign.id,
                        userEmail: recipient.email,
                        userId: recipient.id,
                        status: result.success ? 'sent' : 'failed',
                        errorMessage: result.success ? undefined : (typeof result.error === 'string' ? result.error : 'Unknown error'),
                        sentAt: new Date()
                    });
                } catch (logError) {
                    console.error('Failed to create mailing log:', logError);
                }

                if (result.success) {
                    sentCount++;
                    results.push({ email: recipient.email, success: true });
                } else {
                    failedCount++;
                    const errorMsg = typeof result.error === 'string' ? result.error : 'Unknown error';
                    errors.push({ email: recipient.email, error: errorMsg });
                    results.push({ email: recipient.email, success: false, error: errorMsg });
                }
            } catch (error) {
                failedCount++;
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';

                // Create Failed Log Entry
                try {
                    await MailingLog.create({
                        campaignId: campaign.id,
                        userEmail: recipient.email,
                        userId: recipient.id,
                        status: 'failed',
                        errorMessage: errorMsg,
                        sentAt: new Date()
                    });
                } catch (logError) {
                    console.error('Failed to create failing mailing log:', logError);
                }

                errors.push({ email: recipient.email, error: errorMsg });
                results.push({ email: recipient.email, success: false, error: errorMsg });
            }
        }

        // Update campaign with final stats
        const finalStatus = failedCount === recipients.length ? 'failed' : 'sent';
        await campaign.update({
            status: finalStatus,
            sentAt: new Date(),
            sentCount,
            failedCount,
            errorLog: errors.length > 0 ? JSON.stringify(errors) : undefined,
        });

        return NextResponse.json({
            success: true,
            message: `Kampanya gönderildi: ${sentCount} başarılı, ${failedCount} başarısız`,
            stats: {
                total: recipients.length,
                sent: sentCount,
                failed: failedCount,
            },
            results,
        }, { status: 200 });
    } catch (error) {
        console.error('Campaign Send Error:', error);
        return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
    }
}
