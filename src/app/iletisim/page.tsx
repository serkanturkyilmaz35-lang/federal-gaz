"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SuccessModal from "@/components/SuccessModal";

const translations = {
    TR: {
        title: "İletişim",
        subtitle: "Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.",
        infoTitle: "İletişim Bilgilerimiz",
        addressTitle: "Adres",
        address: "İvedik OSB, 1550. Cad. No:1\n06378 Yenimahalle/Ankara",
        phoneTitle: "Telefon",
        gsmTitle: "GSM",
        emailTitle: "E-posta",
        formTitle: "Mesaj Gönderin",
        formName: "Ad Soyad",
        formNamePlaceholder: "Adınız Soyadınız",
        formEmail: "E-posta",
        formEmailPlaceholder: "ornek@email.com",
        formPhone: "Telefon",
        formPhonePlaceholder: "+90 (5XX) XXX XX XX",
        formMessage: "Mesajınız",
        formMessagePlaceholder: "Mesajınızı buraya yazın...",
        sendBtn: "Gönder",
        sending: "Gönderiliyor...",
        getDirections: "Yol Tarifi Al",
        successTitle: "Mesajınız Gönderildi!",
        successMessage: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız."
    },
    EN: {
        title: "Contact",
        subtitle: "Contact us, we will be happy to assist you.",
        infoTitle: "Contact Information",
        addressTitle: "Address",
        address: "İvedik OSB, 1550. Cad. No:1\n06378 Yenimahalle/Ankara (Turkey)",
        phoneTitle: "Phone",
        gsmTitle: "GSM",
        emailTitle: "Email",
        formTitle: "Send Message",
        formName: "Full Name",
        formNamePlaceholder: "Your Full Name",
        formEmail: "Email",
        formEmailPlaceholder: "example@email.com",
        formPhone: "Phone",
        formPhonePlaceholder: "+90 (5XX) XXX XX XX",
        formMessage: "Your Message",
        formMessagePlaceholder: "Write your message here...",
        sendBtn: "Send",
        sending: "Sending...",
        getDirections: "Get Directions",
        successTitle: "Message Sent!",
        successMessage: "Your message has been sent successfully. We will get back to you shortly."
    }
};

export default function IletisimPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowSuccess(true);
                setFormData({ name: '', email: '', phone: '', message: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-bold text-secondary dark:text-white">{t.infoTitle}</h2>
                            <div className="mt-8 space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <span className="material-symbols-outlined text-2xl text-primary">location_on</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary dark:text-white">{t.addressTitle}</h3>
                                        <p className="mt-1 whitespace-pre-line text-secondary/70 dark:text-white/60">
                                            {t.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <span className="material-symbols-outlined text-2xl text-primary">phone</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary dark:text-white">{t.phoneTitle}</h3>
                                        <p className="mt-1 text-secondary/70 dark:text-white/60">
                                            <a href="tel:+903123953595" className="hover:text-primary transition-colors">(0312) 395 35 95</a>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <span className="material-symbols-outlined text-2xl text-primary">smartphone</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary dark:text-white">{t.gsmTitle}</h3>
                                        <p className="mt-1 text-secondary/70 dark:text-white/60">
                                            <a href="tel:+905434554563" className="hover:text-primary transition-colors">(+90) 543 455 45 63</a> - Ziya Türkyılmaz<br />
                                            <a href="tel:+905324224515" className="hover:text-primary transition-colors">(+90) 532 422 45 15</a> - Bayram Tıraş
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <span className="material-symbols-outlined text-2xl text-primary">mail</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary dark:text-white">{t.emailTitle}</h3>
                                        <p className="mt-1 text-secondary/70 dark:text-white/60">
                                            <a href="mailto:federal.gaz@hotmail.com" className="hover:text-primary transition-colors">federal.gaz@hotmail.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Map and Directions */}
                            <div className="mt-8">
                                <div className="overflow-hidden rounded-xl shadow-md">
                                    <iframe
                                        src="https://maps.google.com/maps?q=Ivedik%20OSB%2C%20Yenimahalle%2C%20Ankara&t=&z=14&ie=UTF8&iwloc=&output=embed"
                                        width="100%"
                                        height="400"
                                        style={{ border: 0, aspectRatio: '1/1' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Maps"
                                    ></iframe>
                                </div>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Ivedik+OSB+1550.+Cad.+No:1+Yenimahalle+Ankara"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90"
                                >
                                    <span className="material-symbols-outlined">directions</span>
                                    <span>{t.getDirections}</span>
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col rounded-xl bg-white p-8 shadow-md dark:bg-background-dark">
                            <h2 className="text-2xl font-bold text-secondary dark:text-white">{t.formTitle}</h2>
                            <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.formName}</label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={t.formNamePlaceholder}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.formEmail}</label>
                                    <input
                                        type="email"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={t.formEmailPlaceholder}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.formPhone}</label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={t.formPhonePlaceholder}
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.formMessage}</label>
                                    <textarea
                                        className="mt-1 flex-1 resize-none rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        style={{ minHeight: '200px' }}
                                        placeholder={t.formMessagePlaceholder}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {isLoading ? t.sending : t.sendBtn}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title={t.successTitle}
                message={t.successMessage}
            />
        </>
    );
}

