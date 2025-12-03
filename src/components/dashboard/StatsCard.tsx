"use client";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        trend: "up" | "down";
    };
    icon?: string;
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127]">
            <div className="flex items-start justify-between">
                <p className="text-base font-medium leading-normal text-[#94847c]">
                    {title}
                </p>
                {icon && (
                    <span className="material-symbols-outlined text-[#94847c]">
                        {icon}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
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
        </div>
    );
}
