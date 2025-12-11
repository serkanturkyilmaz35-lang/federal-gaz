"use client";

import { ReactNode } from "react";

interface SettingFieldWrapperProps {
    settingKey: string;
    label?: string; // Optional if child has its own label, but useful for the toggle header
    enabled: boolean;
    onToggle: (key: string, enabled: boolean) => void;
    children: ReactNode;
    className?: string;
}

export default function SettingFieldWrapper({
    settingKey,
    label,
    enabled,
    onToggle,
    children,
    className = ""
}: SettingFieldWrapperProps) {
    return (
        <div className={`relative group ${className}`}>
            <div className="flex items-center justify-between mb-1">
                {label && (
                    <label className={`block text-sm font-medium transition-colors ${enabled ? "text-gray-300" : "text-gray-500 line-through"}`}>
                        {label}
                    </label>
                )}

                <button
                    onClick={() => onToggle(settingKey, !enabled)}
                    type="button"
                    className={`
                        p-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-bold
                        ${enabled
                            ? "text-green-400 hover:bg-green-400/10"
                            : "text-gray-500 bg-gray-500/10 hover:bg-gray-500/20"}
                    `}
                    title={enabled ? "Aktif: Müşteriler bu alanı görebilir" : "Pasif: Bu alan gizlendi"}
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {enabled ? "visibility" : "visibility_off"}
                    </span>
                    {enabled ? "Aktif" : "Pasif"}
                </button>
            </div>

            <div className={`transition-opacity duration-300 ${enabled ? "opacity-100" : "opacity-40 grayscale pointer-events-none select-none"}`}>
                {children}
            </div>
        </div>
    );
}
