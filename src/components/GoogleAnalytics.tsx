"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

function GoogleAnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== "undefined" && window.gtag) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

            // Send page_view event on route change
            window.gtag("event", "page_view", {
                page_path: url,
                page_location: window.location.href,
                page_title: document.title,
            });

            // Debug log
            console.log("GA4: Page view tracked:", url);
        }
    }, [pathname, searchParams]);

    return null;
}

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
    return (
        <>
            {/* Google Analytics Script */}
            <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${measurementId}', {
                            send_page_view: false
                        });
                    `,
                }}
            />
            {/* SPA Route Change Tracker */}
            <Suspense fallback={null}>
                <GoogleAnalyticsTracker />
            </Suspense>
        </>
    );
}
