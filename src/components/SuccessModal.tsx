"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    autoCloseDelay?: number;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title,
    message,
    autoCloseDelay = 4000
}: SuccessModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Trigger Confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999 // Above modal
            });

            // Fire a second burst for better effect
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    zIndex: 9999
                });
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    zIndex: 9999
                });
            }, 250);

            if (autoCloseDelay > 0) {
                const timer = setTimeout(() => {
                    onClose();
                }, autoCloseDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, onClose, autoCloseDelay]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-secondary">
                    {/* Success Icon with Animation */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg animate-pulse">
                        <svg
                            className="h-10 w-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 text-center text-2xl font-bold text-secondary dark:text-white">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="mb-6 text-center text-secondary/70 dark:text-white/70">
                        {message}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all ease-linear"
                            style={{
                                width: '100%',
                                animation: `shrink ${autoCloseDelay}ms linear forwards`
                            }}
                        />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-bold text-white transition-all hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-[0.98]"
                    >
                        Tamam
                    </button>
                </div>
            </div>

            {/* CSS Keyframes */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `
            }} />
        </div>
    );
}
