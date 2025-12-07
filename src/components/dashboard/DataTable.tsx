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

    return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#111418]">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
                <span className="text-xs text-gray-400">
                    {processedData.length} kayıt
                </span>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${showFilters ? "bg-[#137fec] text-white" : "text-gray-400 hover:text-white"
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filtrele
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-xs text-white bg-[#1c2127]">
                        <tr className="border-b border-gray-700">
                            {selectable && (
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === processedData.length && processedData.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-600 bg-transparent"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-4 py-3 font-medium ${column.width || ""}`}
                                >
                                    {column.sortable !== false ? (
                                        <button
                                            onClick={() => handleSort(String(column.key))}
                                            className="flex items-center gap-1 hover:text-[#137fec] transition-colors"
                                        >
                                            {column.label}
                                            <span className="material-symbols-outlined text-sm">
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
                                {columns.map((column) => (
                                    <th key={`filter-${String(column.key)}`} className="px-4 py-2">
                                        {column.searchable !== false ? (
                                            <input
                                                type="text"
                                                value={columnFilters[String(column.key)] || ""}
                                                onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
                                                placeholder={`${column.label} ara...`}
                                                className="w-full px-2 py-1 text-xs rounded bg-[#111418] border border-gray-700 text-white placeholder:text-gray-500 focus:border-[#137fec] focus:outline-none font-normal"
                                            />
                                        ) : null}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="text-sm text-white">
                        {processedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-8 text-center text-gray-400"
                                >
                                    Kayıt bulunamadı
                                </td>
                            </tr>
                        ) : (
                            processedData.map((item) => {
                                const rowId = getRowId(item);
                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(item)}
                                        className={`border-b border-gray-700 transition-colors ${onRowClick ? "cursor-pointer hover:bg-white/5" : ""
                                            } ${selectedIds.includes(rowId) ? "bg-[#137fec]/10" : ""}`}
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
                                                    className="h-4 w-4 rounded border-gray-600 bg-transparent"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td key={String(column.key)} className="px-4 py-3">
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
        </div>
    );
}
