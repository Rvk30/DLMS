'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { format, differenceInDays } from 'date-fns';
import {
    Search, Filter, Download, ChevronRight, CheckCircle2,
    Clock, AlertCircle, AlertOctagon
} from 'lucide-react';
import { LibrarianReturnModal } from '@/components/modals/LibrarianReturnModal';

export default function TransactionsPage() {
    const { user } = useAuthStore();
    const isLibrarian = user?.role === 'LIBRARIAN';
    const [page, setPage] = useState(1);

    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isLibrarianModalOpen, setIsLibrarianModalOpen] = useState(false);

    const { data: txData, refetch } = useQuery({
        queryKey: ['transactions', page],
        queryFn: () => api.get(`/transactions/history?page=${page}&limit=10`).then(r => r.data.data),
    });

    const handleLibrarianReturn = async (data: { waiveFine: boolean; waiverReason?: string }) => {
        if (!selectedTx) return;
        await api.post(`/transactions/return/${selectedTx.id}`, data);
        refetch();
    };

    const transactions: any[] = txData?.transactions || [];
    const totalPages = txData?.totalPages || 1;

    return (
        <AppShell>
            <LibrarianReturnModal
                isOpen={isLibrarianModalOpen}
                onClose={() => setIsLibrarianModalOpen(false)}
                onConfirm={handleLibrarianReturn}
                bookTitle={selectedTx?.book?.title ?? ''}
                borrowerName={selectedTx?.student?.user?.name ?? 'Unknown Student'}
                overdueDays={selectedTx ? Math.max(0, differenceInDays(new Date(), new Date(selectedTx.dueDate))) : 0}
                fineAmount={selectedTx?.fine?.totalAmount ?? 0}
            />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
                        <p className="text-slate-500 text-sm">View and manage all book circulations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost flex items-center gap-2 text-sm border border-slate-200">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        {isLibrarian && (
                            <a href="/admin/books" className="btn-primary flex items-center gap-2 text-sm">
                                Issue New Book
                            </a>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-card mb-6 flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by book, student or ID..." className="form-input pl-11" />
                    </div>
                    <select className="form-input w-auto min-w-[140px]">
                        <option value="">All Status</option>
                        <option value="ISSUED">Issued</option>
                        <option value="RETURNED">Returned</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Filter className="w-4 h-4" /> More Filters
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3">Book</th>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Date Issued</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t: any, i: number) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                                                        {t.book?.title?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-slate-900 truncate max-w-[180px]">{t.book?.title}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{t.book?.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-900 font-medium">{t.student?.user?.name}</p>
                                                <p className="text-[10px] text-slate-400">{t.student?.studentId}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {format(new Date(t.dateIssued), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500">{format(new Date(t.dueDate), 'dd MMM yyyy')}</p>
                                                {t.dateReturned && (
                                                    <p className="text-[10px] text-emerald-600 mt-1">Returned: {format(new Date(t.dateReturned), 'dd MMM yyyy')}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge-${t.status.toLowerCase()}`}>
                                                    {t.status === 'ISSUED' && <Clock className="w-3 h-3 mr-1 inline" />}
                                                    {t.status === 'RETURNED' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                                                    {t.status === 'OVERDUE' && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    {isLibrarian && t.status !== 'RETURNED' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTx(t);
                                                                setIsLibrarianModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md text-[10px] font-bold transition-all active:scale-95"
                                                        >
                                                            Process Return
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Overdue warning */}
                {!isLibrarian && transactions.some(t => t.status === 'OVERDUE') && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                        <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                        <span>You have overdue books! Please return them immediately to avoid increasing fines.</span>
                    </motion.div>
                )}
            </motion.div>
        </AppShell>
    );
}
