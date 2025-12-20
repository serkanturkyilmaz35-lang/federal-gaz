"use client";

interface MediaSidebarProps {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
    counts?: {
        all: number;
        uploads: number;
        products: number;
        hero: number;
    };
}

export default function MediaSidebar({ currentFilter, onFilterChange, counts }: MediaSidebarProps) {
    const menuItems = [
        { id: 'all', label: 'Tüm Medyalar', icon: 'perm_media', count: counts?.all },
        { id: 'uploads', label: 'Yüklenenler', icon: 'cloud_upload', count: counts?.uploads },
        { id: 'products', label: 'Ürün Görselleri', icon: 'inventory_2', count: counts?.products },
        { id: 'hero', label: 'Hero / Slider', icon: 'view_carousel', count: counts?.hero },
    ];

    return (
        <aside className="w-full lg:w-64 bg-[#111418] border-r border-[#3b4754] p-4 flex-shrink-0">
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Klasörler</h2>
                <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onFilterChange(item.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentFilter === item.id
                                    ? 'bg-[#137fec]/10 text-[#137fec] font-medium'
                                    : 'text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                {item.label}
                            </div>
                            {item.count !== undefined && (
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-[#3b4754]">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <span className="material-symbols-outlined">info</span>
                        <span className="text-xs font-bold">İpucu</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Sistem dosyaları (logo, site görselleri) "korumalı" olarak işaretlenir ve silinemez.
                    </p>
                </div>
            </div>
        </aside>
    );
}
