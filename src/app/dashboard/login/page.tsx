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
    const [timeLeft, setTimeLeft] = useState(0); // Timer state
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
            setTimeLeft(120); // Start 2 minute timer
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

    // ... (Existing OTP Handler functions: handleOtpChange, handleOtpKeyDown, handleOtpPaste)
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
                <header className="flex items-center justify-between px-6 py-4 sm:px-8">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.location.reload()}
                    >
                        <img
                            src="/dashboard-logo.png"
                            alt="Federal Gaz Logo"
                            className="h-12 w-12 object-contain"
                        />
                        <span className="text-lg font-bold text-[#ece6e4]">Federal Gaz</span>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center p-4 overflow-hidden">
                    <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-xl bg-[#1C2127] shadow-lg overflow-hidden">
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

                        <div className="flex w-full flex-col items-center gap-4 p-6">
                            <div className="flex w-full flex-col gap-2 text-center">
                                <p className="text-2xl font-black leading-tight tracking-[-0.033em] text-white">
                                    Yönetim Paneline Hoş Geldiniz
                                </p>
                                <p className="text-sm font-normal leading-normal text-[#ece6e4]/80">
                                    Giriş yapmak için e-posta adresinizi girin ve size gönderilecek olan kodu kullanın.
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#ece6e4]">E-posta Adresi</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@federalgaz.com"
                                        disabled={loading}
                                        className={`w-full rounded-lg border bg-[#111418] p-3 text-white placeholder:text-[#9dabb9] focus:outline-none focus:ring-1 focus:ring-[#137fec] ${otpSent ? 'border-[#137fec]' : 'border-[#3b4754]'
                                            }`}
                                        onKeyDown={(e) => !otpSent && e.key === "Enter" && handleRequestOtp()}
                                        autoFocus
                                    />
                                </div>

                                {/* Send Code Button */}
                                <button
                                    onClick={handleRequestOtp}
                                    disabled={loading || (otpSent && timeLeft > 0)}
                                    className={`w-full rounded-lg p-3 font-bold text-white transition-colors disabled:opacity-50 ${otpSent ? 'bg-[#3b4754] hover:bg-[#3b4754]/90' : 'bg-[#b13329] hover:bg-[#b13329]/90'
                                        }`}
                                >
                                    {loading ? "İşleniyor..." : otpSent ? (timeLeft > 0 ? `Tekrar Gönder (${timeLeft})` : "Tekrar Kod Gönder") : "OTP Gönder"}
                                </button>

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-[#3b4754]"></span>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#1C2127] px-2 text-gray-500">
                                            OTP KODUNU GİRİN
                                            {otpSent && timeLeft > 0 && <span className="ml-2 text-[#137fec]">({formatTime(timeLeft)})</span>}
                                        </span>
                                    </div>
                                </div>

                                {/* OTP Inputs */}
                                <div className={`flex justify-center gap-2 transition-opacity duration-300 ${otpSent ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            disabled={!otpSent}
                                            className="h-12 w-12 rounded-lg border border-[#3b4754] bg-[#111418] text-center text-xl font-bold text-white focus:border-[#137fec] focus:outline-none focus:ring-1 focus:ring-[#137fec] disabled:cursor-not-allowed"
                                        />
                                    ))}
                                </div>

                                {/* Login Button */}
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={!otpSent || loading}
                                    className={`w-full rounded-lg p-3 font-bold transition-colors ${otpSent ? 'bg-white text-[#111418] hover:bg-gray-100' : 'bg-[#737373] text-[#1C2127] cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                </button>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500 w-full text-center">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
