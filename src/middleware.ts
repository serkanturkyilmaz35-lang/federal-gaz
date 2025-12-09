import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // Extract subdomain
    // For localhost: dashboard.localhost:3000
    // For production: dashboard.federalgaz.com
    const subdomain = hostname.split('.')[0];

    // Check if it's a dashboard subdomain
    const isDashboardSubdomain = subdomain === 'dashboard';

    // If accessing dashboard subdomain, rewrite to /dashboard routes
    if (isDashboardSubdomain) {
        // Authenticate Dashboard User
        const token = request.cookies.get('auth_token')?.value;
        const pathname = url.pathname;

        // Determine effective path for checking (mimic the rewrite logic temporarily for check)
        let targetPath = pathname;
        if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
            if (pathname === '/') targetPath = '/dashboard';
            else targetPath = `/dashboard${pathname}`;
        }

        const isLoginPage = targetPath === '/dashboard/login' || targetPath === '/dashboard/login/verify';
        const isApiOrStatic = targetPath.startsWith('/api') || targetPath.startsWith('/_next') || targetPath.includes('.');

        if (!token && !isLoginPage && !isApiOrStatic) {
            // Redirect unauthenticated users to login
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // Remove /dashboard prefix check - subdomain IS the dashboard
        // const pathname = url.pathname; // (Already declared above)

        // If path doesn't start with /dashboard, add it for internal routing
        if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
            // Rewrite /login to /dashboard/login, / to /dashboard, etc.
            if (pathname === '/') {
                url.pathname = '/dashboard';
            } else {
                url.pathname = `/dashboard${pathname}`;
            }
            return NextResponse.rewrite(url);
        }
    } else {
        // Main domain - block access to /dashboard routes directly
        // They should only be accessible via dashboard subdomain
        if (url.pathname.startsWith('/dashboard')) {
            // Check if it's the dashboard main domain access - redirect to subdomain?
            // For now, redirect to homepage or let it fall through if we wanted to allow direct access with auth.
            // But per previous logic, it redirects to /.

            // Allow /dashboard access IF authenticated? No, stick to subdomain pattern for consistency.
            // Redirect to main site homepage
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    const response = NextResponse.next();

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // HSTS - Strict Transport Security (force HTTPS)
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content;");

    return response;
}

export const config = {
    matcher: '/:path*',
};
