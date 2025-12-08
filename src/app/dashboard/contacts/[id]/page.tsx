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
        const fetchContact = async () => {
            try {
                const res = await fetch(`/api/contacts/${contactId}`);
                const data = await res.json();

                if (data.success && data.contact) {
                    const c = data.contact;
                    // Map database status to UI status
                    let uiStatus: ContactStatus = "unread";
                    if (c.status === "replied") uiStatus = "replied";
                    else if (c.status === "read") uiStatus = "read";

                    setContact({
                        id: c.id,
                        name: c.name,
                        email: c.email,
                        phone: c.phone,
                        company: c.company,
                        subject: c.company ? `${c.company} - İletişim` : "İletişim Formu",
                        message: c.message,
                        status: uiStatus,
                        createdAt: new Date(c.createdAt).toLocaleString('tr-TR'),
                    });

                    // Mark as read if it was new/unread
                    if (c.status === "new" || c.status === "unread") {
                        await fetch(`/api/contacts/${contactId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "read" })
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch contact:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
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
            {/* Print Header - Only visible during printing */}
            <div className="print-header hidden">
                <img src="/dashboard-logo.png" alt="Federal Gaz" />
                <div className="print-brand">
                    <h2>Federal Gaz</h2>
                    <span style={{ fontSize: '8pt', color: '#666' }}>Teknik ve Tıbbi Gaz Tedarikçiniz</span>
                </div>
                <div className="print-title">
                    <h1>Talep Detayı - {contact.subject}</h1>
                    <p>Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            {/* Print Footer - Only visible during printing */}
            <div className="print-footer hidden">
                www.federalgaz.com | federal.gaz@hotmail.com | Tel: (0312) 395 35 95
            </div>

            {/* Compact Header */}
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-3xl font-bold text-white">{contact.subject}</h1>
                    {getStatusBadge(contact.status)}
                    <span className="text-sm text-gray-500">{contact.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-gray-600 no-print"
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Yazdır
                    </button>
                    <Link
                        href="/dashboard/quotes"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700 no-print"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Geri Dön
                    </Link>
                </div>
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
