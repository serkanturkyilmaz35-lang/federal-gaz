"use client";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export default function WarningModal({
    isOpen,
    onClose,
    title,
    message
}: WarningModalProps) {
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
                <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-red-100 dark:border-red-900/30">
                    {/* Warning Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 animate-pulse">
                        <svg
                            className="h-10 w-10 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-white">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="mb-8 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
                    >
                        Anlaşıldı
                    </button>
                </div>
            </div>
        </div>
    );
}
