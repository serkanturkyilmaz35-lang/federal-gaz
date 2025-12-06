"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Şifremi Unuttum",
        subtitle: "E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.",
        email: "E-posta Adresi",
        emailPlaceholder: "ornek@sirket.com",
        submitBtn: "Şifre Sıfırlama Bağlantısı Gönder",
        sending: "Gönderiliyor...",
        success: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.",
        error: "Bir hata oluştu. Lütfen tekrar deneyin.",
        backToLogin: "Giriş Sayfasına Dön",
        rememberPassword: "Şifrenizi hatırladınız mı?"
    },
    EN: {
        title: "Forgot Password",
        subtitle: "Enter your email address and we'll send you a password reset link.",
        email: "Email Address",
        emailPlaceholder: "example@company.com",
        submitBtn: "Send Password Reset Link",
        sending: "Sending...",
        success: "Password reset link has been sent to your email address. Please check your inbox.",
        error: "An error occurred. Please try again.",
        backToLogin: "Back to Login",
        rememberPassword: "Remember your password?"
    }
};

export default function ForgotPasswordPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error('Failed to send reset link');
            }

            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-secondary dark:text-white">{t.title}</h1>
                    <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">{t.subtitle}</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center">
                        <div className="mb-6 rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                                <span className="material-symbols-outlined text-2xl text-white">check</span>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">{t.success}</p>
                        </div>
                        <Link
                            href="/giris"
                            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            {t.backToLogin}
                        </Link>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-white">
                                    {t.email}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                    placeholder={t.emailPlaceholder}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? t.sending : t.submitBtn}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-secondary/60 dark:text-white/60">
                            {t.rememberPassword}{" "}
                            <Link href="/giris" className="font-medium text-primary hover:underline">
                                {t.backToLogin}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
