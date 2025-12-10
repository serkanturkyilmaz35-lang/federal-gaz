"use client";

interface StatusItem {
    label: string;
    count: number;
    color: string;
}

interface StatusBreakdownProps {
    items: StatusItem[];
    compact?: boolean;
}

export default function StatusBreakdown({ items, compact = false }: StatusBreakdownProps) {
    // Filter out items with 0 count in compact mode
    const displayItems = compact ? items.filter(item => item.count > 0) : items;

    if (displayItems.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
            {displayItems.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center gap-1.5 text-xs"
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.count}</span>
                </div>
            ))}
        </div>
    );
}

// Status colors constants
export const ORDER_STATUS_COLORS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Beklemede', color: '#eab308' },    // Yellow
    processing: { label: 'İşleniyor', color: '#3b82f6' }, // Blue
    shipped: { label: 'Kargoda', color: '#8b5cf6' },      // Purple
    delivered: { label: 'Teslim', color: '#22c55e' },     // Green
    cancelled: { label: 'İptal', color: '#ef4444' },      // Red
};

export const CONTACT_STATUS_COLORS: Record<string, { label: string; color: string }> = {
    new: { label: 'Yeni', color: '#3b82f6' },             // Blue
    read: { label: 'Okundu', color: '#6b7280' },          // Gray
    replied: { label: 'Yanıtlandı', color: '#22c55e' },   // Green
};
