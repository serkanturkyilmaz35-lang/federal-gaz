"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEncryption } from "@/context/EncryptionContext";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useSettings } from "@/context/SettingsContext";
import { parseIcon } from "@/utils/iconUtils";

// Default translations (fallback)
const defaultTranslations = {
    TR: {
        title: "Üye Girişi",
        subtitle: "Hesabınıza giriş yapın",
        email: "E-posta Adresi",
        emailPlaceholder: "ornek@sirket.com",
        password: "Şifre",
        passwordPlaceholder: "••••••••",
        rememberMe: "Beni Hatırla",
        forgotPassword: "Şifremi Unuttum",
        loginBtn: "Giriş Yap",
        noAccount: "Hesabınız yok mu?",
        register: "Kayıt Ol",
        error: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
        wrongPassword: "Şifre yanlış. Lütfen tekrar deneyin.",
        loggingIn: "Giriş yapılıyor...",
        notRegistered: "Bu e-posta adresi kayıtlı değil. Kayıt sayfasına yönlendiriliyorsunuz...",
        dbError: "Sunucu bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin."
    },
    EN: {
        title: "Member Login",
        subtitle: "Login to your account",
        email: "Email Address",
        emailPlaceholder: "example@company.com",
        password: "Password",
        passwordPlaceholder: "••••••••",
        rememberMe: "Remember Me",
        forgotPassword: "Forgot Password",
        loginBtn: "Login",
        noAccount: "Don't have an account?",
        register: "Register",
        error: "Login failed. Please check your credentials.",
        wrongPassword: "Wrong password. Please try again.",
        loggingIn: "Logging in...",
        notRegistered: "This email is not registered. Redirecting to registration...",
        dbError: "Server connection failed. Please try again later."
    }
};

interface FormField {
    key: string;
    label: string;
    placeholder: string;
    required: string;
    visible: string;
}

interface CMSContent {
    header?: { title?: string; subtitle?: string };
    formFields?: { fields?: FormField[] };
    labels?: {
        rememberMe?: string;
        forgotPassword?: string;
        loginButton?: string;
        loggingIn?: string;
        noAccount?: string;
        registerLink?: string;
    };
}

export default function LoginPage() {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const { login } = useAuth();
    const router = useRouter();
    const { secureFetch, isReady } = useEncryption();
    const { executeRecaptcha } = useRecaptcha();

    const [content, setContent] = useState<CMSContent>({});
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch CMS content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/dashboard/page-content?slug=/giris&language=${language}`);
                if (res.ok) {
                    const data = await res.json();
                    const contentObj: CMSContent = {};
                    data.sections?.forEach((section: { key: string; content: object }) => {
                        contentObj[section.key as keyof CMSContent] = section.content as CMSContent[keyof CMSContent];
                    });
                    setContent(contentObj);
                }
            } catch (err) {
                console.error('Error fetching CMS content:', err);
            }
        };
        fetchContent();
    }, [language]);

    // Merge CMS content with defaults
    const t = defaultTranslations[language];
    const header = content.header || {};
    const labels = content.labels || {};
    const formFields = content.formFields?.fields || [];

    // Get field config by key
    const getField = (key: string) => {
        return formFields.find(f => f.key === key) || null;
    };

    const emailField = getField('email');
    const passwordField = getField('password');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const recaptchaToken = await executeRecaptcha('login');

            const res = await secureFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, recaptchaToken })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.user);
                if (data.user?.role === 'admin' || data.user?.role === 'editor') {
                    router.push('/dashboard');
                } else {
                    router.push('/');
                }
            } else {
                const data = await res.json();
                if (res.status === 404) {
                    setError(t.notRegistered);
                    setTimeout(() => router.push('/kayit-ol'), 2000);
                } else {
                    setError(data.error || t.error);
                }
            }
        } catch (err: unknown) {
            console.error("Login failed:", err);
            setError(t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary">
                <div className="mb-8 text-center">
                    {/* Optional Icon */}
                    {settings?.auth_icon_login && (
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10" style={{ backgroundColor: parseIcon(settings.auth_icon_login).color ? `${parseIcon(settings.auth_icon_login).color}20` : undefined }}>
                            <span className="material-symbols-outlined text-3xl text-primary" style={{ color: parseIcon(settings.auth_icon_login).color }}>
                                {parseIcon(settings.auth_icon_login).name}
                            </span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-secondary dark:text-white">
                        {header.title || t.title}
                    </h1>
                    <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">
                        {header.subtitle || t.subtitle}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    {(!emailField || emailField.visible !== 'false') && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-white">
                                {emailField?.label || t.email}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={!emailField || emailField.required !== 'false'}
                                className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                placeholder={emailField?.placeholder || t.emailPlaceholder}
                            />
                        </div>
                    )}

                    {/* Password Field */}
                    {(!passwordField || passwordField.visible !== 'false') && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary dark:text-white">
                                {passwordField?.label || t.password}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!passwordField || passwordField.required !== 'false'}
                                    className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 pr-10 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                    placeholder={passwordField?.placeholder || t.passwordPlaceholder}
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
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-gray-500">
                        © 2014 Federal Gaz. {language === 'TR' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-secondary/20 text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary dark:text-white">
                                {labels.rememberMe || t.rememberMe}
                            </label>
                        </div>
                        <Link href="/sifremi-unuttum" className="text-sm font-medium text-primary hover:underline">
                            {labels.forgotPassword || t.forgotPassword}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isReady}
                        className="w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLoading ? (labels.loggingIn || t.loggingIn) : (!isReady ? (language === 'TR' ? 'Güvenlik Hazırlanıyor...' : 'Securing...') : (labels.loginButton || t.loginBtn))}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary/60 dark:text-white/60">
                    {labels.noAccount || t.noAccount}{" "}
                    <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
                        {labels.registerLink || t.register}
                    </Link>
                </div>
            </div>
        </div>
    );
}
