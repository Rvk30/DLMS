'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { BookOpen, Clock, AlertTriangle, IndianRupee, Calendar, BookX } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ReturnModal } from '@/components/modals/ReturnModal';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

function StatCard({ icon: Icon, label, value, color, index }: { icon: any; label: string; value: string | number; color: string; index: number }) {
    return (
        <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible"
            className="stat-card flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
            </div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const studentId = user?.student?.id;

    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    const { data: txData, refetch: refetchTx } = useQuery({
        queryKey: ['my-transactions'],
        queryFn: () => api.get('/transactions/history?status=ISSUED&limit=10').then(r => r.data.data),
        enabled: !!studentId,
    });

    const { data: fineData, refetch: refetchFines } = useQuery({
        queryKey: ['my-fines-summary'],
        queryFn: () => api.get('/fines/summary').then(r => r.data.data),
        enabled: !!studentId,
    });

    const handleReturn = async () => {
        if (!selectedTx) return;
        await api.post(`/transactions/return/${selectedTx.id}`);
        refetchTx();
        refetchFines();
    };

    const transactions: any[] = txData || [];
    const overdue = transactions.filter((t: any) => t.status === 'OVERDUE');
    const issued = transactions.filter((t: any) => t.status === 'ISSUED');

    return (
        <AppShell>
            <ReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={handleReturn}
                bookTitle={selectedTx?.book?.title ?? ''}
                bookAuthor={selectedTx?.book?.author ?? ''}
            />

            {/* Welcome banner */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl mb-6 p-6 text-white flex items-center justify-between overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <div className="absolute right-6 bottom-0 w-48 h-48 opacity-[0.04]">
                    <BookOpen className="w-full h-full" />
                </div>
                <div>
                    <p className="text-slate-400 text-sm">Welcome back,</p>
                    <h1 className="text-2xl font-bold tracking-tight">{user?.name} 👋</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {format(new Date(), 'EEEE, dd MMMM yyyy')}
                    </p>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-slate-400 text-xs">Student ID</p>
                    <p className="text-white font-mono font-semibold">{user?.student?.studentId}</p>
                    <p className="text-slate-400 text-xs mt-1">{user?.student?.className}</p>
                </div>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={BookOpen} label="Books Borrowed"
                    value={`${user?.student?.borrowedCount ?? 0}/3`}
                    color="bg-blue-50 text-blue-600" index={0} />
                <StatCard icon={AlertTriangle} label="Overdue"
                    value={overdue.length}
                    color="bg-red-50 text-red-600" index={1} />
                <StatCard icon={IndianRupee} label="Fine Amount"
                    value={`₹${Number(fineData?.pending?.amount ?? user?.student?.account?.outstandingFine ?? 0).toFixed(0)}`}
                    color="bg-amber-50 text-amber-600" index={2} />
                <StatCard icon={Clock} label="Books Issued"
                    value={issued.length}
                    color="bg-emerald-50 text-emerald-600" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Currently Borrowed Books */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-card">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                                <BookOpen className="w-4 h-4 text-blue-600" /> Currently Borrowed
                            </h2>
                            <span className="text-xs text-slate-400">{user?.student?.borrowedCount ?? 0} / 3 books</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {transactions.filter(t => ['ISSUED', 'OVERDUE'].includes(t.status)).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <BookX className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No books currently borrowed</p>
                                </div>
                            ) : (
                                transactions.filter(t => ['ISSUED', 'OVERDUE'].includes(t.status)).map((t: any, i: number) => {
                                    const daysLeft = differenceInDays(new Date(t.dueDate), new Date());
                                    const isOv = t.status === 'OVERDUE' || daysLeft < 0;
                                    return (
                                        <motion.div
                                            key={t.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ background: 'linear-gradient(135deg, #1e293b, #475569)' }}>
                                                    {t.book?.title?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-slate-900 truncate">{t.book?.title}</p>
                                                    <p className="text-xs text-slate-500">{t.book?.author}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Due: {format(new Date(t.dueDate), 'dd MMM yyyy')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-right flex-shrink-0">
                                                    <span className={isOv ? 'badge-overdue' : daysLeft <= 3 ? 'badge-pending' : 'badge-available'}>
                                                        {isOv ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                                                    </span>
                                                    {t.fine && (
                                                        <p className="text-xs text-red-600 font-semibold mt-1">₹{t.fine.totalAmount}</p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedTx(t);
                                                        setIsReturnModalOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all active:scale-95"
                                                >
                                                    Return
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right column */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="space-y-4">
                    {/* Fine Summary */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                            <IndianRupee className="w-4 h-4 text-amber-500" /> Fine Summary
                        </h3>
                        {Number(fineData?.pending?.amount ?? 0) > 0 ? (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-amber-700 text-xs font-medium">Outstanding Fine</p>
                                <p className="text-3xl font-bold text-amber-800 mt-1">
                                    ₹{Number(fineData?.pending?.amount ?? 0).toFixed(2)}
                                </p>
                                <p className="text-amber-600 text-xs mt-1">
                                    {fineData?.pending?.count} overdue item(s)
                                </p>
                                <a href="/fines" className="btn-primary w-full mt-3 text-xs">Pay Fine</a>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-3xl mb-1">✅</div>
                                <p className="text-sm text-emerald-600 font-medium">No outstanding fines</p>
                            </div>
                        )}
                    </div>

                    {/* Borrow limit progress */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Borrow Limit</h3>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>{user?.student?.borrowedCount ?? 0} borrowed</span>
                            <span>3 max</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((user?.student?.borrowedCount ?? 0) / 3) * 100}%` }}
                                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                className="h-2 rounded-full"
                                style={{
                                    background: (user?.student?.borrowedCount ?? 0) >= 3
                                        ? '#dc2626'
                                        : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                }}
                            />
                        </div>
                        {(user?.student?.borrowedCount ?? 0) >= 3 && (
                            <p className="text-red-600 text-xs mt-2 font-medium">Maximum limit reached. Return a book to borrow more.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AppShell>
    );
}
