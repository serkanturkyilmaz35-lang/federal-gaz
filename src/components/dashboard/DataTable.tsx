"use client";

import { useState, useMemo } from "react";

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    render?: (item: T) => React.ReactNode;
    width?: string;
    getValue?: (item: T) => string | number; // For sorting and filtering custom values
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    selectable?: boolean;
    selectedIds?: number[];
    onSelectionChange?: (ids: number[]) => void;
    totalLabel?: string;
    getRowId?: (item: T) => number;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T>({
    data,
    columns,
    onRowClick,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    totalLabel,
    getRowId = (item: any) => item.id,
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(true);

    // Handle sorting
    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortColumn(null);
                setSortDirection(null);
            } else {
                setSortDirection("asc");
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    // Handle column filter change
    const handleFilterChange = (columnKey: string, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [columnKey]: value,
        }));
    };

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...data];

        // Apply column filters
        Object.entries(columnFilters).forEach(([key, filterValue]) => {
            if (filterValue) {
                const column = columns.find((col) => String(col.key) === key);
                result = result.filter((item) => {
                    let value: any;
                    if (column?.getValue) {
                        value = column.getValue(item);
                    } else {
                        value = (item as any)[key];
                    }

                    if (value == null) return false;
                    return String(value)
                        .toLowerCase()
                        .includes(filterValue.toLowerCase());
                });
            }
        });

        // Apply sorting
        if (sortColumn && sortDirection) {
            result.sort((a, b) => {
                const column = columns.find((col) => String(col.key) === sortColumn);
                let aVal: any;
                let bVal: any;

                if (column?.getValue) {
                    aVal = column.getValue(a);
                    bVal = column.getValue(b);
                } else {
                    aVal = (a as any)[sortColumn];
                    bVal = (b as any)[sortColumn];
                }

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                let comparison = 0;
                if (typeof aVal === "string" && typeof bVal === "string") {
                    comparison = aVal.localeCompare(bVal, "tr");
                } else if (typeof aVal === "number" && typeof bVal === "number") {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal), "tr");
                }

                return sortDirection === "desc" ? -comparison : comparison;
            });
        }

        return result;
    }, [data, columnFilters, sortColumn, sortDirection]);

    // Handle select all
    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedIds.length === processedData.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(processedData.map(getRowId));
        }
    };

    // Handle row selection
    const handleRowSelect = (id: number) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((i) => i !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (sortColumn !== columnKey) {
            return "unfold_more";
        }
        return sortDirection === "asc" ? "arrow_upward" : "arrow_downward";
    };

    // --- Pagination Logic ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    // Reset page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [columnFilters]);

    // Ensure current page is valid when data changes
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedData = useMemo(() => {
        if (!selectable) return processedData; // Optional: Only paginate if explicitly requested? 
        // Better: Always paginate if data length > itemsPerPage? 
        // User asked specifically for pagination. 
        // Let's enforce pagination if items > itemsPerPage
        if (processedData.length <= itemsPerPage) return processedData;
        return processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    // For now, let's paginate everyone if > 10 items, or add a prop. 
    // Since I can't easily change the prop in the interface without check, I'll assume standard 10 items pagination is desired for `DataTable`.

    // Actually, I should use the prop `pagination` logic.
    // But I will just enable it by default if length > 20? No, explicitly.
    // Let's just paginate always for now to solve the user issue.

    const displayData = processedData.length > itemsPerPage ? processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : processedData;

    return (
        <div className="rounded-xl border border-gray-700 bg-[#111418] flex flex-col">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3 shrink-0">
                <span className="text-xs text-white font-medium">
                    Toplam {processedData.length} {totalLabel || "kayıt"}
                </span>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilters ? "bg-[#137fec] text-white" : "bg-[#1c2127] text-gray-400 hover:text-white"
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filtrele
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
                <table className="w-full">
                    <thead className="text-left text-xs text-white bg-[#1c2127]">
                        <tr className="border-b border-gray-700">
                            {selectable && (
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === processedData.length && processedData.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-600 bg-transparent focus:ring-0 checked:bg-[#137fec]"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-4 py-3 font-semibold text-gray-300 ${column.width || ""}`}
                                >
                                    {column.sortable !== false ? (
                                        <button
                                            onClick={() => handleSort(String(column.key))}
                                            className="flex items-center gap-1 hover:text-[#137fec] transition-colors group"
                                        >
                                            {column.label}
                                            <span className={`material-symbols-outlined text-sm transition-opacity ${sortColumn === String(column.key) ? 'opacity-100 text-[#137fec]' : 'opacity-30 group-hover:opacity-100'}`}>
                                                {getSortIcon(String(column.key))}
                                            </span>
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}
                        </tr>
                        {/* Filter Row */}
                        {showFilters && (
                            <tr className="border-b border-gray-700 bg-[#161b22]">
                                {selectable && <th className="px-4 py-2"></th>}
                                {columns.map((column) => {
                                    // Don't show filter for columns with empty label or non-searchable
                                    const showFilter = column.searchable !== false && column.label.trim() !== "";
                                    return (
                                        <th key={`filter-${String(column.key)}`} className={`px-2 py-2 ${column.width || ''}`}>
                                            {showFilter ? (
                                                <input
                                                    type="text"
                                                    value={columnFilters[String(column.key)] || ""}
                                                    onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
                                                    placeholder={column.label}
                                                    className="w-full max-w-full px-2 py-1 text-xs rounded bg-[#0d1117] border border-gray-700 text-white placeholder:text-gray-500 focus:border-[#137fec] focus:outline-none transition-all"
                                                />
                                            ) : null}
                                        </th>
                                    );
                                })}
                            </tr>
                        )}
                    </thead>
                    <tbody className="text-sm text-white divide-y divide-gray-800">
                        {displayData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl opacity-20">inbox</span>
                                        <span>Kayıt bulunamadı</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayData.map((item) => {
                                const rowId = getRowId(item);
                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(item)}
                                        className={`transition-colors hover:bg-[#1c2127] ${selectedIds.includes(rowId) ? "bg-[#137fec]/10 hover:bg-[#137fec]/20" : ""}`}
                                    >
                                        {selectable && (
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(rowId)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleRowSelect(rowId);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-4 w-4 rounded border-gray-600 bg-transparent focus:ring-0 checked:bg-[#137fec]"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td key={String(column.key)} className="px-4 py-3 text-gray-300">
                                                {column.render
                                                    ? column.render(item)
                                                    : String((item as any)[column.key] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="border-t border-gray-700 px-4 py-3 bg-[#111418] flex justify-between items-center rounded-b-xl">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-[#1c2127] border border-gray-700 text-gray-300 hover:text-white hover:bg-[#2d333b] hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                        Önceki
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all border ${currentPage === page
                                    ? 'bg-[#137fec] border-[#137fec] text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-[#1c2127] border-gray-700 text-gray-400 hover:text-white hover:bg-[#2d333b] hover:border-gray-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-[#1c2127] border border-gray-700 text-gray-300 hover:text-white hover:bg-[#2d333b] hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Sonraki
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
