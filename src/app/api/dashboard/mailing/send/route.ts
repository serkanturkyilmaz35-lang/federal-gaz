'use server';

import { NextResponse } from 'next/server';
import { MailingCampaign, User, connectToDatabase, MailingLog } from '@/lib/models';
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
        } else if ((campaign.recipientType as string) === 'external' && externalRecipients && externalRecipients.length > 0) {
            // External recipients from Excel/CSV - no database ID
            recipients = externalRecipients.map((r: { name: string; email: string }) => ({
                id: undefined,
                name: r.name,
                email: r.email
            }));
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

        for (const recipient of recipients) {
            try {
                // Using templateSlug instead of templateId
                // Cast templateSlug to any or string to avoid type conflict if getCampaignEmailTemplate expects explicit union
                const html = getCampaignEmailTemplate(campaign.templateSlug as any || 'modern', {
                    subject: campaign.subject,
                    content: campaign.content,
                    recipientName: recipient.name,
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
