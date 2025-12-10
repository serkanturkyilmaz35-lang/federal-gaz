"use client";

import StatusBreakdown from "./StatusBreakdown";

interface StatusItem {
    label: string;
    count: number;
    color: string;
}

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        trend: "up" | "down";
    };
    icon?: string;
    breakdown?: StatusItem[];
}

export default function StatsCard({ title, value, change, icon, breakdown }: StatsCardProps) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-[#151d27] p-6">
            <div className="flex items-start justify-between">
                <p className="text-base font-medium leading-normal text-gray-400">
                    {title}
                </p>
                {icon && (
                    <span className="material-symbols-outlined text-gray-500">
                        {icon}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold leading-tight tracking-tight text-white">
                {value}
            </p>
            {change && (
                <p
                    className={`flex items-center gap-1 text-sm font-medium leading-normal ${change.trend === "up" ? "text-green-500" : "text-red-500"
                        }`}
                >
                    <span className="material-symbols-outlined text-base">
                        {change.trend === "up" ? "trending_up" : "trending_down"}
                    </span>
                    <span>{change.value}</span>
                </p>
            )}
            {breakdown && breakdown.length > 0 && (
                <StatusBreakdown items={breakdown} compact />
            )}
        </div>
    );
}

