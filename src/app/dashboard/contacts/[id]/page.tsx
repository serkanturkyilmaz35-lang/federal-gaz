"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ContactStatus = "unread" | "read" | "replied";

interface ContactDetail {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    status: ContactStatus;
    createdAt: string;
}

export default function ContactDetailPage() {
    const params = useParams();
    const contactId = params.id as string;

    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        setTimeout(() => {
            setContact({
                id: parseInt(contactId),
                name: "Murat Özkan",
                email: "murat@example.com",
                phone: "0532 987 65 43",
                company: "Özkan Makina Ltd.",
                subject: "Fiyat Teklifi",
                message: "Merhaba,\n\nŞirketimiz için endüstriyel gaz ihtiyacımız bulunmaktadır. Oksijen tüpü (50L) - Aylık 20 adet, Argon tüpü (40L) - Aylık 10 adet için fiyat teklifi alabilir miyim?\n\nTeşekkürler,\nMurat Özkan",
                status: "unread",
                createdAt: "15.12.2024 10:45",
            });
            setLoading(false);
        }, 300);
    }, [contactId]);

    const handleSendReply = async () => {
        if (!contact || !replyText.trim()) {
            setError("Lütfen yanıt mesajı yazın");
            return;
        }

        setSending(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`/api/contacts/${contact.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reply: replyText,
                    customerEmail: contact.email,
                    customerName: contact.name,
                    originalSubject: contact.subject,
                }),
            });

            if (response.ok) {
                setSuccess("Yanıt başarıyla gönderildi!");
                setContact({ ...contact, status: "replied" });
                setReplyText("");
            } else {
                setError("Yanıt gönderilirken bir hata oluştu");
            }
        } catch {
            setError("Bir hata oluştu");
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status: ContactStatus) => {
        const styles = {
            unread: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Okunmadı" },
            read: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Okundu" },
            replied: { bg: "bg-green-500/20", text: "text-green-400", label: "Yanıtlandı" },
        };
        const style = styles[status];
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {style.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Yükleniyor...</div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-400">İletişim formu bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Compact Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/orders" className="text-[#9dabb9] hover:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-white">{contact.subject}</h1>
                    <span className="text-sm text-[#9dabb9]">• {contact.createdAt}</span>
                </div>
                {getStatusBadge(contact.status)}
            </div>

            {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>
            )}
            {success && (
                <div className="mb-3 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">{success}</div>
            )}

            {/* Main Content - Single Card */}
            <div className="bg-[#111418] rounded-xl p-5">
                {/* Sender Info - Compact Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">Gönderen</p>
                        <p className="text-white text-sm font-medium">{contact.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">E-posta</p>
                        <p className="text-white text-sm">{contact.email}</p>
                    </div>
                    {contact.phone && (
                        <div>
                            <p className="text-xs text-[#9dabb9] mb-1">Telefon</p>
                            <p className="text-white text-sm">{contact.phone}</p>
                        </div>
                    )}
                    {contact.company && (
                        <div>
                            <p className="text-xs text-[#9dabb9] mb-1">Şirket</p>
                            <p className="text-white text-sm">{contact.company}</p>
                        </div>
                    )}
                </div>

                <hr className="border-[#3b4754] mb-4" />

                {/* Message */}
                <div className="mb-4">
                    <p className="text-xs text-[#9dabb9] mb-2">Mesaj</p>
                    <div className="bg-[#1c2127] rounded-lg p-3">
                        <p className="text-white text-sm whitespace-pre-line leading-relaxed">{contact.message}</p>
                    </div>
                </div>

                <hr className="border-[#3b4754] mb-4" />

                {/* Reply Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">Yanıt Gönder</p>
                        <p className="text-xs text-[#9dabb9]">→ {contact.email}</p>
                    </div>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Yanıtınızı buraya yazın..."
                        rows={4}
                        className="w-full rounded-lg border border-[#3b4754] bg-[#1c2127] px-3 py-2 text-white text-sm placeholder:text-[#9dabb9] focus:border-[#137fec] focus:outline-none resize-none"
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleSendReply}
                            disabled={sending || !replyText.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#137fec] text-white text-sm font-medium hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-base">send</span>
                            {sending ? "Gönderiliyor..." : "Yanıtı Gönder"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
