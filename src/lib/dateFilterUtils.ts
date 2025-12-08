import { DateRangeOption } from "@/components/dashboard/DateFilter";

export function filterByDate<T>(
    data: T[],
    dateField: keyof T,
    range: DateRangeOption,
    customStart?: string,
    customEnd?: string
): T[] {
    if (range === "all") return data;

    const now = new Date();
    // Normalize "today" to start of day 00:00:00 local time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return data.filter((item) => {
        const itemDateStr = item[dateField];
        if (!itemDateStr) return false;

        // Parse date carefully
        let itemDate: Date | null = null;
        const str = String(itemDateStr).trim();

        if (str.includes('.')) {
            // Assume DD.MM.YYYY (TR format)
            const parts = str.split('.');
            if (parts.length === 3) {
                // Month is 0-indexed in JS Date
                itemDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        } else if (str.includes('-')) {
            // Assume YYYY-MM-DD (ISO format)
            const parts = str.split('-');
            if (parts.length === 3) {
                itemDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }

        // Check validation
        if (!itemDate || isNaN(itemDate.getTime())) {
            // Try standard parser as fallback
            itemDate = new Date(str);
        }

        if (isNaN(itemDate.getTime())) return false;

        // Reset time component of itemDate to compare dates only
        itemDate.setHours(0, 0, 0, 0);

        switch (range) {
            case "today":
                return itemDate.getTime() === today.getTime();
            case "7days":
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return itemDate >= sevenDaysAgo;
            case "30days":
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return itemDate >= thirtyDaysAgo;
            case "90days":
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                return itemDate >= ninetyDaysAgo;
            case "custom":
                if (!customStart || !customEnd) return true;
                const start = new Date(customStart);
                start.setHours(0, 0, 0, 0);

                const end = new Date(customEnd);
                end.setHours(23, 59, 59, 999);
                return itemDate >= start && itemDate <= end;
            default:
                return true;
        }
    });
}
