"use client";

import { useState, useEffect } from "react";

export interface FormField {
    id: string;
    label: string;
    placeholder: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    required: boolean;
    enabled: boolean;
    isSystem: boolean; // Cannot be deleted if true
    width?: 'full' | 'half';
    options?: string[]; // For select type
}

interface DynamicFieldBuilderProps {
    title?: string; // Optional title override
    initialFields: FormField[]; // JSON string or array
    onChange: (fields: FormField[]) => void;
}

export default function DynamicFieldBuilder({ title, initialFields, onChange }: DynamicFieldBuilderProps) {
    const [fields, setFields] = useState<FormField[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        // Ensure initialFields is an array
        let parsed = initialFields;
        if (typeof initialFields === 'string') {
            try {
                parsed = JSON.parse(initialFields);
            } catch {
                parsed = [];
            }
        }
        if (!Array.isArray(parsed)) parsed = [];
        setFields(parsed);
    }, [initialFields]);

    const updateFields = (newFields: FormField[]) => {
        setFields(newFields);
        onChange(newFields);
    };

    const addField = () => {
        const newField: FormField = {
            id: `custom_${Date.now()}`,
            label: "Yeni Alan",
            placeholder: "",
            type: "text",
            required: false,
            enabled: true,
            isSystem: false,
            width: "half"
        };
        updateFields([...fields, newField]);
        setEditingId(newField.id);
    };

    const removeField = (id: string) => {
        if (confirm("Bu alanı silmek istediğinize emin misiniz?")) {
            updateFields(fields.filter(f => f.id !== id));
        }
    };

    const toggleField = (id: string) => {
        updateFields(fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    };

    const updateFieldProperty = (id: string, key: keyof FormField, value: any) => {
        updateFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-300">{title || "Form Alanları"}</h4>
                <button
                    onClick={addField}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#137fec]/10 hover:bg-[#137fec]/20 text-[#137fec] text-xs font-bold rounded-lg transition-colors border border-[#137fec]/20"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Yeni Alan Ekle
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className={`group relative flex flex-col gap-3 p-4 rounded-xl border transition-all ${field.enabled
                            ? "bg-[#1c2127] border-[#3b4754]"
                            : "bg-[#1c2127]/50 border-[#3b4754]/50 opacity-60"
                            }`}
                    >
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-xs font-mono text-gray-500">
                                    {index + 1}
                                </span>
                                {editingId === field.id ? (
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)}
                                        className="bg-transparent border-b border-[#137fec] text-white text-sm font-medium focus:outline-none px-1"
                                        autoFocus
                                        onBlur={() => setEditingId(null)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingId(field.id)}>
                                        <span className="text-sm font-medium text-white">{field.label}</span>
                                        <span className="material-symbols-outlined text-[14px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                                    </div>
                                )}
                                {field.required && <span className="text-red-400 text-xs">*</span>}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Toggle Visibility */}
                                <button
                                    onClick={() => toggleField(field.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${field.enabled ? "text-green-400 hover:bg-green-400/10" : "text-gray-500 hover:bg-gray-500/10"
                                        }`}
                                    title={field.enabled ? "Aktif" : "Pasif"}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {field.enabled ? "visibility" : "visibility_off"}
                                    </span>
                                </button>

                                {/* Delete (Only non-system) */}
                                {!field.isSystem && (
                                    <button
                                        onClick={() => removeField(field.id)}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                                        title="Sil"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details (Expanded when enabled) */}
                        {field.enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-white/5 text-xs">
                                <div>
                                    <label className="block text-gray-500 mb-1">Tip</label>
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateFieldProperty(field.id, "type", e.target.value)}
                                        className="w-full bg-[#111418] border border-[#3b4754] rounded px-2 py-1.5 text-gray-300 focus:border-[#137fec]"
                                        disabled={field.isSystem} // System fields can't change type usually
                                    >
                                        <option value="text">Metin</option>
                                        <option value="email">E-posta</option>
                                        <option value="tel">Telefon</option>
                                        <option value="textarea">Uzun Metin</option>
                                        <option value="select">Seçim Kutusu</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">Genişlik</label>
                                    <select
                                        value={field.width || "full"}
                                        onChange={(e) => updateFieldProperty(field.id, "width", e.target.value)}
                                        className="w-full bg-[#111418] border border-[#3b4754] rounded px-2 py-1.5 text-gray-300 focus:border-[#137fec]"
                                    >
                                        <option value="full">Tam (%100)</option>
                                        <option value="half">Yarım (%50)</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-gray-500 mb-1">Placeholder (İpucu)</label>
                                    <input
                                        type="text"
                                        value={field.placeholder}
                                        onChange={(e) => updateFieldProperty(field.id, "placeholder", e.target.value)}
                                        className="w-full bg-[#111418] border border-[#3b4754] rounded px-2 py-1.5 text-gray-300 focus:border-[#137fec]"
                                    />
                                </div>
                                {field.type === 'select' && (
                                    <div className="col-span-2">
                                        <label className="block text-gray-500 mb-1">Seçenekler (Virgülle ayırın)</label>
                                        <input
                                            type="text"
                                            value={field.options?.join(', ') || ''}
                                            onChange={(e) => updateFieldProperty(field.id, "options", e.target.value.split(',').map(s => s.trim()))}
                                            placeholder="Örn: Seçenek 1, Seçenek 2"
                                            className="w-full bg-[#111418] border border-[#3b4754] rounded px-2 py-1.5 text-gray-300 focus:border-[#137fec]"
                                        />
                                    </div>
                                )}
                                <div className="col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`req_${field.id}`}
                                        checked={field.required}
                                        onChange={(e) => updateFieldProperty(field.id, "required", e.target.checked)}
                                        className="w-4 h-4 rounded bg-[#111418] border border-[#3b4754] text-[#137fec] focus:ring-0"
                                    />
                                    <label htmlFor={`req_${field.id}`} className="text-gray-400 select-none">Zorunlu Alan</label>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
