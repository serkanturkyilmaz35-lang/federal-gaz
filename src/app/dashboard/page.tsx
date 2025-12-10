"use client";

import { useState, useRef, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import RealTimeCard from "@/components/dashboard/RealTimeCard";
import ActivePagesCard from "@/components/dashboard/ActivePagesCard";
import { ORDER_STATUS_COLORS, CONTACT_STATUS_COLORS } from "@/components/dashboard/StatusBreakdown";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { robotoRegular } from "@/lib/fontRobotoRegular";
import { robotoBold } from "@/lib/fontRobotoBold";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { filterByDate } from "@/lib/dateFilterUtils";

// ... (keep chart imports)

type DateRange = "today" | "7days" | "30days" | "90days" | "all" | "custom";

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState<DateRange>("today");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const lineChartRef = useRef<any>(null);
    const doughnutChartRef = useRef<any>(null);

    const [orders, setOrders] = useState<any[]>([]);
    const [realTimeStats, setRealTimeStats] = useState({ activeUsers: 0, mobileUsers: 0, desktopUsers: 0 });
    const [activePages, setActivePages] = useState<any[]>([]);
    const [topPages, setTopPages] = useState<any[]>([]);
    const [dbStats, setDbStats] = useState({
        totalOrders: 0,
        dailyOrders: 0,
        filteredOrders: 0,
        totalUsers: 0,
        totalContacts: 0,
        dailyContacts: 0,
        filteredContacts: 0,
        totalPageViews: 0
    });
    const [orderBreakdown, setOrderBreakdown] = useState({ pending: 0, preparing: 0, shipping: 0, completed: 0, cancelled: 0 });
    const [dailyOrderBreakdown, setDailyOrderBreakdown] = useState({ pending: 0, preparing: 0, shipping: 0, completed: 0, cancelled: 0 });
    const [contactBreakdown, setContactBreakdown] = useState({ new: 0, read: 0, replied: 0 });
    const [dailyContactBreakdown, setDailyContactBreakdown] = useState({ new: 0, read: 0, replied: 0 });
    const [chartData, setChartData] = useState<{ labels: string[], ordersData: number[], contactsData: number[] }>({
        labels: [],
        ordersData: [],
        contactsData: []
    });

    // Fetch Orders for Real Data
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                const mappedOrders = data.orders.map((o: any) => {
                    const d = new Date(o.createdAt);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return {
                        id: o.id,
                        date: `${day}.${month}.${year}`,
                        status: o.status
                    };
                });
                setOrders(mappedOrders);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard orders", error);
        }
    };

    // Fetch Analytics for Real-time Data
    const fetchAnalytics = async () => {
        try {
            // Build query string with date filter
            const params = new URLSearchParams();
            params.set('dateRange', dateRange);
            if (dateRange === 'custom' && customStartDate && customEndDate) {
                params.set('customStart', customStartDate);
                params.set('customEnd', customEndDate);
            }

            const res = await fetch(`/api/dashboard/analytics?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRealTimeStats(data.realTime);
                setActivePages(data.activePages);
                setTopPages(data.topPages);
                setDbStats({
                    totalOrders: data.stats.totalOrders,
                    dailyOrders: data.stats.dailyOrders || 0,
                    filteredOrders: data.stats.filteredOrders || 0,
                    totalUsers: data.stats.totalUsers,
                    totalContacts: data.stats.totalContacts,
                    dailyContacts: data.stats.dailyContacts || 0,
                    filteredContacts: data.stats.filteredContacts || 0,
                    totalPageViews: data.stats.totalPageViews || 0
                });
                // Set breakdowns
                if (data.orderBreakdown) setOrderBreakdown(data.orderBreakdown);
                if (data.dailyOrderBreakdown) setDailyOrderBreakdown(data.dailyOrderBreakdown);
                if (data.contactBreakdown) setContactBreakdown(data.contactBreakdown);
                if (data.dailyContactBreakdown) setDailyContactBreakdown(data.dailyContactBreakdown);
                if (data.chartData) {
                    setChartData(data.chartData);
                }
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchAnalytics();
        // Real-time refresh every 15 seconds for faster updates
        const interval = setInterval(() => {
            fetchOrders();
            fetchAnalytics();
        }, 15000);
        return () => clearInterval(interval);
    }, [dateRange, customStartDate, customEndDate]); // Re-fetch when date filter changes

    // Set page title
    useEffect(() => {
        document.title = "Genel Bakış - Federal Gaz";
    }, []);

    const mockQuotes = [
        { id: 1, date: new Date().toLocaleDateString('tr-TR'), status: 'replied' }, // Today
        { id: 2, date: "06.12.2024", status: 'unread' },
        { id: 3, date: "02.12.2024", status: 'read' },
    ];

    // Filter Logic
    // Use REAL orders, fallback to mockQuotes for quotes
    const filteredOrders = filterByDate(orders, "date", dateRange as any, customStartDate, customEndDate);
    const filteredQuotes = filterByDate(mockQuotes, "date", dateRange as any, customStartDate, customEndDate);

    // Stats - use filtered data based on date range
    const isToday = dateRange === 'today';
    const stats = {
        totalOrders: dbStats.totalOrders,
        dailyOrders: isToday ? dbStats.dailyOrders : dbStats.filteredOrders, // Show filtered when not 'today'
        totalContacts: dbStats.totalContacts,
        dailyContacts: isToday ? dbStats.dailyContacts : dbStats.filteredContacts, // Show filtered when not 'today'
        totalUsers: dbStats.totalUsers,
        dailyPageViews: dbStats.totalPageViews,
    };

    // Chart data - Use REAL data from API
    const lineChartData = {
        labels: chartData.labels.length > 0 ? chartData.labels : ["Veri Yok"],
        datasets: [
            {
                label: "Siparişler",
                data: chartData.ordersData.length > 0 ? chartData.ordersData : [0],
                borderColor: "#137fec",
                backgroundColor: "rgba(19, 127, 236, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Talepler",
                data: chartData.contactsData.length > 0 ? chartData.contactsData : [0],
                borderColor: "#22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: { color: "#9ca3af" },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.1)" },
                ticks: { color: "#9ca3af" },
            },
            y: {
                grid: { color: "rgba(255,255,255,0.1)" },
                ticks: { color: "#9ca3af" },
            },
        },
    };

    // Doughnut Chart
    const doughnutChartData = {
        labels: ["Anasayfa", "Ürünler", "Hakkımızda", "İletişim"],
        datasets: [
            {
                data: [45, 25, 20, 10],
                backgroundColor: ["#137fec", "#22c55e", "#eab308", "#6b7280"],
                borderWidth: 0,
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        cutout: "70%",
    };

    const getDateRangeLabel = () => {
        switch (dateRange) {
            case "today": return "Günlük";
            case "7days": return "Son 7 Gün";
            case "30days": return "Son 30 Gün";
            case "90days": return "Son 90 Gün";
            case "custom": return customStartDate && customEndDate
                ? `${customStartDate} - ${customEndDate}`
                : "Özel Tarih";
            default: return "Son 30 Gün";
        }
    };

    // Date label helper


    const handleExportPDF = async () => {
        if (typeof window === "undefined") return;

        try {
            setExporting(true);
            const { jsPDF } = await import("jspdf");

            // Create PDF (A4 size: 210mm x 297mm)
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // --- 1. FONTS (Turkish Support - Embedded Base64) ---
            try {
                // Register Regular
                pdf.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
                pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");

                // Register Bold
                pdf.addFileToVFS("Roboto-Bold.ttf", robotoBold);
                pdf.addFont("Roboto-Bold.ttf", "Roboto", "bold");

                // Set Default
                pdf.setFont("Roboto", "normal");
            } catch (fontError) {
                console.error("Font embedding failed:", fontError);
                alert("Font yükleme hatası! Standart font kullanılacak.");
                pdf.setFont("helvetica", "normal");
            }

            // --- 2. HEADER & LOGO ---
            try {
                const logoRes = await fetch("/dashboard-logo.png");
                if (logoRes.ok) {
                    const logoBlob = await logoRes.blob();
                    const reader = new FileReader();
                    const logoBase64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(logoBlob);
                    });
                    pdf.addImage(logoBase64, "PNG", margin, 15, 12, 12);
                } else {
                    // Fallback Logo
                    pdf.setFillColor(177, 51, 41);
                    pdf.roundedRect(margin, 15, 12, 12, 2, 2, "F");
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(9);
                    pdf.text("FG", margin + 2.5, 22);
                }
            } catch (e) { console.warn("Logo error", e); }

            // Title
            pdf.setFont("Roboto", "bold");

            pdf.setFontSize(20);
            pdf.setTextColor(177, 51, 41); // #b13329
            pdf.text("Federal Gaz", margin + 18, 22);

            pdf.setFont("Roboto", "normal");

            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text("Yönetim Paneli Özet Raporu", margin + 18, 28);

            // ... (rest of function continues, but I need to handle other occurrences too) 
            // Better to match small blocks


            // Report Meta
            pdf.setFontSize(9);
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, pageWidth - margin, 20, { align: "right" });
            pdf.text(`Dönem: ${getDateRangeLabel()}`, pageWidth - margin, 26, { align: "right" });

            let yPos = 35;

            // Divider Line
            pdf.setDrawColor(177, 51, 41);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;


            // --- 3. STATS SECTION (Grid Layout - Cards) ---
            pdf.setFontSize(12);
            pdf.setTextColor(30, 30, 30);
            pdf.setFont("Roboto", "normal");
            pdf.text("Genel İstatistikler", margin, yPos);
            yPos += 6;

            // Define 2x2 Grid for Stats to prevent overlap and mimic dashboard cards
            // Card dimensions
            const availableWidth = pageWidth - (margin * 2);
            const gap = 5;
            const cardWidth = (availableWidth - gap) / 2;
            const cardHeight = 22;

            // Helper to draw stat card
            const drawStatCard = (x: number, y: number, label: string, value: string) => {
                pdf.setFillColor(248, 250, 252);
                pdf.setDrawColor(226, 232, 240);
                pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD"); // Fill and Draw border

                pdf.setFontSize(9);
                pdf.setTextColor(100, 115, 130);
                pdf.setFont("Roboto", "normal");
                pdf.text(label, x + 4, y + 8);

                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
                pdf.setFont("Roboto", "bold"); // Use BOLD for values
                pdf.text(value, x + 4, y + 16);
            };

            // Row 1: Toplam Sipariş, Günlük Sipariş, Toplam Üye
            const cardWidth3 = (availableWidth - gap * 2) / 3;
            const drawStatCard3 = (x: number, y: number, label: string, value: string) => {
                pdf.setFillColor(248, 250, 252);
                pdf.setDrawColor(226, 232, 240);
                pdf.roundedRect(x, y, cardWidth3, cardHeight, 2, 2, "FD");
                pdf.setFontSize(8);
                pdf.setTextColor(100, 115, 130);
                pdf.setFont("Roboto", "normal");
                pdf.text(label, x + 3, y + 7);
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.setFont("Roboto", "bold");
                pdf.text(value, x + 3, y + 15);
            };

            drawStatCard3(margin, yPos, "Toplam Sipariş", stats.totalOrders.toLocaleString("tr-TR"));
            drawStatCard3(margin + cardWidth3 + gap, yPos, "Günlük Sipariş", stats.dailyOrders.toLocaleString("tr-TR"));
            drawStatCard3(margin + (cardWidth3 + gap) * 2, yPos, "Toplam Üye", stats.totalUsers.toLocaleString("tr-TR"));
            yPos += cardHeight + gap;

            // Row 2: Toplam Talep, Günlük Talep, Günlük Ziyaret
            drawStatCard3(margin, yPos, "Toplam Talep", stats.totalContacts.toLocaleString("tr-TR"));
            drawStatCard3(margin + cardWidth3 + gap, yPos, "Günlük Talep", stats.dailyContacts.toLocaleString("tr-TR"));
            drawStatCard3(margin + (cardWidth3 + gap) * 2, yPos, "Günlük Ziyaret", stats.dailyPageViews.toLocaleString("tr-TR"));
            yPos += cardHeight + 10; // Extra spacing after stats


            // --- 4. CHARTS SECTION (Side by Side) ---
            pdf.setFont("Roboto", "normal");
            pdf.setFontSize(12);
            pdf.setTextColor(30, 30, 30);
            pdf.text("Grafik Raporları", margin, yPos);
            yPos += 8;

            let maxChartHeight = 0;

            // Line Chart
            if (lineChartRef.current) {
                try {
                    const canvas = lineChartRef.current.canvas;
                    const tempCanvas = document.createElement("canvas");
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const ctx = tempCanvas.getContext("2d");
                    if (ctx) {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                        ctx.drawImage(canvas, 0, 0);
                        const imgData = tempCanvas.toDataURL("image/jpeg", 0.95);

                        // Roughly 60% width
                        const imgWidth = 110;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        const finalHeight = Math.min(imgHeight, 55);

                        pdf.addImage(imgData, "JPEG", margin, yPos, imgWidth, finalHeight);
                        maxChartHeight = Math.max(maxChartHeight, finalHeight);
                    }
                } catch (e) { console.warn("Line chart error", e); }
            }

            // Doughnut Chart & Custom Legend
            if (doughnutChartRef.current) {
                try {
                    const canvas = doughnutChartRef.current.canvas;
                    const tempCanvas = document.createElement("canvas");
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const ctx = tempCanvas.getContext("2d");
                    if (ctx) {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                        ctx.drawImage(canvas, 0, 0);
                        const imgData = tempCanvas.toDataURL("image/jpeg", 0.95);

                        // Position metrics
                        const chartX = margin + 125; // Increased gap (was 115)
                        const chartWidth = 55;
                        const chartHeight = (canvas.height * chartWidth) / canvas.width;
                        const finalHeight = Math.min(chartHeight, 55);

                        // Title for Doughnut (Centered relative to chart)
                        pdf.setFontSize(10);
                        pdf.setTextColor(50, 50, 50);
                        pdf.setFont("Roboto", "bold");
                        pdf.text("Kullanıcı Kaynakları", chartX + (chartWidth / 2), yPos - 2, { align: "center" });

                        // Image
                        pdf.addImage(imgData, "JPEG", chartX, yPos, chartWidth, finalHeight);
                        maxChartHeight = Math.max(maxChartHeight, finalHeight);

                        // Custom Legend Below
                        let legendY = yPos + finalHeight + 5;
                        const legendX = chartX;
                        pdf.setFontSize(8);

                        const items = [
                            { label: "Anasayfa", val: "45%", color: [59, 130, 246] }, // blue-500
                            { label: "Ürünler", val: "25%", color: [34, 197, 94] },   // green-500
                            { label: "Hakkımızda", val: "20%", color: [234, 179, 8] }, // yellow-500
                            { label: "İletişim", val: "10%", color: [100, 116, 139] }  // slate-500
                        ];

                        items.forEach(item => {
                            pdf.setFont("Roboto", "normal"); // Ensure normal font for legend text
                            // Dot
                            pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
                            pdf.circle(legendX + 2, legendY - 1, 1.5, "F");

                            // Text
                            pdf.setTextColor(80, 80, 80);
                            pdf.text(`${item.label} ${item.val}`, legendX + 6, legendY);
                            legendY += 4;
                        });

                        // Adjust max height to account for legend
                        maxChartHeight = Math.max(maxChartHeight, finalHeight + 20);
                    }
                } catch (e) { console.warn("Doughnut chart error", e); }
            }

            yPos += maxChartHeight + 10;


            // --- 5. TABLE SECTION ---
            pdf.setFontSize(12);
            pdf.setTextColor(30, 30, 30);
            pdf.setFont("Roboto", "normal");
            pdf.text("En Çok Görüntülenen Sayfalar", margin, yPos);
            yPos += 6;

            const colWidths = [80, 35, 35, 30];

            // Header
            pdf.setFillColor(241, 245, 249);
            pdf.rect(margin, yPos, pageWidth - (margin * 2), 8, "F");

            pdf.setFontSize(9);
            pdf.setTextColor(71, 85, 105);
            pdf.setFont("Roboto", "bold"); // Bold Headers

            const headers = ["Sayfa Yolu", "Görüntülenme", "Tekil", "Çıkma"];
            let tableX = margin + 2;
            const headerY = yPos + 5.5;

            headers.forEach((h, i) => {
                pdf.text(h, tableX, headerY);
                tableX += colWidths[i];
            });

            yPos += 8;

            // Body
            pdf.setTextColor(51, 65, 85);
            pdf.setFont("Roboto", "normal"); // Normal Body

            topPages.forEach((page, i) => {
                if (yPos > pageHeight - 15) return;

                if (i % 2 === 1) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(margin, yPos, pageWidth - (margin * 2), 8, "F");
                }

                tableX = margin + 2;
                const rowY = yPos + 5.5;

                pdf.text(page.name, tableX, rowY);
                tableX += colWidths[0];

                pdf.text(page.views.toLocaleString("tr-TR"), tableX, rowY);
                tableX += colWidths[1];

                pdf.text(page.unique.toLocaleString("tr-TR"), tableX, rowY);
                tableX += colWidths[2];

                pdf.text(`${page.bounceRate}`, tableX, rowY);

                yPos += 8;
            });


            // --- 6. FOOTER ---
            const footerY = pageHeight - 10;

            // Divider
            pdf.setDrawColor(177, 51, 41);
            pdf.setLineWidth(0.5);
            pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

            pdf.setFontSize(8);
            pdf.setTextColor(130, 130, 130);
            pdf.setFont("Roboto", "normal"); // Normal Footer

            pdf.text("Federal Gaz - Güvenilir Gaz Çözümleri", margin, footerY);

            // Fix: Shifted to RIGHT as requested, respecting margin
            pdf.text("© 2014 Tüm hakları saklıdır.", pageWidth - margin, footerY, { align: "right" });

            pdf.save(`federal-gaz-rapor-${new Date().toISOString().split("T")[0]}.pdf`);

        } catch (error) {
            console.error("PDF export error:", error);
            // alert("PDF oluşturulurken bir hata oluştu: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl" ref={reportRef}>
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Genel Bakış
                    </h1>
                    <p className="text-base font-normal leading-normal text-gray-400">
                        Web sitesi performans metriklerine hoş geldiniz.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Date Range Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#137fec] pl-4 pr-3 text-white hover:bg-[#137fec]/90 transition-colors"
                        >
                            <p className="text-sm font-medium leading-normal">{getDateRangeLabel()}</p>
                            <span className="material-symbols-outlined text-lg">
                                expand_more
                            </span>
                        </button>
                        {showDatePicker && (
                            <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border border-gray-700 bg-[#1c2127] p-4 shadow-xl">
                                <div className="space-y-2">
                                    {[
                                        { value: "today", label: "Günlük" },
                                        { value: "7days", label: "Son 7 Gün" },
                                        { value: "30days", label: "Son 30 Gün" },
                                        { value: "90days", label: "Son 90 Gün" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setDateRange(option.value as DateRange);
                                                setShowDatePicker(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${dateRange === option.value
                                                ? "bg-[#137fec] text-white"
                                                : "text-gray-300 hover:bg-white/10"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    <hr className="border-gray-700 my-2" />
                                    <p className="text-xs text-gray-400 mb-2">Özel Tarih Aralığı</p>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-gray-700 mb-2"
                                    />
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-gray-700"
                                    />
                                    <button
                                        onClick={() => {
                                            if (customStartDate && customEndDate) {
                                                setDateRange("custom");
                                                setShowDatePicker(false);
                                            }
                                        }}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-[#137fec] text-white text-sm hover:bg-[#137fec]/90"
                                    >
                                        Uygula
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export PDF Button */}
                    <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-700 bg-white/10 px-3 text-gray-300 hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">
                            {exporting ? "hourglass_empty" : "download"}
                        </span>
                        <p className="text-sm font-medium leading-normal">
                            {exporting ? "İndiriliyor..." : "Rapor İndir"}
                        </p>
                    </button>
                </div>
            </div>

            {/* Stats Cards - 6 cards in 3x2 on large screens, 2x3 on small */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {/* Row 1: Toplam Sipariş, Günlük Sipariş, Toplam Üye */}
                <StatsCard
                    title="Toplam Sipariş"
                    value={stats.totalOrders.toLocaleString("tr-TR")}
                    icon="shopping_cart"
                    breakdown={[
                        { label: ORDER_STATUS_COLORS.pending.label, count: orderBreakdown.pending, color: ORDER_STATUS_COLORS.pending.color },
                        { label: ORDER_STATUS_COLORS.preparing.label, count: orderBreakdown.preparing, color: ORDER_STATUS_COLORS.preparing.color },
                        { label: ORDER_STATUS_COLORS.shipping.label, count: orderBreakdown.shipping, color: ORDER_STATUS_COLORS.shipping.color },
                        { label: ORDER_STATUS_COLORS.completed.label, count: orderBreakdown.completed, color: ORDER_STATUS_COLORS.completed.color },
                        { label: ORDER_STATUS_COLORS.cancelled.label, count: orderBreakdown.cancelled, color: ORDER_STATUS_COLORS.cancelled.color },
                    ]}
                />
                <StatsCard
                    title="Günlük Sipariş"
                    value={stats.dailyOrders.toLocaleString("tr-TR")}
                    icon="add_shopping_cart"
                    breakdown={[
                        { label: ORDER_STATUS_COLORS.pending.label, count: dailyOrderBreakdown.pending, color: ORDER_STATUS_COLORS.pending.color },
                        { label: ORDER_STATUS_COLORS.preparing.label, count: dailyOrderBreakdown.preparing, color: ORDER_STATUS_COLORS.preparing.color },
                        { label: ORDER_STATUS_COLORS.shipping.label, count: dailyOrderBreakdown.shipping, color: ORDER_STATUS_COLORS.shipping.color },
                        { label: ORDER_STATUS_COLORS.completed.label, count: dailyOrderBreakdown.completed, color: ORDER_STATUS_COLORS.completed.color },
                        { label: ORDER_STATUS_COLORS.cancelled.label, count: dailyOrderBreakdown.cancelled, color: ORDER_STATUS_COLORS.cancelled.color },
                    ]}
                />
                <StatsCard
                    title="Toplam Üye"
                    value={stats.totalUsers.toLocaleString("tr-TR")}
                    icon="group"
                />
                {/* Row 2: Toplam Talep, Günlük Talep, Günlük Ziyaret */}
                <StatsCard
                    title="Toplam Talep"
                    value={stats.totalContacts.toLocaleString("tr-TR")}
                    icon="chat_bubble"
                    breakdown={[
                        { label: CONTACT_STATUS_COLORS.new.label, count: contactBreakdown.new, color: CONTACT_STATUS_COLORS.new.color },
                        { label: CONTACT_STATUS_COLORS.read.label, count: contactBreakdown.read, color: CONTACT_STATUS_COLORS.read.color },
                        { label: CONTACT_STATUS_COLORS.replied.label, count: contactBreakdown.replied, color: CONTACT_STATUS_COLORS.replied.color },
                    ]}
                />
                <StatsCard
                    title="Günlük Talep"
                    value={stats.dailyContacts.toLocaleString("tr-TR")}
                    icon="mark_chat_unread"
                    breakdown={[
                        { label: CONTACT_STATUS_COLORS.new.label, count: dailyContactBreakdown.new, color: CONTACT_STATUS_COLORS.new.color },
                        { label: CONTACT_STATUS_COLORS.read.label, count: dailyContactBreakdown.read, color: CONTACT_STATUS_COLORS.read.color },
                        { label: CONTACT_STATUS_COLORS.replied.label, count: dailyContactBreakdown.replied, color: CONTACT_STATUS_COLORS.replied.color },
                    ]}
                />
                <StatsCard
                    title="Günlük Ziyaret"
                    value={stats.dailyPageViews.toLocaleString("tr-TR")}
                    icon="visibility"
                />
            </div>

            {/* Charts Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Line Chart */}
                <div className="rounded-xl border border-gray-700 bg-[#151d27] p-4 lg:col-span-2">
                    <h3 className="mb-3 text-base font-bold text-white">
                        Sipariş ve Talep Akışı
                    </h3>
                    <div className="h-48">
                        <Line ref={lineChartRef} data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className="rounded-xl border border-gray-700 bg-[#151d27] p-4">
                    <h3 className="mb-3 text-base font-bold text-white">
                        Kullanıcı Kaynakları
                    </h3>
                    <div className="h-32 mb-3">
                        <Doughnut ref={doughnutChartRef} data={doughnutChartData} options={doughnutChartOptions} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                            { label: "Anasayfa", color: "#137fec", value: "45%" },
                            { label: "Ürünler", color: "#22c55e", value: "25%" },
                            { label: "Hakkımızda", color: "#eab308", value: "20%" },
                            { label: "İletişim", color: "#6b7280", value: "10%" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-gray-400">{item.label}</span>
                                <span className="text-white ml-auto">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Real-time & Active Pages Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <RealTimeCard
                    activeUsers={realTimeStats.activeUsers}
                    mobileUsers={realTimeStats.mobileUsers}
                    desktopUsers={realTimeStats.desktopUsers}
                />
                <ActivePagesCard pages={activePages} />
            </div>

            {/* Top Pages Table - Compact */}
            <div className="rounded-xl border border-gray-700 bg-[#151d27] p-4">
                <h3 className="mb-3 text-base font-bold text-white">
                    En Çok Görüntülenen Sayfalar
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase text-gray-300">
                            <tr>
                                <th className="rounded-l-lg px-4 py-2" scope="col">Sayfa</th>
                                <th className="px-4 py-2" scope="col">Görüntülenme</th>
                                <th className="px-4 py-2" scope="col">Tekil</th>
                                <th className="rounded-r-lg px-4 py-2" scope="col">Çıkma %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPages.map((page, index) => (
                                <tr key={index} className="border-b border-gray-700/50 last:border-0">
                                    <td className="px-4 py-2 font-medium text-white">{page.name}</td>
                                    <td className="px-4 py-2">{page.views.toLocaleString("tr-TR")}</td>
                                    <td className="px-4 py-2">{page.unique.toLocaleString("tr-TR")}</td>
                                    <td className="px-4 py-2">{page.bounceRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
