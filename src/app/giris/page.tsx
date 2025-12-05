"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Login logic will be implemented here
        console.log("Login attempt:", { email, password });
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                {/* Header - Simplified for Login Page */}
                <header className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
                    <div className="flex justify-center px-4 lg:px-10">
                        <div className="flex w-full max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 py-3 dark:border-white/10">
                            <Link href="/" className="flex items-center gap-4 text-secondary dark:text-white">
                                <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-16 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                            </Link>
                            <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex">
                                <Link href="/" className="text-sm font-bold text-secondary hover:text-primary">Ana Sayfa</Link>
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center py-12">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-secondary">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-secondary dark:text-white">Üye Girişi</h1>
                            <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">Hesabınıza giriş yapın</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-white">
                                    E-posta Adresi
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                    placeholder="ornek@sirket.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-secondary dark:text-white">
                                    Şifre
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-lg border border-secondary/20 bg-transparent px-4 py-2 text-secondary placeholder-secondary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-secondary/20 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary dark:text-white">
                                        Beni Hatırla
                                    </label>
                                </div>
                                <Link href="/sifremi-unuttum" className="text-sm font-medium text-primary hover:underline">
                                    Şifremi Unuttum
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-primary py-3 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90"
                            >
                                Giriş Yap
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-secondary/60 dark:text-white/60">
                            Hesabınız yok mu?{" "}
                            <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
                                Kayıt Ol
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="bg-secondary py-6 text-center text-sm text-white/60">
                    <p>© 2024 Federal Gaz. Tüm hakları saklıdır.</p>
                </footer>
            </div>
        </div>
    );
}
