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

    console.log('GA4 getRealtimeUsers: client exists:', !!client, 'propertyId:', propertyId);

    if (!client || !propertyId) {
        console.log('GA4 getRealtimeUsers: Missing client or propertyId');
        return { activeUsers: 0, mobileUsers: 0, desktopUsers: 0 };
    }

    try {
        console.log('GA4 getRealtimeUsers: Calling runRealtimeReport for property:', propertyId);
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'deviceCategory' }],
        });

        console.log('GA4 getRealtimeUsers: Got response with', response.rows?.length || 0, 'rows');

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
    } catch (error: any) {
        console.error('GA4 Realtime Error:', error?.message || error);
        console.error('GA4 Realtime Error Details:', JSON.stringify(error?.details || error?.code || 'no details'));
        return { activeUsers: 0, mobileUsers: 0, desktopUsers: 0 };
    }
}

export async function getActivePages(): Promise<Array<{ url: string; users: number; percentage: number }>> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) return [];

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'unifiedScreenName' }],
            limit: 5,
        });

        const totalUsers = response.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0', 10), 0) || 1;

        return response.rows?.map(row => ({
            url: row.dimensionValues?.[0]?.value || '/',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
            percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0', 10) / totalUsers) * 100),
        })) || [];
    } catch (error) {
        console.error('GA4 Active Pages Error:', error);
        return [];
    }
}

export async function getTopPages(startDate: string = 'today', endDate: string = 'today'): Promise<Array<{ name: string; views: number; unique: number; bounceRate: string }>> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'bounceRate' },
            ],
            dimensions: [{ name: 'pagePath' }],
            limit: 5,
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

export async function getTotalPageViews(startDate: string = 'today', endDate: string = 'today'): Promise<number> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) return 0;

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [{ name: 'screenPageViews' }],
        });
        return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    } catch (error) {
        console.error('GA4 Total Views Error:', error);
        return 0;
    }
}

export async function getTrafficSources(startDate: string = 'today', endDate: string = 'today'): Promise<Array<{ source: string; users: number; percentage: number }>> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) return [];

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'activeUsers' }],
            limit: 5,
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        });

        const totalUsers = response.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0', 10), 0) || 1;

        return response.rows?.map(row => ({
            source: row.dimensionValues?.[0]?.value || 'Direct',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
            percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0', 10) / totalUsers) * 100),
        })) || [];
    } catch (error) {
        console.error('GA4 Traffic Sources Error:', error);
        return [];
    }
}

export async function getKeyMetrics(startDate: string = 'today', endDate: string = 'today'): Promise<{ pageViews: number; uniqueVisitors: number; bounceRate: number; avgSessionDuration: number }> {
    const client = getAnalyticsClient();
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!client || !propertyId) {
        return { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 };
    }

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'bounceRate' },
                { name: 'averageSessionDuration' }
            ],
        });

        const row = response.rows?.[0];
        return {
            pageViews: parseInt(row?.metricValues?.[0]?.value || '0', 10),
            uniqueVisitors: parseInt(row?.metricValues?.[1]?.value || '0', 10),
            bounceRate: Math.round(parseFloat(row?.metricValues?.[2]?.value || '0') * 100),
            avgSessionDuration: Math.round(parseFloat(row?.metricValues?.[3]?.value || '0')),
        };
    } catch (error) {
        console.error('GA4 Key Metrics Error:', error);
        return { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 };
    }
}
