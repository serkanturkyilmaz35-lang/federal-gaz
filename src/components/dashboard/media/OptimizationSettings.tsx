"use client";

import { useState } from "react";

export default function OptimizationSettings() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        autoCompress: true,
        resize: false,
        webp: true,
        lazyLoad: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-[#111418] border border-[#3b4754] rounded-2xl overflow-hidden mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#1c2127]/50 hover:bg-[#1c2127] transition-colors"
            >
                <div>
                    <h3 className="text-white font-bold text-sm text-left">Optimizasyon Ayarları</h3>
                    <p className="text-gray-400 text-[10px] text-left mt-0.5">
                        Görsel sıkıştırma ve format ayarları
                    </p>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 space-y-4 border-t border-[#3b4754]">
                    {/* Auto Compress */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-300">Otomatik Sıkıştırma</label>
                        <button
                            onClick={() => toggle('autoCompress')}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${settings.autoCompress ? 'bg-[#137fec]' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${settings.autoCompress ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Resize */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-300">Yeniden Boyutlandırma</label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Genişlik" className="bg-[#1c2127] border border-[#3b4754] rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-gray-500 focus:border-[#137fec] outline-none" disabled />
                            <input type="text" placeholder="Yükseklik" className="bg-[#1c2127] border border-[#3b4754] rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-gray-500 focus:border-[#137fec] outline-none" disabled />
                        </div>
                    </div>

                    {/* WebP */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-300">WebP Formatı</label>
                        <button
                            onClick={() => toggle('webp')}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${settings.webp ? 'bg-[#137fec]' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${settings.webp ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Lazy Load */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-300">Lazy Loading</label>
                        <button
                            onClick={() => toggle('lazyLoad')}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${settings.lazyLoad ? 'bg-[#137fec]' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${settings.lazyLoad ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <button className="w-full bg-[#137fec] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                        Ayarları Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
