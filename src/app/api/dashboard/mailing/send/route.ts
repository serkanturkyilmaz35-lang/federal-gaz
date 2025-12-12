'use server';

import { NextResponse } from 'next/server';
import { MailingCampaign, User, connectToDatabase } from '@/lib/models';
import { sendEmail, getCampaignEmailTemplate } from '@/lib/email';

interface SendResult {
    email: string;
    success: boolean;
    error?: string;
}

// POST - Send campaign to recipients
export async function POST(req: Request) {
    try {
        const { campaignId } = await req.json();

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
        let recipients: { id: number; name: string; email: string }[] = [];

        if (campaign.recipientType === 'custom' && campaign.recipientIds) {
            // Custom selection - get specific users
            const ids = JSON.parse(campaign.recipientIds) as number[];
            const users = await User.findAll({
                where: { id: ids },
                attributes: ['id', 'name', 'email'],
            });
            recipients = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
        } else {
            // All members
            const users = await User.findAll({
                attributes: ['id', 'name', 'email'],
            });
            recipients = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
        }

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
                const html = getCampaignEmailTemplate(campaign.templateId || 'modern', {
                    subject: campaign.subject,
                    content: campaign.content,
                    recipientName: recipient.name,
                });

                const result = await sendEmail({
                    to: recipient.email,
                    subject: campaign.subject,
                    html,
                });

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
