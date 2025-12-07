"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardLoginPage() {
    // Set dashboard title
    useEffect(() => {
        document.title = "Federal Gaz - Yönetim Paneli";
    }, []);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleRequestOtp = async () => {
        if (!email) {
            setError("Lütfen e-posta adresinizi girin");
            return;
        }
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
                throw new Error(data.error || "OTP gönderilemedi");
            }

            setOtpSent(true);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Lütfen 6 haneli kodu girin");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Geçersiz OTP kodu");
            }

            router.push("/dashboard");
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-[#292828] font-display overflow-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* Header - Logo only, no user info */}
                <header className="flex items-center justify-between px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        {/* Site Logo - high resolution */}
                        <img
                            src="/dashboard-logo.png"
                            alt="Federal Gaz Logo"
                            className="h-12 w-12 object-contain"
                        />
                        <span className="text-lg font-bold text-[#ece6e4]">Federal Gaz</span>
                    </div>
                    {/* No user info - not logged in */}
                </header>

                {/* Main Content */}
                <main className="flex flex-1 items-center justify-center p-4 overflow-hidden">
                    <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-xl bg-[#1C2127] shadow-lg overflow-hidden">
                        {/* Banner Image - User's provided image */}
                        <div className="w-full aspect-[3/1] overflow-hidden rounded-t-xl">
                            <Image
                                src="/dashboard-banner.png"
                                alt="Dashboard Banner"
                                width={512}
                                height={256}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>

                        {/* Form Content */}
                        <div className="flex w-full flex-col items-center gap-4 p-6">
                            <div className="flex w-full flex-col gap-2 text-center">
                                <p className="text-2xl font-black leading-tight tracking-[-0.033em] text-white">
                                    Yönetim Paneline Hoş Geldiniz
                                </p>
                                <p className="text-sm font-normal leading-normal text-[#ece6e4]/80">
                                    Giriş yapmak için e-posta adresinizi girin ve size gönderilecek olan kodu kullanın.
                                </p>
                            </div>

                            {error && (
                                <div className="w-full max-w-md bg-red-900/30 text-red-400 p-3 rounded-lg text-sm text-center border border-red-500/30">
                                    {error}
                                </div>
                            )}

                            <div className="w-full max-w-md space-y-4">
                                <label className="flex flex-col flex-1">
                                    <p className="text-sm font-medium leading-normal pb-1 text-white">
                                        E-posta Adresi
                                    </p>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@federalgaz.com"
                                        style={{ height: '56px', minHeight: '56px' }}
                                        className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg border border-[#94847c]/50 bg-transparent px-4 text-base font-normal leading-normal text-white placeholder:text-[#94847c] focus:border-[#b13329] focus:outline-0 focus:ring-0"
                                    />
                                </label>

                                {/* OTP Gönder Button - Red */}
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={handleRequestOtp}
                                        disabled={loading || !email}
                                        className="flex h-14 min-w-[84px] max-w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#b13329] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-[#b13329]/90 disabled:opacity-50"
                                    >
                                        <span className="truncate">
                                            {loading && !otpSent ? "Gönderiliyor..." : otpSent ? "OTP Tekrar Gönder" : "OTP Gönder"}
                                        </span>
                                    </button>
                                </div>

                                {/* OTP Divider */}
                                <div className="relative flex items-center">
                                    <div className="flex-grow border-t border-[#94847c]/30" />
                                    <span className="mx-4 flex-shrink text-sm text-[#94847c]">
                                        OTP Kodunu Girin
                                    </span>
                                    <div className="flex-grow border-t border-[#94847c]/30" />
                                </div>

                                {/* OTP Input Fields */}
                                <div className="flex flex-col items-center gap-3">
                                    <fieldset className="relative flex gap-2 sm:gap-4">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => { inputRefs.current[index] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={handleOtpPaste}
                                                className="flex h-14 w-10 text-center text-lg font-semibold text-white [appearance:textfield] focus:outline-0 focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none rounded-md border border-[#94847c]/50 bg-transparent focus:border-[#b13329]"
                                            />
                                        ))}
                                    </fieldset>

                                    {/* Giriş Yap Button - WHITE background */}
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={loading || otp.join("").length !== 6}
                                        className="flex h-12 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white px-5 text-base font-bold leading-normal tracking-[0.015em] text-[#292828] transition-colors hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <span className="truncate">
                                            {loading && otpSent ? "Doğrulanıyor..." : "Giriş Yap"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 text-center">
                    <p className="text-xs text-[#94847c]">
                        © 2014 Federal Gaz. Tüm hakları saklıdır.
                    </p>
                </footer>
            </div>
        </div>
    );
}
