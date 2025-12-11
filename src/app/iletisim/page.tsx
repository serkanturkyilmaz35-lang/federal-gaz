"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useEncryption } from "@/context/EncryptionContext";
import SuccessModal from "@/components/SuccessModal";

const translations = {
    TR: {
        title: "İletişim",
        subtitle: "Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.",
        infoTitle: "İletişim Bilgilerimiz",
        addressTitle: "Adres",
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
    const { settings } = useSettings();
    const { secureFetch } = useEncryption();
    const t = translations[language];
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Helper to format phone for href (remove spaces, parens)
    const formatPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await secureFetch('/api/contact', {
                method: 'POST',
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
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {settings.contact_form_title || t.title}
                    </h1>
                    <p className="mt-4 text-lg text-white/80">
                        {settings.contact_form_subtitle || t.subtitle}
                    </p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-bold text-secondary dark:text-white">{t.infoTitle}</h2>
                            <div className="mt-8 space-y-6">
                                {/* Address */}
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <span className="material-symbols-outlined text-2xl text-primary">location_on</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary dark:text-white">{t.addressTitle}</h3>
                                        <p className="mt-1 whitespace-pre-line text-secondary/70 dark:text-white/60">
                                            {settings.contact_address}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone 1 - Merkez */}
                                {settings.contact_phone && (
                                    <div className="flex gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                            <span className="material-symbols-outlined text-2xl text-primary">phone</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary dark:text-white">{t.phoneTitle}</h3>
                                            <p className="mt-1 text-secondary/70 dark:text-white/60">
                                                <a href={`tel:${formatPhone(settings.contact_phone)}`} className="hover:text-primary transition-colors">
                                                    {settings.contact_phone}
                                                </a>
                                                {settings.contact_phone_1_label && (
                                                    <span className="text-xs text-gray-500 ml-2">({settings.contact_phone_1_label})</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* GSM Numbers */}
                                {(settings.contact_phone_2 || settings.contact_phone_3) && (
                                    <div className="flex gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                            <span className="material-symbols-outlined text-2xl text-primary">smartphone</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary dark:text-white">{t.gsmTitle}</h3>
                                            <p className="mt-1 text-secondary/70 dark:text-white/60">
                                                {settings.contact_phone_2 && (
                                                    <>
                                                        <a href={`tel:${formatPhone(settings.contact_phone_2)}`} className="hover:text-primary transition-colors">
                                                            {settings.contact_phone_2}
                                                        </a>
                                                        {settings.contact_phone_2_label && (
                                                            <span className="ml-2">- {settings.contact_phone_2_label}</span>
                                                        )}
                                                        <br />
                                                    </>
                                                )}
                                                {settings.contact_phone_3 && (
                                                    <>
                                                        <a href={`tel:${formatPhone(settings.contact_phone_3)}`} className="hover:text-primary transition-colors">
                                                            {settings.contact_phone_3}
                                                        </a>
                                                        {settings.contact_phone_3_label && (
                                                            <span className="ml-2">- {settings.contact_phone_3_label}</span>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                {settings.contact_email && (
                                    <div className="flex gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                            <span className="material-symbols-outlined text-2xl text-primary">mail</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary dark:text-white">{t.emailTitle}</h3>
                                            <p className="mt-1 text-secondary/70 dark:text-white/60">
                                                <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">{settings.contact_email}</a>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Map and Directions */}
                            <div className="mt-8">
                                <div className="overflow-hidden rounded-xl shadow-md">
                                    <iframe
                                        src={`https://maps.google.com/maps?q=${settings.contact_map_lat || '39.9876'},${settings.contact_map_lng || '32.7543'}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
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
                                    href={`https://www.google.com/maps?q=${settings.contact_map_lat || '39.9876'},${settings.contact_map_lng || '32.7543'}`}
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
                                    <label className="text-sm font-medium text-secondary dark:text-white">
                                        {settings.contact_form_name_label || t.formName}
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={settings.contact_form_name_placeholder || t.formNamePlaceholder}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">
                                        {settings.contact_form_email_label || t.formEmail}
                                    </label>
                                    <input
                                        type="email"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={settings.contact_form_email_placeholder || t.formEmailPlaceholder}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">
                                        {settings.contact_form_phone_label || t.formPhone} *
                                    </label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        placeholder={settings.contact_form_phone_placeholder || t.formPhonePlaceholder}
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <label className="text-sm font-medium text-secondary dark:text-white">
                                        {settings.contact_form_message_label || t.formMessage}
                                    </label>
                                    <textarea
                                        className="mt-1 flex-1 resize-none rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        style={{ minHeight: '200px' }}
                                        placeholder={settings.contact_form_message_placeholder || t.formMessagePlaceholder}
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
                                    {isLoading
                                        ? (settings.contact_form_submitting || t.sending)
                                        : (settings.contact_form_submit_btn || t.sendBtn)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title={settings.contact_form_success_title || t.successTitle}
                message={settings.contact_form_success_message || t.successMessage}
            />
        </>
    );
}
