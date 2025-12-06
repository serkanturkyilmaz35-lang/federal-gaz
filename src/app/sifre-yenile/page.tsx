"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Yeni Şifre Belirle",
        subtitle: "Hesabınız için yeni şifrenizi girin",
        password: "Yeni Şifre",
        confirmPassword: "Şifre Tekrar",
        passwordHint: "Şifre: En az 6 karakter, 1 büyük harf, 1 özel karakter",
        submit: "Şifreyi Güncelle",
        updating: "Güncelleniyor...",
        success: "Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...",
        error: "Şifre güncellenirken bir hata oluştu.",
        passwordMismatch: "Şifreler eşleşmiyor.",
        invalidToken: "Geçersiz veya süresi dolmuş bağlantı.",
        backToLogin: "Giriş Sayfasına Dön",
        loading: "Yükleniyor..."
    },
    EN: {
        title: "Set New Password",
        subtitle: "Enter your new password",
        password: "New Password",
        confirmPassword: "Confirm Password",
        passwordHint: "Password: Min 6 chars, 1 uppercase, 1 special char",
        submit: "Update Password",
        updating: "Updating...",
        success: "Password updated successfully! Redirecting to login...",
        error: "An error occurred while updating password.",
        passwordMismatch: "Passwords do not match.",
        invalidToken: "Invalid or expired link.",
        backToLogin: "Back to Login",
        loading: "Loading..."
    }
};

function ResetPasswordForm() {
    const { language } = useLanguage();
    const t = translations[language];
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t.passwordMismatch);
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/giris");
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || t.error);
            }
        } catch (err) {
            setError(t.error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-1 items-center justify-center py-12">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-xl font-bold text-secondary dark:text-white mb-4">{t.invalidToken}</h1>
                    <Link href="/giris" className="text-primary hover:underline font-medium">
                        {t.backToLogin}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-secondary dark:text-white">{t.title}</h1>
                    <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">{t.subtitle}</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-green-600 dark:text-green-400 font-medium">{t.success}</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary dark:text-white">
                                    {t.password}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 pr-10 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary dark:text-white/50 dark:hover:text-white"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-secondary/50 dark:text-white/50">{t.passwordHint}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary dark:text-white">
                                    {t.confirmPassword}
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-70"
                            >
                                {isLoading ? t.updating : t.submit}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/giris" className="text-sm text-primary hover:underline">
                                {t.backToLogin}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-1 items-center justify-center py-12">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary text-center">
                    <div className="animate-spin text-4xl">⏳</div>
                    <p className="mt-4 text-secondary dark:text-white">Yükleniyor...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
