"use client";

interface ActivePage {
    url: string;
    users: number;
    percentage: number;
}

interface ActivePagesCardProps {
    pages: ActivePage[];
}

export default function ActivePagesCard({ pages }: ActivePagesCardProps) {
    return (
        <div className="lg:col-span-2 bg-[#151d27] p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">
                Aktif Sayfalar
            </h3>
            <div className="space-y-3">
                {pages.map((page, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-10 gap-4 items-center text-sm"
                    >
                        <div className="col-span-6 font-medium text-white truncate">
                            {page.url}
                        </div>
                        <div className="col-span-2 text-gray-400">
                            {page.users} kullanıcı
                        </div>
                        <div className="col-span-2 w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-[#b13329] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${page.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
