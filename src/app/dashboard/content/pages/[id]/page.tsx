"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageData {
    id: number;
    slug: string;
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
    status: 'published' | 'draft';
    type: 'legal' | 'static' | 'dynamic';
    metaTitle?: string;
    metaDescription?: string;
    isSystemPage: boolean;
    updatedAt: string;
}

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    const [activeLang, setActiveLang] = useState<'TR' | 'EN'>('TR');

    // Form state
    const [title, setTitle] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [content, setContent] = useState('');
    const [contentEn, setContentEn] = useState('');
    const [status, setStatus] = useState<'published' | 'draft'>('published');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    useEffect(() => {
        fetchPage();
    }, [resolvedParams.id]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/dashboard/pages/${resolvedParams.id}`);
            if (res.ok) {
                const data = await res.json();
                setPage(data.page);
                // Populate form
                setTitle(data.page.title || '');
                setTitleEn(data.page.titleEn || '');
                setContent(data.page.content || '');
                setContentEn(data.page.contentEn || '');
                setStatus(data.page.status || 'published');
                setMetaTitle(data.page.metaTitle || '');
                setMetaDescription(data.page.metaDescription || '');
            } else {
                router.push('/dashboard/content/pages');
            }
        } catch (error) {
            console.error('Error fetching page:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePage = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/dashboard/pages/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    titleEn,
                    content,
                    contentEn,
                    status,
                    metaTitle,
                    metaDescription,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Kaydetme başarısız');
            }
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Kaydetme sırasında bir hata oluştu');
        } finally {
            setSaving(false);
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
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/content/pages"
                        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#292828] dark:text-white flex items-center gap-2">
                            {page.isSystemPage && (
                                <span className="material-symbols-outlined text-purple-500" title="Sistem Sayfası">lock</span>
                            )}
                            {page.title}
                        </h1>
                        <p className="text-sm text-[#94847c]">/{page.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="text-green-500 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Kaydedildi
                        </span>
                    )}
                    <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3b4754] hover:bg-gray-50 dark:hover:bg-[#283039]"
                    >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Önizle
                    </a>
                    <button
                        onClick={savePage}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#b13329] text-white hover:bg-[#b13329]/90 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">save</span>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-[#3b4754]">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content'
                            ? 'border-[#b13329] text-[#b13329]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        İçerik
                    </button>
                    <button
                        onClick={() => setActiveTab('seo')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seo'
                            ? 'border-[#b13329] text-[#b13329]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        SEO
                    </button>
                </div>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="space-y-6">
                    {/* Language Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveLang('TR')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeLang === 'TR'
                                ? 'bg-[#b13329] text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-[#283039] dark:text-white'
                                }`}
                        >
                            🇹🇷 Türkçe
                        </button>
                        <button
                            onClick={() => setActiveLang('EN')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeLang === 'EN'
                                ? 'bg-[#b13329] text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-[#283039] dark:text-white'
                                }`}
                        >
                            🇬🇧 English
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Başlık {activeLang === 'EN' && '(English)'}
                        </label>
                        <input
                            type="text"
                            value={activeLang === 'TR' ? title : titleEn}
                            onChange={(e) => activeLang === 'TR' ? setTitle(e.target.value) : setTitleEn(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                            placeholder="Sayfa başlığı"
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Durum:</label>
                        <button
                            onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                            className={`relative w-12 h-6 rounded-full transition-colors ${status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${status === 'published' ? 'right-1' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm ${status === 'published' ? 'text-green-600' : 'text-gray-500'}`}>
                            {status === 'published' ? 'Yayında' : 'Taslak'}
                        </span>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            İçerik {activeLang === 'EN' && '(English)'}
                        </label>
                        <p className="text-xs text-gray-500 mb-2">HTML formatında içerik girebilirsiniz (h2, p, ul, li, strong vb.)</p>
                        <textarea
                            value={activeLang === 'TR' ? content : contentEn}
                            onChange={(e) => activeLang === 'TR' ? setContent(e.target.value) : setContentEn(e.target.value)}
                            rows={20}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329] font-mono text-sm"
                            placeholder="<h2>Başlık</h2><p>İçerik...</p>"
                        />
                    </div>
                </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Meta Başlık
                        </label>
                        <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                            placeholder="SEO için sayfa başlığı"
                        />
                        <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 karakter</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Meta Açıklama
                        </label>
                        <textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b13329]/20 focus:border-[#b13329]"
                            placeholder="Sayfanın kısa açıklaması (arama sonuçlarında görünür)"
                        />
                        <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 karakter</p>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 dark:bg-[#283039] rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Google Önizleme</p>
                        <div className="space-y-1">
                            <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                                {metaTitle || title || 'Sayfa Başlığı'}
                            </p>
                            <p className="text-green-600 text-sm">
                                https://federalgaz.com/{page.slug}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {metaDescription || 'Meta açıklama buraya gelecek...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
