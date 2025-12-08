"use client";

import { useState, useRef, useEffect } from "react";

export type DateRangeOption = "today" | "7days" | "30days" | "90days" | "custom" | "all";

interface DateFilterProps {
    dateRange: DateRangeOption;
    setDateRange: (range: DateRangeOption) => void;
    customStartDate: string;
    setCustomStartDate: (date: string) => void;
    customEndDate: string;
    setCustomEndDate: (date: string) => void;
    onApplyCustom?: () => void;
}

export default function DateFilter({
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    onApplyCustom
}: DateFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getDateRangeLabel = () => {
        switch (dateRange) {
            case "all": return "Tüm Zamanlar";
            case "today": return "Bugün";
            case "7days": return "Son 7 Gün";
            case "30days": return "Son 30 Gün";
            case "90days": return "Son 90 Gün";
            case "custom": return customStartDate && customEndDate
                ? `${new Date(customStartDate).toLocaleDateString('tr-TR')} - ${new Date(customEndDate).toLocaleDateString('tr-TR')}`
                : "Özel Tarih";
            default: return "Tüm Zamanlar";
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#1c2127] border border-gray-700 pl-3 pr-2 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
                <p className="text-xs font-medium leading-normal whitespace-nowrap">{getDateRangeLabel()}</p>
                <span className="material-symbols-outlined text-base">expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-10 z-30 w-64 rounded-xl border border-gray-700 bg-[#1c2127] p-4 shadow-xl">
                    <div className="space-y-1">
                        {[
                            { value: "all", label: "Tüm Zamanlar" },
                            { value: "today", label: "Bugün" },
                            { value: "7days", label: "Son 7 Gün" },
                            { value: "30days", label: "Son 30 Gün" },
                            { value: "90days", label: "Son 90 Gün" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setDateRange(option.value as DateRangeOption);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${dateRange === option.value
                                    ? "bg-[#137fec] text-white"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}

                        <div className="my-2 border-t border-gray-700"></div>

                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Özel Tarih Aralığı</p>
                        <div className="space-y-2">
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Başlangıç</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-[#111418] text-white text-xs border border-gray-700 focus:border-[#137fec] focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Bitiş</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-[#111418] text-white text-xs border border-gray-700 focus:border-[#137fec] focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (customStartDate && customEndDate) {
                                        setDateRange("custom");
                                        setIsOpen(false);
                                        onApplyCustom?.();
                                    }
                                }}
                                disabled={!customStartDate || !customEndDate}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-[#137fec] text-white text-xs font-bold hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Uygula
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
