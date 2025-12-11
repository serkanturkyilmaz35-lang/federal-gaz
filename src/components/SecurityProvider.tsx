"use client";

import { useEffect } from "react";

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                e.code === "F12" ||
                e.keyCode === 123 ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.code === "KeyI" || e.keyCode === 73)) ||
                (e.ctrlKey && e.shiftKey && (e.key === "J" || e.code === "KeyJ" || e.keyCode === 74)) ||
                (e.ctrlKey && (e.key === "U" || e.code === "KeyU" || e.keyCode === 85)) ||
                (e.metaKey && e.altKey && (e.key === "i" || e.code === "KeyI" || e.keyCode === 73)) || // Mac Cmd+Opt+I
                (e.metaKey && e.altKey && (e.key === "j" || e.code === "KeyJ" || e.keyCode === 74)) || // Mac Cmd+Opt+J
                (e.metaKey && e.altKey && (e.key === "c" || e.code === "KeyC" || e.keyCode === 67)) || // Mac Cmd+Opt+C (Console)
                (e.metaKey && e.shiftKey && (e.key === "c" || e.code === "KeyC" || e.keyCode === 67))   // Mac Cmd+Shift+C (Inspect Element)
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        // Aggressively disable right click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };

        const handleAuxClick = (e: MouseEvent) => {
            if (e.button === 2) { // Right click
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
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
        }

        // Add listeners with capture to handle event before it reaches other elements
        document.addEventListener("contextmenu", handleContextMenu, true);
        document.addEventListener("auxclick", handleAuxClick, true);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu, true);
            document.removeEventListener("auxclick", handleAuxClick, true);
            document.removeEventListener("keydown", handleKeyDown, true);
        };

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return <>{children}</>;
}
