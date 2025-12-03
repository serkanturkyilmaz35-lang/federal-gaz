"use client";

import { useState } from "react";

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data
    const users = [
        {
            id: 1,
            name: "Ali Yılmaz",
            email: "ali@example.com",
            role: "admin",
            company: "ABC Ltd.",
            isActive: true,
            lastLogin: "2024-12-03",
        },
        {
            id: 2,
            name: "Ayşe Demir",
            email: "ayse@example.com",
            role: "editor",
            company: "XYZ A.Ş.",
            isActive: true,
            lastLogin: "2024-12-02",
        },
        {
            id: 3,
            name: "Mehmet Kaya",
            email: "mehmet@example.com",
            role: "user",
            company: "DEF Şirketi",
            isActive: false,
            lastLogin: "2024-11-28",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
                        Kullanıcı Yönetimi
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#94847c]">
                        Kullanıcıları yönetin ve yetkilendirin
                    </p>
                </div>
                <button className="flex h-10 items-center gap-2 rounded-lg bg-[#b13329] px-4 text-white hover:bg-[#b13329]/90">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    <span className="text-sm font-medium">Yeni Kullanıcı</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-[#94847c]">
                            search
                        </span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none focus:ring-2 focus:ring-[#b13329]/20 dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                        placeholder="Kullanıcı ara..."
                    />
                </div>
                <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white">
                    <option value="all">Tüm Roller</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="user">Kullanıcı</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-[#3b4754]">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-[#283039]">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Kullanıcı
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Şirket
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Son Giriş
                            </th>
                            <th className="w-24 px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1c2127]">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-t border-gray-200 hover:bg-gray-50 dark:border-[#3b4754] dark:hover:bg-[#283039]"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b13329]">
                                            <span className="font-bold text-white">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#292828] dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-[#94847c]">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {user.company}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role === "admin"
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                : user.role === "editor"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                            }`}
                                    >
                                        {user.role === "admin"
                                            ? "Admin"
                                            : user.role === "editor"
                                                ? "Editor"
                                                : "Kullanıcı"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.isActive
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            }`}
                                    >
                                        {user.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {user.lastLogin}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="text-[#94847c] hover:text-[#b13329]"
                                            title="Düzenle"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            className="text-[#94847c] hover:text-red-500"
                                            title="Sil"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
