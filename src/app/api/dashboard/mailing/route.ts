'use server';

import { NextResponse } from 'next/server';
import { MailingCampaign, User, connectToDatabase } from '@/lib/models';

// GET - List all campaigns
export async function GET() {
    try {
        await connectToDatabase();

        const campaigns = await MailingCampaign.findAll({
            order: [['createdAt', 'DESC']],
        });

        // Get subscriber count
        const subscriberCount = await User.count();

        return NextResponse.json({ campaigns, subscriberCount }, { status: 200 });
    } catch (error) {
        console.error('Mailing GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

// POST - Create new campaign
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, subject, content, templateId, recipientType, recipientIds, status, scheduledAt } = body;

        if (!name || !subject || !content) {
            return NextResponse.json({ error: 'Required fields: name, subject, content' }, { status: 400 });
        }

        await connectToDatabase();

        // Calculate recipient count based on type
        let recipientCount = 0;
        if (recipientType === 'custom' && recipientIds) {
            recipientCount = JSON.parse(recipientIds).length;
        } else {
            recipientCount = await User.count();
        }

        const campaign = await MailingCampaign.create({
            name,
            subject,
            content,
            templateId: templateId || 'modern',
            recipientType: recipientType || 'all',
            recipientIds: recipientIds || undefined,
            status: status || 'draft',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            recipientCount,
        });

        return NextResponse.json({ success: true, campaign }, { status: 201 });
    } catch (error) {
        console.error('Mailing POST Error:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}

// PUT - Update campaign
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, subject, content, status, scheduledAt } = body;

        if (!id) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const campaign = await MailingCampaign.findByPk(id);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        await campaign.update({
            name: name || campaign.name,
            subject: subject || campaign.subject,
            content: content || campaign.content,
            status: status || campaign.status,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : campaign.scheduledAt,
        });

        return NextResponse.json({ success: true, campaign }, { status: 200 });
    } catch (error) {
        console.error('Mailing PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}

// DELETE - Delete campaign
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const campaign = await MailingCampaign.findByPk(id);
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        await campaign.destroy();

        return NextResponse.json({ success: true, message: 'Campaign deleted' }, { status: 200 });
    } catch (error) {
        console.error('Mailing DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }
}
