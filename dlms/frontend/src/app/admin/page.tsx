'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireLibrarian } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import {
    BookOpen, Users, AlertTriangle, RotateCcw,
    IndianRupee, TrendingUp, CheckCircle, BookMarked
} from 'lucide-react';
import { format } from 'date-fns';

const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

function StatCard({ icon: Icon, label, value, sub, color, index }: any) {
    return (
        <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible"
            className="stat-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mt-1">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </motion.div>
    );
}

export default function AdminDashboardPage() {
    useRequireLibrarian();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
        refetchInterval: 60_000,
    });

    if (isLoading) return (
        <AppShell>
            <div className="h-96 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                    Loading dashboard…
                </div>
            </div>
        </AppShell>
    );

    const s = stats;

    return (
        <AppShell>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-6 mb-6 text-white overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <h1 className="text-2xl font-bold tracking-tight">Librarian Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {format(new Date(), 'EEEE, dd MMMM yyyy')} &nbsp;·&nbsp; Real-time library overview
                </p>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3 text-center">
                    {[
                        { label: 'Issued Today', val: s?.today?.issued ?? 0 },
                        { label: 'Returned Today', val: s?.today?.returned ?? 0 },
                    ].map(({ label, val }) => (
                        <div key={label} className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                            <p className="text-2xl font-bold text-blue-400">{val}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={BookMarked} label="Total Books"
                    value={s?.books?.total ?? 0}
                    sub={`${s?.books?.totalCopies ?? 0} copies total`}
                    color="bg-blue-50 text-blue-600" index={0} />
                <StatCard icon={CheckCircle} label="Available Copies"
                    value={s?.books?.available ?? 0}
                    sub={`${s?.books?.issued ?? 0} currently issued`}
                    color="bg-emerald-50 text-emerald-600" index={1} />
                <StatCard icon={AlertTriangle} label="Overdue Books"
                    value={s?.books?.overdue ?? 0}
                    sub="Require immediate action"
                    color="bg-red-50 text-red-600" index={2} />
                <StatCard icon={Users} label="Total Students"
                    value={s?.users?.students ?? 0}
                    sub={`${s?.users?.total ?? 0} total users`}
                    color="bg-violet-50 text-violet-600" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-card">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                            <RotateCcw className="w-4 h-4 text-blue-600" /> Recent Transactions
                        </h2>
                        <a href="/transactions" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr><th>Book</th><th>Student</th><th>Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {(s?.recentTransactions ?? []).slice(0, 8).map((t: any) => (
                                    <tr key={t.id}>
                                        <td className="text-sm font-medium text-slate-900">{t.book?.title}</td>
                                        <td className="text-sm text-slate-500">{t.student?.user?.name}</td>
                                        <td className="text-sm text-slate-500">{format(new Date(t.createdAt), 'dd MMM')}</td>
                                        <td><span className={t.status === 'ISSUED' ? 'badge-issued' : t.status === 'OVERDUE' ? 'badge-overdue' : 'badge-returned'}>{t.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Right column */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="space-y-4">
                    {/* Fine Alert */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                            <IndianRupee className="w-4 h-4 text-amber-500" /> Outstanding Fines
                        </h3>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-red-600">₹{Number(s?.fines?.pendingAmount ?? 0).toFixed(0)}</p>
                            <p className="text-xs text-slate-500 mt-1">{s?.fines?.pendingCount ?? 0} unpaid fines</p>
                        </div>
                    </div>

                    {/* Popular Books */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-blue-600" /> Most Borrowed
                        </h3>
                        <div className="space-y-2.5">
                            {(s?.popularBooks ?? []).slice(0, 5).map((b: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 truncate">{b.title}</p>
                                        <p className="text-[10px] text-slate-400">{b.borrowCount} times</p>
                                    </div>
                                </div>
                            ))}
                            {(!s?.popularBooks || s.popularBooks.length === 0) && (
                                <p className="text-xs text-slate-400 text-center py-2">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Overdue Alerts */}
                    {(s?.overdueAlerts ?? []).length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4" /> Overdue Alerts
                            </h3>
                            <div className="space-y-2">
                                {(s?.overdueAlerts ?? []).slice(0, 3).map((f: any) => (
                                    <div key={f.id} className="text-xs">
                                        <p className="font-medium text-red-700">{f.transaction?.student?.user?.name}</p>
                                        <p className="text-red-500">{f.transaction?.book?.title} — ₹{f.totalAmount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AppShell>
    );
}
