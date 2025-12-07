"use client";

interface RealTimeCardProps {
    activeUsers: number;
    mobileUsers: number;
    desktopUsers: number;
}

export default function RealTimeCard({
    activeUsers,
    mobileUsers,
    desktopUsers,
}: RealTimeCardProps) {
    const mobilePercentage = activeUsers > 0 ? (mobileUsers / activeUsers) * 100 : 0;
    const desktopPercentage = activeUsers > 0 ? (desktopUsers / activeUsers) * 100 : 0;

    return (
        <div className="lg:col-span-1 bg-[#151d27] p-6 rounded-xl border border-gray-700 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-white">
                    Gerçek Zamanlı Takip
                </h3>
                <span className="flex items-center gap-2 text-[#b13329]">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b13329] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#b13329]"></span>
                    </span>
                    <span className="text-sm font-medium">CANLI</span>
                </span>
            </div>
            <div className="my-4">
                <p className="text-6xl font-bold text-white">
                    {activeUsers}
                </p>
                <p className="text-gray-400">şu anda aktif kullanıcı</p>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-400">Mobil</p>
                    <div className="w-2/3 bg-white/10 rounded-full h-2">
                        <div
                            className="bg-[#f4b834] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${mobilePercentage}%` }}
                        ></div>
                    </div>
                    <p className="font-medium text-white w-8 text-right">
                        {mobileUsers}
                    </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-400">Masaüstü</p>
                    <div className="w-2/3 bg-white/10 rounded-full h-2">
                        <div
                            className="bg-[#b13329] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${desktopPercentage}%` }}
                        ></div>
                    </div>
                    <p className="font-medium text-white w-8 text-right">
                        {desktopUsers}
                    </p>
                </div>
            </div>
        </div>
    );
}
