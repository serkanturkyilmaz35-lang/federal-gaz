"use client";

import { useEffect } from "react";

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.shiftKey && e.key === "J") ||
                (e.ctrlKey && e.key === "U") ||
                (e.metaKey && e.altKey && e.key === "i") // Mac
            ) {
                e.preventDefault();
            }
        };

        // Console warning
        if (process.env.NODE_ENV === 'production') {
            console.log(
                "%cDur!",
                "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;"
            );
            console.log(
                "%cBu alan geliştiriciler içindir. Buraya herhangi bir kod yapıştırmak hesabınızın çalınmasına neden olabilir.",
                "font-size: 20px;"
            );

            // Attempt to clear console repeatedly (aggressive but requested)
            // setInterval(() => {
            //   console.clear();
            // }, 1000);
        }

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return <>{children}</>;
}
