"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to send OTP");
            }

            setStep("otp");
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Invalid OTP");
            }

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="flex flex-col items-center gap-4 text-[#1a100f] dark:text-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold tracking-[-0.015em]">Federal Gaz</h2>
                    </div>
                </div>
                <div className="w-full bg-white dark:bg-background-dark dark:border dark:border-gray-700/50 rounded-xl shadow-sm p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-[#1a100f] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                            {step === "email" ? "Üye Girişi" : "OTP Doğrulama"}
                        </p>
                        <p className="text-[#8f5a56] dark:text-gray-400 text-base font-normal leading-normal">
                            {step === "email"
                                ? "Hesabınıza giriş yapmak için e-posta adresinizi girin."
                                : "E-posta adresinize gönderilen kodu girin."}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {step === "email" ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <label className="flex flex-col flex-1">
                                <p className="text-[#1a100f] dark:text-gray-200 text-sm font-medium leading-normal pb-2">E-posta</p>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1a100f] dark:text-white focus:outline-0 focus:ring-0 border border-[#e4d4d2] dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-[#8f5a56] dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                                    placeholder="E-posta adresinizi girin"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <span className="truncate">{loading ? "Gönderiliyor..." : "Kod Gönder"}</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <label className="flex flex-col flex-1">
                                <p className="text-[#1a100f] dark:text-gray-200 text-sm font-medium leading-normal pb-2">OTP Kodu</p>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1a100f] dark:text-white focus:outline-0 focus:ring-0 border border-[#e4d4d2] dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-[#8f5a56] dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                                    placeholder="6 haneli kodu girin"
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <span className="truncate">{loading ? "Doğrulanıyor..." : "Giriş Yap"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-center text-sm text-primary hover:underline"
                            >
                                Geri Dön
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
