"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DASHBOARD_ICONS, ICON_COLORS } from "@/constants/dashboardIcons";
import { parseIcon, formatIcon } from "@/utils/iconUtils";

interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'images' | 'items' | 'icon' | 'button';
    itemFields?: FieldConfig[];
    placeholder?: string;
}

interface Section {
    key: string;
    title: string;
    fields: FieldConfig[];
    content: Record<string, unknown>;
    hasOverride: boolean;
}

interface PageData {
    slug: string;
    title: string;
    titleEN: string;
}

export default function PageEditorPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeLang, setActiveLang] = useState<'TR' | 'EN'>('TR');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Get the full slug path from array
    const fullSlug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug.join('/') : resolvedParams.slug;

    // Convert URL slug to page slug
    const getPageSlug = (urlSlug: string) => {
        if (urlSlug === 'home' || urlSlug === 'ana-sayfa') return '/';
        return `/${urlSlug}`;
    };

    useEffect(() => {
        fetchPageContent();
    }, [fullSlug, activeLang]);

    const fetchPageContent = async () => {
        try {
            setLoading(true);
            const pageSlug = getPageSlug(fullSlug);
            const res = await fetch(`/api/dashboard/page-content?slug=${encodeURIComponent(pageSlug)}&language=${activeLang}`);

            if (res.ok) {
                const data = await res.json();
                setPage(data.page);
                setSections(data.sections);
                // Expand all sections by default
                setExpandedSections(new Set(data.sections.map((s: Section) => s.key)));
            } else if (res.status === 401) {
                // Not authenticated - redirect to login
                console.error('Not authenticated - redirecting to login');
                router.push('/giris');
            } else if (res.status === 404) {
                // Page not found
                console.error('Page not found:', pageSlug);
                router.push('/dashboard/content/pages');
            } else {
                // Other error - show in console but stay on page
                const error = await res.json().catch(() => ({}));
                console.error('API error:', res.status, error);
                alert(`Sayfa içeriği yüklenemedi: ${error.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Error fetching page:', error);
            alert('Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    };

    const saveSection = async (sectionKey: string, content: Record<string, unknown>) => {
        setSaving(true);
        try {
            const pageSlug = getPageSlug(fullSlug);
            const res = await fetch('/api/dashboard/page-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageSlug,
                    sectionKey,
                    content,
                    language: activeLang,
                }),
            });

            if (res.ok) {
                setSaved(true);
                // Update section hasOverride status
                setSections(prev => prev.map(s =>
                    s.key === sectionKey ? { ...s, hasOverride: true, content } : s
                ));
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving section:', error);
            alert('Kaydetme başarısız');
        } finally {
            setSaving(false);
        }
    };

    const revertSection = async (sectionKey: string) => {
        if (!confirm('Bu bölümü varsayılana döndürmek istediğinizden emin misiniz?')) return;

        try {
            const pageSlug = getPageSlug(fullSlug);
            const res = await fetch(
                `/api/dashboard/page-content?slug=${encodeURIComponent(pageSlug)}&section=${sectionKey}&language=${activeLang}`,
                { method: 'DELETE' }
            );

            if (res.ok) {
                await fetchPageContent(); // Reload to get defaults
            }
        } catch (error) {
            console.error('Error reverting section:', error);
        }
    };

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const updateSectionContent = (sectionKey: string, fieldKey: string, value: unknown) => {
        setSections(prev => prev.map(s =>
            s.key === sectionKey
                ? { ...s, content: { ...s.content, [fieldKey]: value } }
                : s
        ));
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        sectionKey: string,
        fieldKey: string,
        index?: number,
        subFieldKey?: string
    ) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const labelId = `upload-label-${sectionKey}-${fieldKey}${index !== undefined ? `-${index}` : ''}${subFieldKey ? `-${subFieldKey}` : ''}`;
        const btnLabel = document.getElementById(labelId);
        if (btnLabel) btnLabel.innerText = "...";

        const formData = new FormData();
        formData.append('file', file);

        // Determine the appropriate folder based on section key
        // Map section keys to media library categories
        const sectionToFolder: Record<string, string> = {
            'hero': 'hero',
            'slider': 'hero',
            'products': 'products',
            'productGrid': 'products',
            'gallery': 'gallery',
            'images': 'gallery',
            'services': 'services',
            'templates': 'templates',
            'icons': 'icons',
            'logo': 'icons',
        };
        const folder = sectionToFolder[sectionKey] || 'uploads';
        formData.append('folder', folder);

        try {
            const res = await fetch('/api/dashboard/media', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.mediaFile) {
                const url = data.mediaFile.url;

                setSections(prev => prev.map(s => {
                    if (s.key !== sectionKey) return s;

                    const newContent = { ...s.content };

                    if (subFieldKey !== undefined && index !== undefined) {
                        const items = [...(newContent[fieldKey] as Record<string, unknown>[] || [])];
                        if (items[index]) {
                            items[index] = { ...items[index], [subFieldKey]: url };
                            newContent[fieldKey] = items;
                        }
                    } else if (index !== undefined) {
                        const images = [...(newContent[fieldKey] as string[] || [])];
                        images[index] = url;
                        newContent[fieldKey] = images;
                    } else {
                        newContent[fieldKey] = url;
                    }

                    return { ...s, content: newContent };
                }));
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            if (btnLabel) btnLabel.innerText = "Yükle";
            e.target.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Sayfa bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/content/pages"
                        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#292828] dark:text-white">
                            {activeLang === 'TR' ? page.title : page.titleEN}
                        </h1>
                        <p className="text-sm text-[#94847c]">{page.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {saved && (
                        <span className="text-green-500 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Kaydedildi
                        </span>
                    )}
                    {/* Language Toggle */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-[#283039] rounded-lg p-1">
                        <button
                            onClick={() => setActiveLang('TR')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeLang === 'TR'
                                ? 'bg-[#b13329] text-white'
                                : 'text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3b4754]'
                                }`}
                        >
                            🇹🇷 TR
                        </button>
                        <button
                            onClick={() => setActiveLang('EN')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeLang === 'EN'
                                ? 'bg-[#b13329] text-white'
                                : 'text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3b4754]'
                                }`}
                        >
                            🇬🇧 EN
                        </button>
                    </div>
                    <a
                        href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.federalgaz.com'}${page.slug === '/' ? '' : page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] hover:bg-gray-50 dark:hover:bg-[#283039]"
                    >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Önizle
                    </a>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map(section => (
                    <div
                        key={section.key}
                        className="border border-gray-200 dark:border-[#3b4754] rounded-lg overflow-hidden"
                    >
                        {/* Section Header */}
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#283039] cursor-pointer"
                            onClick={() => toggleSection(section.key)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-500">
                                    {expandedSections.has(section.key) ? 'expand_more' : 'chevron_right'}
                                </span>
                                <h3 className="font-medium text-[#292828] dark:text-white">
                                    {section.title}
                                </h3>
                                {section.hasOverride && (
                                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">
                                        Özelleştirilmiş
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {section.hasOverride && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            revertSection(section.key);
                                        }}
                                        className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">restore</span>
                                        Varsayılana Dön
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections.has(section.key) && (
                            <div className="p-4 bg-white dark:bg-[#1c2127] space-y-4">
                                {section.fields.map(field => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            {field.label}
                                        </label>
                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                value={String(section.content[field.key] || '')}
                                                onChange={(e) => updateSectionContent(section.key, field.key, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                value={String(section.content[field.key] || '')}
                                                onChange={(e) => updateSectionContent(section.key, field.key, e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                                            />
                                        )}
                                        {field.type === 'image' && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={String(section.content[field.key] || '')}
                                                    onChange={(e) => updateSectionContent(section.key, field.key, e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                                                    placeholder="Görsel URL'i girin veya yükleyin"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, section.key, field.key)}
                                                    className="hidden"
                                                    id={`upload-${section.key}-${field.key}`}
                                                />
                                                <label
                                                    id={`upload-label-${section.key}-${field.key}`}
                                                    htmlFor={`upload-${section.key}-${field.key}`}
                                                    className="flex items-center gap-1 px-3 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg cursor-pointer transition-colors border border-[#3b4754] text-xs whitespace-nowrap"
                                                >
                                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                                    Yükle
                                                </label>
                                                {(() => {
                                                    const imgUrl = section.content[field.key];
                                                    return typeof imgUrl === 'string' && imgUrl ? (
                                                        <img src={imgUrl} alt="" className="h-10 w-10 rounded object-cover border border-gray-600" />
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                        {field.type === 'images' && (
                                            <div className="space-y-2">
                                                {(Array.isArray(section.content[field.key]) ? section.content[field.key] as string[] : []).map((img, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                                                        <input
                                                            type="text"
                                                            value={img}
                                                            onChange={(e) => {
                                                                const images = [...(section.content[field.key] as string[] || [])];
                                                                images[idx] = e.target.value;
                                                                updateSectionContent(section.key, field.key, images);
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white text-sm"
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, section.key, field.key, idx)}
                                                            className="hidden"
                                                            id={`upload-${section.key}-${field.key}-${idx}`}
                                                        />
                                                        <label
                                                            id={`upload-label-${section.key}-${field.key}-${idx}`}
                                                            htmlFor={`upload-${section.key}-${field.key}-${idx}`}
                                                            className="p-1.5 bg-[#283039] hover:bg-[#3b4754] text-white rounded cursor-pointer transition-colors border border-[#3b4754]"
                                                            title="Bu görseli değiştir"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">upload_file</span>
                                                        </label>
                                                        <button
                                                            onClick={() => {
                                                                const images = (section.content[field.key] as string[] || []).filter((_, i) => i !== idx);
                                                                updateSectionContent(section.key, field.key, images);
                                                            }}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const images = [...(section.content[field.key] as string[] || []), ''];
                                                        updateSectionContent(section.key, field.key, images);
                                                    }}
                                                    className="text-sm text-[#b13329] hover:underline flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                    Görsel Ekle
                                                </button>
                                            </div>
                                        )}
                                        {field.type === 'icon' && (
                                            <div className="bg-gray-50 dark:bg-[#111418] rounded-lg p-3 border border-gray-200 dark:border-[#3b4754]">
                                                {/* Color Picker */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {ICON_COLORS.map((c) => {
                                                        const { name: currentName, color: currentColor } = parseIcon(String(section.content[field.key] || ''));
                                                        const isSelected = (c.value === "" && !currentColor) || (c.value === currentColor);
                                                        return (
                                                            <button
                                                                key={c.name}
                                                                onClick={() => updateSectionContent(section.key, field.key, formatIcon(currentName || 'check', c.value))}
                                                                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${isSelected ? 'border-white scale-110' : 'border-transparent'}`}
                                                                style={{ backgroundColor: c.value || '#9ca3af' }}
                                                                title={c.name}
                                                            >
                                                                {isSelected && <span className="material-symbols-outlined text-black text-[10px] font-bold">check</span>}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                {/* Icon Grid */}
                                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-[#3b4754] rounded-lg bg-white dark:bg-[#1c2127]">
                                                    {DASHBOARD_ICONS.map((icon) => {
                                                        const { name: currentName, color: currentColor } = parseIcon(String(section.content[field.key] || ''));
                                                        const isSelected = currentName === icon;
                                                        return (
                                                            <button
                                                                key={icon}
                                                                onClick={() => updateSectionContent(section.key, field.key, formatIcon(icon, currentColor))}
                                                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isSelected
                                                                    ? 'bg-[#283039] border border-white/20'
                                                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                                    }`}
                                                                title={icon}
                                                            >
                                                                <span
                                                                    className="material-symbols-outlined text-xl"
                                                                    style={{ color: isSelected ? (currentColor || undefined) : undefined }}
                                                                >
                                                                    {icon}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">Seçilen: {String(section.content[field.key] || '')}</p>
                                            </div>
                                        )}
                                        {field.type === 'items' && (
                                            <div className="space-y-3">
                                                {(Array.isArray(section.content[field.key]) ? section.content[field.key] as Record<string, unknown>[] : []).map((item, idx) => (
                                                    <div key={idx} className="p-3 border border-gray-200 dark:border-[#3b4754] rounded-lg bg-gray-50 dark:bg-[#283039]">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                Öğe {idx + 1}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    const items = (section.content[field.key] as Record<string, unknown>[] || []).filter((_, i) => i !== idx);
                                                                    updateSectionContent(section.key, field.key, items);
                                                                }}
                                                                className="text-red-500 hover:text-red-600"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {field.itemFields?.map(itemField => (
                                                                <div key={itemField.key}>
                                                                    <label className="text-xs text-gray-500 dark:text-gray-400">{itemField.label}</label>
                                                                    {itemField.type === 'text' ? (
                                                                        <input
                                                                            type="text"
                                                                            value={String(item[itemField.key] || '')}
                                                                            onChange={(e) => {
                                                                                const items = [...(section.content[field.key] as Record<string, unknown>[] || [])];
                                                                                items[idx] = { ...items[idx], [itemField.key]: e.target.value };
                                                                                updateSectionContent(section.key, field.key, items);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-sm"
                                                                        />
                                                                    ) : itemField.type === 'textarea' ? (
                                                                        <textarea
                                                                            value={String(item[itemField.key] || '')}
                                                                            onChange={(e) => {
                                                                                const items = [...(section.content[field.key] as Record<string, unknown>[] || [])];
                                                                                items[idx] = { ...items[idx], [itemField.key]: e.target.value };
                                                                                updateSectionContent(section.key, field.key, items);
                                                                            }}
                                                                            rows={2}
                                                                            className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-sm"
                                                                        />
                                                                    ) : itemField.type === 'icon' ? (
                                                                        <div className="w-full bg-white dark:bg-[#1c2127] rounded-lg p-2 border border-gray-300 dark:border-[#3b4754]">
                                                                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                                                                {DASHBOARD_ICONS.map((icon) => {
                                                                                    const { name: currentName } = parseIcon(String(item[itemField.key] || ''));
                                                                                    const isSelected = currentName === icon;
                                                                                    return (
                                                                                        <button
                                                                                            key={icon}
                                                                                            onClick={() => {
                                                                                                const items = [...(section.content[field.key] as Record<string, unknown>[] || [])];
                                                                                                items[idx] = { ...items[idx], [itemField.key]: formatIcon(icon) }; // No color for simple items for now to save space
                                                                                                updateSectionContent(section.key, field.key, items);
                                                                                            }}
                                                                                            className={`p-1 rounded transition-colors ${isSelected
                                                                                                ? 'bg-[#283039] text-white'
                                                                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                                            title={icon}
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-lg">{icon}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex gap-1">
                                                                            <input
                                                                                type="text"
                                                                                value={String(item[itemField.key] || '')}
                                                                                onChange={(e) => {
                                                                                    const items = [...(section.content[field.key] as Record<string, unknown>[] || [])];
                                                                                    items[idx] = { ...items[idx], [itemField.key]: e.target.value };
                                                                                    updateSectionContent(section.key, field.key, items);
                                                                                }}
                                                                                className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-sm"
                                                                                placeholder={itemField.type === 'image' ? 'Görsel URL' : ''}
                                                                            />
                                                                            {itemField.type === 'image' && (
                                                                                <>
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        onChange={(e) => handleImageUpload(e, section.key, field.key, idx, itemField.key)}
                                                                                        className="hidden"
                                                                                        id={`upload-${section.key}-${field.key}-${idx}-${itemField.key}`}
                                                                                    />
                                                                                    <label
                                                                                        id={`upload-label-${section.key}-${field.key}-${idx}-${itemField.key}`}
                                                                                        htmlFor={`upload-${section.key}-${field.key}-${idx}-${itemField.key}`}
                                                                                        className="p-1.5 bg-[#283039] hover:bg-[#3b4754] text-white rounded cursor-pointer transition-colors border border-[#3b4754]"
                                                                                        title="Görsel Yükle"
                                                                                    >
                                                                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                                                                    </label>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newItem: Record<string, string> = {};
                                                        field.itemFields?.forEach(f => newItem[f.key] = '');
                                                        const items = [...(section.content[field.key] as Record<string, unknown>[] || []), newItem];
                                                        updateSectionContent(section.key, field.key, items);
                                                    }}
                                                    className="text-sm text-[#b13329] hover:underline flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                    Öğe Ekle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Save Button */}
                                <div className="pt-4 border-t border-gray-200 dark:border-[#3b4754]">
                                    <button
                                        onClick={() => saveSection(section.key, section.content)}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#b13329] text-white hover:bg-[#b13329]/90 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {saving ? 'Kaydediliyor...' : 'Bu Bölümü Kaydet'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
