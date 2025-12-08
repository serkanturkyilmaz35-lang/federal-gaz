"use client";

import { useRouter } from "next/navigation";

interface AuthChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGuestContinue: () => void;
}

export default function AuthChoiceModal({
    isOpen,
    onClose,
    onGuestContinue
}: AuthChoiceModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">
                            person
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-white">
                        Nasıl Devam Etmek İstersiniz?
                    </h2>

                    {/* Message */}
                    <p className="mb-8 text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                        Siparişinizi tamamlamak için üye girişi yapabilir veya üyeliksiz devam edebilirsiniz.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/giris?redirect=/siparis')}
                            className="w-full rounded-xl bg-primary py-3.5 font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">login</span>
                            Üye Girişi Yap
                        </button>

                        <button
                            onClick={onGuestContinue}
                            className="w-full rounded-xl bg-white border-2 border-gray-200 py-3.5 font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 active:scale-[0.98]"
                        >
                            Üyeliksiz Devam Et
                        </button>
                    </div>

                    {/* Close Link */}
                    <button
                        onClick={onClose}
                        className="mt-4 w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all decoration-2 hover:underline"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>
    );
}
