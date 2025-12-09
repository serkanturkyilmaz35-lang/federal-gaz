import { BetaAnalyticsDataClient } from '@google-analytics/data';

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient(): BetaAnalyticsDataClient | null {
    if (analyticsClient) return analyticsClient;

    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson) {
        console.warn('GA4: GOOGLE_APPLICATION_CREDENTIALS_JSON not configured');
        return null;
    }

    // Debug: log first 50 chars to verify env var is loaded
    console.log('GA4: Credentials JSON starts with:', credentialsJson.substring(0, 50));

    try {
        const credentials = JSON.parse(credentialsJson);
        console.log('GA4: Parsed credentials, project_id:', credentials.project_id);
        analyticsClient = new BetaAnalyticsDataClient({ credentials });
        return analyticsClient;
    } catch (error) {
        console.error('GA4: Failed to parse credentials', error);
        return null;
    }
}

export async function getRealtimeUsers(): Promise<{ activeUsers: number; mobileUsers: number; desktopUsers: number }> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) {
        return { activeUsers: 0, mobileUsers: 0, desktopUsers: 0 };
    }

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'deviceCategory' }],
        });

        let totalUsers = 0;
        let mobileUsers = 0;
        let desktopUsers = 0;

        response.rows?.forEach(row => {
            const device = row.dimensionValues?.[0]?.value || '';
            const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
            totalUsers += users;
            if (device === 'mobile' || device === 'tablet') {
                mobileUsers += users;
            } else {
                desktopUsers += users;
            }
        });

        return { activeUsers: totalUsers, mobileUsers, desktopUsers };
    } catch (error) {
        console.error('GA4 Realtime Error:', error);
        return { activeUsers: 0, mobileUsers: 0, desktopUsers: 0 };
    }
}

export async function getActivePages(): Promise<Array<{ url: string; users: number; percentage: number }>> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) {
        return [];
    }

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'unifiedScreenName' }],
            limit: 5,
        });

        const totalUsers = response.rows?.reduce((sum, row) => {
            return sum + parseInt(row.metricValues?.[0]?.value || '0', 10);
        }, 0) || 1;

        return response.rows?.map(row => {
            const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
            return {
                url: row.dimensionValues?.[0]?.value || '/',
                users,
                percentage: Math.round((users / totalUsers) * 100),
            };
        }) || [];
    } catch (error) {
        console.error('GA4 Active Pages Error:', error);
        return [];
    }
}

export async function getTopPages(): Promise<Array<{ name: string; views: number; unique: number; bounceRate: string }>> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) {
        return [];
    }

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'bounceRate' },
            ],
            dimensions: [{ name: 'pagePath' }],
            limit: 10,
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        });

        return response.rows?.map(row => ({
            name: row.dimensionValues?.[0]?.value || '/',
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            unique: parseInt(row.metricValues?.[1]?.value || '0', 10),
            bounceRate: `${Math.round(parseFloat(row.metricValues?.[2]?.value || '0') * 100)}%`,
        })) || [];
    } catch (error) {
        console.error('GA4 Top Pages Error:', error);
        return [];
    }
}

export async function getTotalPageViews(): Promise<number> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) {
        return 0;
    }

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [{ name: 'screenPageViews' }],
        });

        return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    } catch (error) {
        console.error('GA4 Total Views Error:', error);
        return 0;
    }
}
