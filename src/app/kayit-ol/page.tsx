"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEncryption } from "@/context/EncryptionContext";

const translations = {
    TR: {
        title: "Kayıt Ol",
        subtitle: "Federal Gaz dünyasına katılın",
        name: "Ad Soyad",
        email: "E-posta Adresi",
        password: "Şifre",
        phone: "Telefon Numarası",
        registerBtn: "Kayıt Ol",
        hasAccount: "Zaten hesabınız var mı?",
        login: "Giriş Yap",
        error: "Kayıt başarısız. Lütfen tekrar deneyin.",
        success: "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.",
        registering: "Kaydediliyor...",
        passwordMinLength: "Şifre en az 6 karakter olmalıdır.",
        passwordUppercase: "Şifre en az bir büyük harf içermelidir.",
        passwordSpecialChar: "Şifre en az bir özel karakter içermelidir (!@#$%^&*...).",
        passwordHint: "Şifre: En az 6 karakter, 1 büyük harf, 1 özel karakter",
        confirmPassword: "Şifre Tekrar"
    },
    EN: {
        title: "Register",
        subtitle: "Join the Federal Gaz world",
        name: "Full Name",
        email: "Email Address",
        password: "Password",
        confirmPassword: "Confirm Password",
        phone: "Phone Number",
        registerBtn: "Register",
        hasAccount: "Already have an account?",
        login: "Login",
        error: "Registration failed. Please try again.",
        success: "Registration successful! Redirecting to login...",
        registering: "Registering...",
        passwordMinLength: "Password must be at least 6 characters.",
        passwordUppercase: "Password must contain at least one uppercase letter.",
        passwordSpecialChar: "Password must contain at least one special character (!@#$%^&*...).",
        passwordHint: "Password: Min 6 chars, 1 uppercase, 1 special char"
    }
};

// Password validation function
const validatePassword = (password: string, t: typeof translations.TR): string | null => {
    if (password.length < 6) {
        return t.passwordMinLength;
    }
    if (!/[A-Z]/.test(password)) {
        return t.passwordUppercase;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return t.passwordSpecialChar;
    }
    return null;
};

export default function RegisterPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const router = useRouter();
    const { secureFetch } = useEncryption();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "", // Added confirmPassword
        phone: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        // Validate password before submission
        const passwordError = validatePassword(formData.password, t);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            // t.passwordsMismatch might be missing in interface, using hardcoded fallback or checking translation
            // Assuming translation key might be missing based on lint error "Property passwordsMismatch does not exist"
            // Let's use generic error or add it to standard error
            setError(language === 'TR' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...payload } = formData;

            // Use secureFetch
            const res = await secureFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || (language === 'TR' ? 'Kayıt başarısız.' : 'Registration failed.'));
            }

            setSuccess(t.success);
            setTimeout(() => {
                router.push('/giris');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-secondary dark:text-white">{t.title}</h1>
                    <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">{t.subtitle}</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary dark:text-white">
                            {t.name}
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-white">
                            {t.email}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                            placeholder="example@company.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-secondary dark:text-white">
                            {t.phone}
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                            placeholder="+90 555 123 45 67"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-secondary dark:text-white">
                            {t.password}
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
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
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary dark:text-white">
                            {t.confirmPassword}
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 pr-10 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary dark:text-white/50 dark:hover:text-white"
                            >
                                {showConfirmPassword ? (
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLoading ? t.registering : t.registerBtn}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary/60 dark:text-white/60">
                    {t.hasAccount}{" "}
                    <Link href="/giris" className="font-medium text-primary hover:underline">
                        {t.login}
                    </Link>
                </div>
            </div>
        </div>
    );
}
