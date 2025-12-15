"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getCampaignEmailTemplate } from "@/lib/email-templates";

interface EmailTemplate {
    id: number;
    slug: string;
    nameTR: string;
    nameEN: string;
    category: 'general' | 'holiday' | 'promotion';
    headerBgColor: string;
    headerTextColor: string;
    headerImage?: string;
    bodyBgColor: string;
    bodyTextColor: string;
    buttonColor: string;
    footerBgColor: string;
    footerTextColor: string;
    footerImage?: string;
    bannerImage?: string;
    logoUrl?: string;
    // Plain text content fields
    headerTitle: string;      // E-posta başlığı (ör: "Yeni Yıl Kampanyası!")
    bodyContent: string;      // Ana içerik metni
    footerContact: string;    // Alt bilgi iletişim bilgileri
    buttonText?: string;      // Custom button text
    templateData?: any;       // JSON for extra template fields
    headerHtml: string;
    footerHtml: string;
    isActive: boolean;
    sortOrder: number;
}

const translations = {
    TR: {
        pageTitle: "E-posta Şablonları",
        pageDesc: "Kampanya e-posta şablonlarını yönetin ve düzenleyin.",
        seedTemplates: "Varsayılan Şablonları Yükle",
        noTemplates: "Şablon bulunamadı",
        noTemplatesDesc: "Varsayılan şablonları yüklemek için butona tıklayın.",
        edit: "Düzenle",
        general: "Genel",
        holiday: "Kutlama",
        promotion: "Kampanya",
        templateName: "Şablon Adı (TR)",
        templateNameEN: "Şablon Adı (EN)",
        headerBgColor: "Üst Alan Rengi",
        headerTextColor: "Başlık Yazı Rengi",
        buttonColor: "Buton Rengi",
        active: "Aktif",
        inactive: "Pasif",
        save: "Kaydet",
        cancel: "İptal",
        saving: "Kaydediliyor...",
        successSave: "Şablon başarıyla kaydedildi!",
        errorSave: "Kaydetme sırasında bir hata oluştu.",
        errorLoad: "Şablonlar yüklenirken bir hata oluştu.",
        preview: "Önizleme",
    },
    EN: {
        pageTitle: "Email Templates",
        pageDesc: "Manage and edit campaign email templates.",
        seedTemplates: "Load Default Templates",
        noTemplates: "No templates found",
        noTemplatesDesc: "Click the button to load default templates.",
        edit: "Edit",
        general: "General",
        holiday: "Holiday",
        promotion: "Promotion",
        templateName: "Template Name (TR)",
        templateNameEN: "Template Name (EN)",
        headerBgColor: "Header Background",
        headerTextColor: "Header Text Color",
        buttonColor: "Button Color",
        active: "Active",
        inactive: "Inactive",
        save: "Save",
        cancel: "Cancel",
        saving: "Saving...",
        saved: "Template saved!",
        successSave: "Template saved successfully!",
        errorSave: "An error occurred while saving.",
        errorLoad: "An error occurred while loading templates.",
        preview: "Preview",
    }
};
// Default templates for instant render
const defaultTemplates: EmailTemplate[] = [
    // Genel
    { id: 1, slug: 'modern', nameTR: 'Modern', nameEN: 'Modern', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: 'Federal Gaz\'dan Önemli Duyuru', bodyContent: 'Değerli müşterimiz,\n\nFederal Gaz olarak 30 yılı aşkın tecrübemizle Ankara\'nın en güvenilir endüstriyel gaz tedarikçisiyiz.\n\nTüm gaz ihtiyaçlarınız için bizi tercih ettiğiniz için teşekkür ederiz.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 1 },
    { id: 2, slug: 'classic', nameTR: 'Klasik', nameEN: 'Classic', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: 'Federal Gaz Bilgilendirme', bodyContent: 'Değerli müşterimiz,\n\nSize en kaliteli hizmeti sunmak için çalışıyoruz.\n\nHerhangi bir sorunuz için bizimle iletişime geçebilirsiniz.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 2 },
    { id: 27, slug: 'welcome', nameTR: 'Hoş Geldiniz', nameEN: 'Welcome', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: 'Federal Gaz Ailesine Hoş Geldiniz!', bodyContent: 'Değerli müşterimiz,\n\nFederal Gaz ailesine hoş geldiniz! Sizinle çalışmaktan mutluluk duyuyoruz.\n\n30 yılı aşkın tecrübemizle Ankara\'nın en güvenilir endüstriyel gaz tedarikçisi olarak yanınızdayız.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 27 },
    { id: 26, slug: 'vip-customer', nameTR: 'VIP Müşteri', nameEN: 'VIP Customer', category: 'general', headerBgColor: '#2c3e50', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#c41e3a', footerBgColor: '#2c3e50', footerTextColor: '#888888', headerTitle: 'VIP Müşterimize Özel', bodyContent: 'Değerli VIP müşterimiz,\n\nSizin için özel avantajlarımız var! VIP müşterilerimize sunduğumuz ayrıcalıklı hizmetlerden yararlanabilirsiniz.\n\nVIP müşterimiz olduğunuz için teşekkür ederiz.', footerContact: 'Federal Gaz VIP Hattı | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 26 },
    // Bayram
    { id: 10, slug: 'new-year', nameTR: 'Yeni Yıl', nameEN: 'New Year', category: 'holiday', headerBgColor: '#1e3a5f', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#c41e3a', footerBgColor: '#1e3a5f', footerTextColor: '#888888', headerTitle: '🎄 Mutlu Yıllar!', bodyContent: 'Değerli müşterimiz,\n\nYeni yılınız kutlu olsun! 2025\'in size ve sevdiklerinize sağlık, mutluluk ve başarı getirmesini diliyoruz.\n\nFederal Gaz ailesi olarak yeni yılda da yanınızdayız!', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 10 },
    { id: 15, slug: 'ramazan-bayrami', nameTR: 'Ramazan Bayramı', nameEN: 'Eid al-Fitr', category: 'holiday', headerBgColor: '#1e3c72', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#4ecdc4', footerBgColor: '#1e3c72', footerTextColor: '#888888', headerTitle: '🌙 Ramazan Bayramınız Mübarek Olsun!', bodyContent: 'Değerli müşterimiz,\n\nRamazan Bayramınızı en içten dileklerimizle kutluyoruz.\n\nBu mübarek günlerin sizlere ve ailelerinize huzur ve mutluluk getirmesini diliyoruz.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 15 },
    { id: 16, slug: 'kurban-bayrami', nameTR: 'Kurban Bayramı', nameEN: 'Eid al-Adha', category: 'holiday', headerBgColor: '#2d3436', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#2d3436', footerTextColor: '#888888', headerTitle: '🕌 Kurban Bayramınız Kutlu Olsun!', bodyContent: 'Değerli müşterimiz,\n\nKurban Bayramınızı en içten dileklerimizle kutluyoruz.\n\nBu mübarek günlerin sizlere ve sevdiklerinize sağlık ve mutluluk getirmesini diliyoruz.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 16 },
    { id: 11, slug: '23-nisan', nameTR: '23 Nisan', nameEN: '23 April', category: 'holiday', headerBgColor: '#e30a17', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#e30a17', footerTextColor: '#ffffff', headerTitle: '🇹🇷 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', bodyContent: 'Değerli müşterimiz,\n\n23 Nisan Ulusal Egemenlik ve Çocuk Bayramı\'nı en içten dileklerimizle kutluyoruz.\n\nGazi Mustafa Kemal Atatürk ve tüm şehitlerimizi saygı ve minnetle anıyoruz.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 11 },
    // Promosyon
    { id: 30, slug: 'black-friday', nameTR: 'Efsane Cuma', nameEN: 'Black Friday', category: 'promotion', headerBgColor: '#000000', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#ff2d2d', footerBgColor: '#000000', footerTextColor: '#888888', headerTitle: '🔥 EFSANE CUMA BAŞLADI!', bodyContent: 'Değerli müşterimiz,\n\nYılın en büyük indirim kampanyası Federal Gaz\'da!\n\n✅ Tüm kaynak gazlarında %50\'ye varan indirim\n✅ Argon, Asetilen, CO2 karışımlarında özel fiyatlar\n✅ Toplu alımlarda ekstra avantajlar', footerContact: 'Hemen sipariş verin! Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 30 },
    { id: 31, slug: 'weekend-sale', nameTR: 'Hafta Sonu İndirimi', nameEN: 'Weekend Sale', category: 'promotion', headerBgColor: '#667eea', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#f093fb', footerBgColor: '#667eea', footerTextColor: '#ffffff', headerTitle: '🎉 Hafta Sonu Özel İndirimi!', bodyContent: 'Değerli müşterimiz,\n\nSadece bu hafta sonu geçerli özel fiyatlarımızı kaçırmayın!\n\nTüm endüstriyel gazlarda cazip fırsatlar sizi bekliyor.', footerContact: 'Sipariş için: Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 31 },
    { id: 32, slug: 'winter-campaign', nameTR: 'Kış Kampanyası', nameEN: 'Winter Campaign', category: 'promotion', headerBgColor: '#74ebd5', headerTextColor: '#1a2744', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#74ebd5', footerTextColor: '#1a2744', headerTitle: '❄️ Kış Kampanyası Başladı!', bodyContent: 'Değerli müşterimiz,\n\nKış aylarına özel kampanyamızdan yararlanın!\n\nPropan ve ısıtma gazlarında özel fiyat avantajları sizi bekliyor.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 32 },
    { id: 3, slug: 'promotion', nameTR: 'Kampanya / İndirim', nameEN: 'Promotion', category: 'promotion', headerBgColor: '#ff6b35', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#ff6b35', footerTextColor: '#ffffff', headerTitle: '🎁 Özel Kampanya Fırsatı!', bodyContent: 'Değerli müşterimiz,\n\nSize özel kampanyamızı duyurmaktan mutluluk duyuyoruz!\n\nDetaylı bilgi için bizimle iletişime geçin.', footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 20 },
    { id: 4, slug: 'stock-reminder', nameTR: 'Stok Hatırlatma', nameEN: 'Stock Reminder', category: 'promotion', headerBgColor: '#2ecc71', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#2ecc71', footerTextColor: '#ffffff', headerTitle: '📦 Stok Hatırlatması', bodyContent: 'Değerli müşterimiz,\n\nGaz stoklarınızın azaldığını fark ettik. Kesintisiz hizmet için siparişinizi şimdiden verebilirsiniz.\n\nAynı gün teslimat imkanımızdan yararlanın!', footerContact: 'Sipariş için: Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 21 },
];


export default function TemplatesPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
    const [loading, setLoading] = useState(false); // Start with false - show default immediately
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string>("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'holiday' | 'promotion'>('all');
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Only fetch templates, do NOT sync (speed optimization)
        fetchTemplates();
    }, []);

    // ESC key to close modals
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditingTemplate(null);
                setPreviewTemplate(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Generate preview HTML locally (Instant!)
    useEffect(() => {
        const targetTemplate = editingTemplate || previewTemplate;

        if (targetTemplate) {
            setPreviewLoading(true);

            // Small debounce for smooth typing experience
            const timeoutId = setTimeout(() => {
                try {
                    const html = getCampaignEmailTemplate(targetTemplate.slug, {
                        subject: targetTemplate.headerTitle, // Use header title as subject for preview
                        content: targetTemplate.bodyContent,
                        recipientName: 'Sayın Müşteri', // Default placeholder for preview
                        campaignTitle: targetTemplate.headerTitle,
                        // Colors & Styles
                        headerBgColor: targetTemplate.headerBgColor,
                        headerTextColor: targetTemplate.headerTextColor,
                        headerImage: targetTemplate.headerImage,
                        bodyBgColor: targetTemplate.bodyBgColor,
                        bodyTextColor: targetTemplate.bodyTextColor,
                        buttonColor: targetTemplate.buttonColor,
                        footerBgColor: targetTemplate.footerBgColor,
                        footerTextColor: targetTemplate.footerTextColor,
                        footerImage: targetTemplate.footerImage,
                        customLogoUrl: targetTemplate.logoUrl,
                        // Extra content
                        headerHtml: targetTemplate.headerHtml,
                        footerHtml: targetTemplate.footerHtml,
                        footerContact: targetTemplate.footerContact,
                        buttonText: targetTemplate.buttonText,
                        buttonUrl: targetTemplate.templateData?.buttonUrl,
                        templateData: targetTemplate.templateData
                    });

                    setPreviewHtml(html);
                    setPreviewLoading(false);
                } catch (err) {
                    console.error("Preview generation error:", err);
                    setPreviewHtml('<p>Önizleme oluşturulurken bir hata oluştu.</p>');
                    setPreviewLoading(false);
                }
            }, 50); // Very fast debounce since it's local

            return () => clearTimeout(timeoutId);
        }
    }, [previewTemplate, editingTemplate]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/dashboard/templates');
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
                setTemplates(data.templates);
            }
            // If no templates from DB, keep default ones
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            // Keep default templates on error
        }
    };

    const syncAndSeedTemplates = async () => {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            // One sync to rule them all (schema updates + seeding)
            const syncRes = await fetch('/api/dashboard/sync', { method: 'POST' });
            const syncData = await syncRes.json();

            if (syncRes.ok) {
                setSuccessMessage(syncData.message || 'Veritabanı onarıldı ve şablonlar yüklendi!');
                // Wait a bit then fetch templates
                setTimeout(() => fetchTemplates(), 1000);
            } else {
                setErrorMessage(syncData.error || syncData.details || 'Veritabanı senkronizasyonu başarısız');
            }
            setTimeout(() => { setSuccessMessage(""); setErrorMessage(""); }, 5000);
        } catch (error) {
            console.error('Failed to sync/seed templates:', error);
            setErrorMessage('Bağlantı hatası, lütfen tekrar deneyin');
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerImage' | 'logoUrl' | 'headerImage' | 'footerImage') => {
        const file = e.target.files?.[0];
        if (!file || !editingTemplate) return;

        setSaving(true);
        setErrorMessage('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                // Reject internal Base64 returns here too, to force real uploads
                if (data.url.startsWith('data:')) {
                    setErrorMessage('Görsel sunucuya yüklenemedi (Base64). Lütfen daha küçük bir dosya deneyin veya destek ile iletişime geçin.');
                    return;
                }
                setEditingTemplate({ ...editingTemplate, [field]: data.url });
                setSuccessMessage('Görsel yüklendi');
                setTimeout(() => setSuccessMessage(''), 2000);
            } else {
                setErrorMessage(data.error || 'Yükleme başarısız');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setErrorMessage('Yükleme hatası - bağlantı sorunu');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!editingTemplate) return;

        setSaving(true);
        setErrorMessage('');

        // Optimistic UI Update
        const updatedTemplate = { ...editingTemplate };
        setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        // setSortedTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)); // This line is commented out in the original, so I'll keep it commented or remove it if it's not used. Assuming it's not used.

        try {
            const res = await fetch('/api/dashboard/templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTemplate),
            });

            if (res.ok) {
                setSuccessMessage(t.successSave); // Changed tObject to t
                setTimeout(() => setSuccessMessage(''), 2000);

                // Optimistic update is sufficient, no need to re-fetch immediately
                // fetchTemplates().catch(console.error);
            } else {
                const data = await res.json();
                setErrorMessage(data.error || t.errorSave); // Changed tObject to t
                // Revert optimistic update on error is complex, for now we rely on the next fetch
                fetchTemplates();
            }
        } catch (error) {
            console.error('Save failed:', error);
            setErrorMessage(t.errorSave); // Changed tObject to t
        } finally {
            setSaving(false);
            setEditingTemplate(null); // Close modal
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const getCategoryLabel = (category: string) => {
        if (category === 'general') return t.general;
        if (category === 'holiday') return t.holiday;
        if (category === 'promotion') return t.promotion;
        return category;
    };

    const getCategoryStyle = (category: string) => {
        if (category === 'general') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (category === 'holiday') return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (category === 'promotion') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const sortedTemplates = templates
        .filter((template) => {
            if (selectedCategory === 'all') return true;
            return template.category === selectedCategory;
        })
        .sort((a, b) => {
            if (a.isActive === b.isActive) return 0;
            return a.isActive ? -1 : 1;
        });

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">{t.pageTitle}</h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">{t.pageDesc}</p>
                </div>
                <div>

                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {errorMessage}
                </div>
            )}

            {/* Category Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'all'
                        ? 'bg-[#137fec] text-white'
                        : 'bg-[#111418] text-gray-400 hover:text-white border border-[#3b4754]'
                        }`}
                >
                    Tümü
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'general'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#111418] text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                        }`}
                >
                    {t.general}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'general').length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('holiday')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'holiday'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#111418] text-red-400 hover:bg-red-500/20 border border-red-500/30'
                        }`}
                >
                    {t.holiday}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'holiday').length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('promotion')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'promotion'
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#111418] text-orange-400 hover:bg-orange-500/20 border border-orange-500/30'
                        }`}
                >
                    {t.promotion}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'promotion').length}</span>
                </button>
            </div>

            {/* Templates Grid */}
            {sortedTemplates.length === 0 ? (
                <div className="bg-[#111418] rounded-xl p-12 text-center border border-[#3b4754]">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">mail</span>
                    <p className="text-lg font-medium text-gray-300">{t.noTemplates}</p>
                    <p className="text-sm text-gray-500 mb-4">{t.noTemplatesDesc}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {sortedTemplates.map((template) => (
                        <div key={template.id} className="bg-[#111418] rounded-lg border border-[#3b4754] overflow-hidden hover:border-[#137fec]/50 transition-colors group">
                            {/* Compact Preview Header */}
                            <div className="h-14 flex items-center justify-center px-2 bg-[#1a1d21] border-b border-[#3b4754]">
                                <span className="text-xs font-semibold text-center leading-tight truncate text-gray-200">
                                    {language === 'TR' ? template.nameTR : template.nameEN}
                                </span>
                            </div>

                            {/* Compact Info */}
                            <div className="p-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${getCategoryStyle(template.category)}`}>
                                        {getCategoryLabel(template.category)}
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-gray-500'}`} title={template.isActive ? t.active : t.inactive}></span>
                                </div>

                                <p className="text-gray-500 text-[10px] mb-2 truncate">slug: {template.slug}</p>

                                {/* Action Buttons */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPreviewTemplate(template)}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-500/10 text-amber-400 rounded text-xs hover:bg-amber-500/20 transition-colors"
                                        title={t.preview}
                                    >
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const tpl = { ...template };

                                            // Global Defaults for Common Fields
                                            if (!tpl.buttonText || tpl.buttonText.trim() === '') {
                                                tpl.buttonText = tpl.slug === 'new-year' ? '🎁 Yeni Yıl Fırsatları' : 'Fırsatı Yakala';
                                            }
                                            if (!tpl.footerContact || tpl.footerContact.trim() === '') {
                                                tpl.footerContact = '© 2014 Federal Gaz. Tüm hakları saklıdır. www.federalgaz.com';
                                            }

                                            // Initialize templateData with New Year style defaults for EVERYONE
                                            tpl.templateData = {
                                                // Defaults
                                                headerHighlight: tpl.templateData?.headerHighlight || (tpl.slug === 'new-year' ? (new Date().getFullYear() + 1).toString() : 'ÖZEL'),
                                                headerHighlightColor: tpl.templateData?.headerHighlightColor || '#ffd700',

                                                headerSubtitle: tpl.templateData?.headerSubtitle || (tpl.slug === 'new-year' ? 'MUTLU YILLAR!' : 'FIRSATLARI KAÇIRMAYIN'),
                                                headerSubtitleColor: tpl.templateData?.headerSubtitleColor || '#ffd700',
                                                // Make the box visible by default for EVERYONE (Dark Blue default), so they can edit it
                                                headerSubtitleBgColor: tpl.templateData?.headerSubtitleBgColor || '#1f2937',

                                                headerStripGradient: tpl.templateData?.headerStripGradient || (tpl.slug === 'new-year' ? 'linear-gradient(90deg, #c41e3a 0%, #ffd700 50%, #c41e3a 100%)' : 'transparent'),

                                                bodyGreeting: tpl.templateData?.bodyGreeting || (tpl.slug === 'new-year' ? '🎄 Yeni yılda sağlık, mutluluk ve başarı dileriz! 🎄' : ''),
                                                bodyGreetingColor: tpl.templateData?.bodyGreetingColor || '#ffd700',
                                                bodyGreetingBgColor: tpl.templateData?.bodyGreetingBgColor || (tpl.slug === 'new-year' ? 'rgba(255,255,255,0.05)' : 'transparent'),

                                                signature: tpl.templateData?.signature || 'Federal Gaz Ailesi',
                                                signatureColor: tpl.templateData?.signatureColor || '#ffd700',

                                                recipientNameColor: tpl.templateData?.recipientNameColor || '#ffd700',
                                                recipientNameBgColor: tpl.templateData?.recipientNameBgColor || 'transparent',



                                                // Campaign Box Defaults - Empty by default (Show Image)
                                                campaignBoxText: tpl.templateData?.campaignBoxText || '',
                                                campaignBoxTextColor: tpl.templateData?.campaignBoxTextColor || '#ffd700',
                                                campaignBoxBgColor: tpl.templateData?.campaignBoxBgColor || '#1e3a5f',

                                                ...tpl.templateData
                                            };

                                            setEditingTemplate(tpl);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#137fec]/10 text-[#137fec] rounded text-xs hover:bg-[#137fec]/20 transition-colors"
                                        title={t.edit}
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal with Live Preview */}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1c2127] rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-[#3b4754]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[#3b4754] flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec]">edit_document</span>
                                    {editingTemplate.nameTR}
                                </h2>
                                <p className="text-xs text-gray-400">Değişiklikleri anlık olarak sağ tarafta görebilirsiniz</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-[#111418] px-3 py-1.5 rounded-lg border border-[#3b4754]">
                                    <input
                                        type="checkbox"
                                        checked={editingTemplate.isActive}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#137fec] rounded focus:ring-0"
                                    />
                                    <span className="text-sm text-gray-300">{editingTemplate.isActive ? t.active : t.inactive}</span>
                                </label>
                                <button onClick={() => setEditingTemplate(null)} className="text-gray-400 hover:text-white p-1">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Split View */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* LEFT: Editors */}
                            <div className="w-1/2 overflow-y-auto p-6 border-r border-[#3b4754] space-y-6">
                                {/* Names */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">{t.templateName}</label>
                                        <input
                                            type="text"
                                            value={editingTemplate.nameTR}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, nameTR: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:border-[#137fec] outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">{t.templateNameEN}</label>
                                        <input
                                            type="text"
                                            value={editingTemplate.nameEN}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, nameEN: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:border-[#137fec] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* === HEADER SECTION === */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-[#3b4754]">
                                        <span className="material-symbols-outlined text-blue-400">view_compact</span>
                                        <h3 className="text-sm font-semibold text-white">Header Tasarımı</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Arkaplan Rengi</label>
                                            <div className="flex gap-2 items-center bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.headerBgColor || '#1a2744'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, headerBgColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                                                <span className="text-xs text-gray-400 font-mono">{editingTemplate.headerBgColor}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Yazı Rengi</label>
                                            <div className="flex gap-2 items-center bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.headerTextColor || '#ffffff'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, headerTextColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                                                <span className="text-xs text-gray-400 font-mono">{editingTemplate.headerTextColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Logo URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingTemplate.logoUrl || ''}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, logoUrl: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                placeholder="https://..."
                                            />
                                            <label className="px-3 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Header Görseli (Opsiyonel)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingTemplate.headerImage || ''}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, headerImage: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                placeholder="https://..."
                                            />
                                            <label className="px-3 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'headerImage')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* === CONTENT SECTION === */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-[#3b4754]">
                                        <span className="material-symbols-outlined text-green-400">article</span>
                                        <h3 className="text-sm font-semibold text-white">İçerik Alanı</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Arkaplan</label>
                                            <div className="bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.bodyBgColor || '#ffffff'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyBgColor: e.target.value })}
                                                    className="w-full h-6 cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Yazı</label>
                                            <div className="bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.bodyTextColor || '#333333'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyTextColor: e.target.value })}
                                                    className="w-full h-6 cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Buton</label>
                                            <div className="bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.buttonColor || '#b13329'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, buttonColor: e.target.value })}
                                                    className="w-full h-6 cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-400 mb-1">E-posta Başlığı</label>
                                            <input
                                                type="text"
                                                value={editingTemplate.headerTitle || ''}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, headerTitle: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Buton Metni</label>
                                            <input
                                                type="text"
                                                value={editingTemplate.buttonText || ''}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, buttonText: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                placeholder="Fırsatı Yakala"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Buton Linki (URL)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 material-symbols-outlined text-sm">link</span>
                                            <input
                                                type="text"
                                                value={editingTemplate.templateData?.buttonUrl || ''}
                                                onChange={(e) => setEditingTemplate({
                                                    ...editingTemplate,
                                                    templateData: { ...editingTemplate.templateData, buttonUrl: e.target.value }
                                                })}
                                                className="w-full pl-9 pr-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                placeholder="https://www.federalgaz.com/..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">İçerik Metni</label>
                                        <textarea
                                            value={editingTemplate.bodyContent || ''}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyContent: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm h-40 resize-none font-sans leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* === DYNAMIC FIELDS SECTION (ALL TEMPLATES) === */}
                                {true && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-[#3b4754]">
                                            <span className="material-symbols-outlined text-purple-400">tune</span>
                                            <h3 className="text-sm font-semibold text-white">Özel Alanlar</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Header Highlight */}
                                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Header Vurgusu (ör: 2025)</label>
                                                    <input
                                                        type="text"
                                                        value={editingTemplate.templateData?.headerHighlight || ''}
                                                        onChange={(e) => setEditingTemplate({
                                                            ...editingTemplate,
                                                            templateData: { ...editingTemplate.templateData, headerHighlight: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                        placeholder="✨ 2025 ✨"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Renk</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.headerHighlightColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, headerHighlightColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Yazı Rengi"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Header Subtitle */}
                                            <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                                <div className="col-span-3 pb-2">
                                                    <span className="text-xs font-semibold text-blue-200 block">Renkli Kutu Mesajı (Orta)</span>
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Metin (MUTLU YILLAR)</label>
                                                    <input
                                                        type="text"
                                                        value={editingTemplate.templateData?.headerSubtitle || ''}
                                                        onChange={(e) => setEditingTemplate({
                                                            ...editingTemplate,
                                                            templateData: { ...editingTemplate.templateData, headerSubtitle: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                        placeholder="MUTLU YILLAR!"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Yazı</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.headerSubtitleColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, headerSubtitleColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Yazı Rengi"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Kutu Rengi</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.headerSubtitleBgColor && editingTemplate.templateData.headerSubtitleBgColor !== 'transparent' ? editingTemplate.templateData.headerSubtitleBgColor : '#1f2937'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, headerSubtitleBgColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Kutu Arka Plan Rengi"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campaign Box (Replaces Image) */}
                                            <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                                                <div className="col-span-3 pb-2 flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-indigo-200 block">Kampanya Mesaj Kutusu (Resim Yerine)</span>
                                                    <span className="text-[10px] text-gray-500">Metin girilirse resim gizlenir</span>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Kutu Metni (Resim Yerine)</label>
                                                    <input
                                                        type="text"
                                                        value={editingTemplate.templateData?.campaignBoxText || ''}
                                                        onChange={(e) => setEditingTemplate({
                                                            ...editingTemplate,
                                                            templateData: { ...editingTemplate.templateData, campaignBoxText: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:border-[#137fec] outline-none transition-colors"
                                                        placeholder="Varsayılan görseli gizler..."
                                                    />
                                                    <p className="text-[10px] text-gray-500 mt-1">* Varsayılan görseli (Süslemeler vb.) kullanmak için bu alanı boş bırakın.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Yazı</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.campaignBoxTextColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, campaignBoxTextColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Yazı Rengi"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Kutu</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.campaignBoxBgColor || '#1e3a5f'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, campaignBoxBgColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Kutu Rengi"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Header Strip Gradient */}
                                            <div className="space-y-1 mb-4">
                                                <label className="block text-xs font-medium text-gray-400">Header Altı Şerit (Renk veya Gradient CSS)</label>
                                                <input
                                                    type="text"
                                                    value={editingTemplate.templateData?.headerStripGradient || ''}
                                                    onChange={(e) => setEditingTemplate({
                                                        ...editingTemplate,
                                                        templateData: { ...editingTemplate.templateData, headerStripGradient: e.target.value }
                                                    })}
                                                    className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                    placeholder="linear-gradient(...) veya #color"
                                                />
                                                <p className="text-[10px] text-gray-500">Örn: linear-gradient(90deg, red, gold, red) veya #ff0000</p>
                                            </div>

                                            {/* Recipient Name Customization */}
                                            <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-xs text-gray-300">Alıcı İsmi Formatı (Ör: Sevgili <b>Mehmet Yılmaz</b>)</span>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">İsim Rengi</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.recipientNameColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, recipientNameColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="İsim Rengi"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">İsim Arka Plan</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.recipientNameBgColor && editingTemplate.templateData.recipientNameBgColor !== 'transparent' ? editingTemplate.templateData.recipientNameBgColor : '#ffffff'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, recipientNameBgColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="İsim Arka Plan Rengi"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Greeting */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Karşılama Mesajı</label>
                                                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                                                    <textarea
                                                        value={editingTemplate.templateData?.bodyGreeting || ''}
                                                        onChange={(e) => setEditingTemplate({
                                                            ...editingTemplate,
                                                            templateData: { ...editingTemplate.templateData, bodyGreeting: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm resize-none h-[38px]"
                                                        placeholder="Mesajınız..."
                                                    />
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2" title="Yazı Rengi">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.bodyGreetingColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, bodyGreetingColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                        />
                                                    </div>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2" title="Arka Plan Rengi">
                                                        {/* Simple color picker for bg (mostly transparent/dark) - use text input for RGBA or simple color? User asked for color picker. */}
                                                        {/* RGBA is better for transparency but standard color picker is hex. I'll afford HEX picker assuming they pick solid or I map it. */}
                                                        {/* Actually html color input supports hex only. For rgba they might need text input but let's stick to HEX for simplicity or maybe a preset palette? No, user generic request. */}
                                                        {/* I will use a text input for RGBA if they want transparency, but a color picker is requested. I'll provide a color picker for solid color, and maybe they can edit it manually elsewhere? */}
                                                        {/* Let's just use color picker. It will be solid color. */}
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.bodyGreetingBgColor?.length === 7 ? editingTemplate.templateData.bodyGreetingBgColor : '#ffffff'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, bodyGreetingBgColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">İpucu: Transparan arka plan için varsayılanı koruyun veya hex kodu girin.</p>
                                            </div>

                                            {/* Signature */}
                                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">İmza Metni</label>
                                                    <input
                                                        type="text"
                                                        value={editingTemplate.templateData?.signature || ''}
                                                        onChange={(e) => setEditingTemplate({
                                                            ...editingTemplate,
                                                            templateData: { ...editingTemplate.templateData, signature: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                        placeholder="Federal Gaz Ailesi"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Renk</label>
                                                    <div className="flex items-center h-[38px] bg-[#111418] border border-[#3b4754] rounded-lg px-2">
                                                        <input
                                                            type="color"
                                                            value={editingTemplate.templateData?.signatureColor || '#ffd700'}
                                                            onChange={(e) => setEditingTemplate({
                                                                ...editingTemplate,
                                                                templateData: { ...editingTemplate.templateData, signatureColor: e.target.value }
                                                            })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                            title="Yazı Rengi"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === FOOTER SECTION === */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-[#3b4754]">
                                        <span className="material-symbols-outlined text-orange-400">call_to_action</span>
                                        <h3 className="text-sm font-semibold text-white">Footer Tasarımı</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Arkaplan</label>
                                            <div className="bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.footerBgColor || '#1a2744'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, footerBgColor: e.target.value })}
                                                    className="w-full h-6 cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Yazı</label>
                                            <div className="bg-[#111418] p-1 rounded border border-[#3b4754]">
                                                <input type="color" value={editingTemplate.footerTextColor || '#888888'}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, footerTextColor: e.target.value })}
                                                    className="w-full h-6 cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">İletişim Bilgisi</label>
                                        <input
                                            type="text"
                                            value={editingTemplate.footerContact || ''}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, footerContact: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Footer Görseli (Opsiyonel)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingTemplate.footerImage || ''}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate, footerImage: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm"
                                                placeholder="https://..."
                                            />
                                            <label className="px-3 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'footerImage')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Live Preview */}
                            <div className="w-1/2 bg-gray-100 flex flex-col h-full">
                                <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-600 text-lg">visibility</span>
                                        Canlı Önizleme
                                    </h3>
                                    <div className="text-xs text-gray-500">
                                        {previewLoading ? 'Güncelleniyor...' : 'Anlık güncel'}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-gray-200/50">
                                    <div className="bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-[600px] min-h-[500px] transition-all duration-300">
                                        {previewLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                            </div>
                                        )}
                                        <iframe
                                            srcDoc={previewHtml}
                                            className="w-full h-[800px] border-0"
                                            title="Live Preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#3b4754] flex items-center justify-between shrink-0 bg-[#1c2127]">
                            <div className="text-xs text-gray-500">
                                * Değişiklikleri kaydetmeden önce önizlemeyi kontrol ediniz.
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingTemplate(null)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">
                                    {t.cancel}
                                </button>
                                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all">
                                    {saving ? t.saving : t.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Old Preview Modal (Only for list view preview) */}
            {previewTemplate && !editingTemplate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* ... same preview content ... */}
                    <div className="bg-[#1c2127] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#3b4754]">
                        <div className="p-4 border-b border-[#3b4754] flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">{t.preview}</h3>
                            <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-100">
                            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden" style={{ maxWidth: '600px' }}>
                                <iframe srcDoc={previewHtml} className="w-full h-[600px] border-0" title="Preview" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
