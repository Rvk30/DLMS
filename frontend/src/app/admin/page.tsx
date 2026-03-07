'use client';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireLibrarian } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import {
    BookOpen, Users, AlertTriangle, RotateCcw,
    IndianRupee, TrendingUp, CheckCircle, BookMarked
} from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mt-1">{label}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
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
            <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
                    Loading dashboard…
                </div>
            </div>
        </AppShell>
    );

    const s = stats;

    return (
        <AppShell>
            {/* Header */}
            <div className="rounded-2xl p-6 mb-6 text-white overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2E4D7B 100%)' }}>
                <h1 className="text-2xl font-bold">Librarian Dashboard</h1>
                <p className="text-blue-300 text-sm mt-1">
                    {format(new Date(), 'EEEE, dd MMMM yyyy')} &nbsp;·&nbsp; Real-time library overview
                </p>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3 text-center">
                    {[
                        { label: 'Issued Today', val: s?.today?.issued ?? 0 },
                        { label: 'Returned Today', val: s?.today?.returned ?? 0 },
                    ].map(({ label, val }) => (
                        <div key={label} className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                            <p className="text-2xl font-bold text-brand-gold">{val}</p>
                            <p className="text-xs text-blue-200">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={BookMarked} label="Total Books"
                    value={s?.books?.total ?? 0}
                    sub={`${s?.books?.totalCopies ?? 0} copies total`}
                    color="bg-blue-100 text-blue-700" />
                <StatCard icon={CheckCircle} label="Available Copies"
                    value={s?.books?.available ?? 0}
                    sub={`${s?.books?.issued ?? 0} currently issued`}
                    color="bg-green-100 text-green-700" />
                <StatCard icon={AlertTriangle} label="Overdue Books"
                    value={s?.books?.overdue ?? 0}
                    sub="Require immediate action"
                    color="bg-red-100 text-red-700" />
                <StatCard icon={Users} label="Total Students"
                    value={s?.users?.students ?? 0}
                    sub={`${s?.users?.total ?? 0} total users`}
                    color="bg-purple-100 text-purple-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-card">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-brand-navy flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Recent Transactions
                        </h2>
                        <a href="/transactions" className="text-xs text-brand-navy hover:underline">View all</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr><th>Book</th><th>Student</th><th>Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {(s?.recentTransactions ?? []).slice(0, 8).map((t: any) => (
                                    <tr key={t.id}>
                                        <td className="text-sm font-medium">{t.book?.title}</td>
                                        <td className="text-sm text-muted-foreground">{t.student?.user?.name}</td>
                                        <td className="text-sm text-muted-foreground">{format(new Date(t.createdAt), 'dd MMM')}</td>
                                        <td><span className={t.status === 'ISSUED' ? 'badge-issued' : t.status === 'OVERDUE' ? 'badge-overdue' : 'badge-returned'}>{t.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Fine Alert */}
                    <div className="bg-white rounded-xl shadow-card p-5">
                        <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Outstanding Fines
                        </h3>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-red-600">₹{Number(s?.fines?.pendingAmount ?? 0).toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s?.fines?.pendingCount ?? 0} unpaid fines</p>
                        </div>
                    </div>

                    {/* Popular Books */}
                    <div className="bg-white rounded-xl shadow-card p-5">
                        <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Most Borrowed
                        </h3>
                        <div className="space-y-2">
                            {(s?.popularBooks ?? []).slice(0, 5).map((b: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-brand-navy truncate">{b.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{b.borrowCount} times</p>
                                    </div>
                                </div>
                            ))}
                            {(!s?.popularBooks || s.popularBooks.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-2">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Overdue Alerts */}
                    {(s?.overdueAlerts ?? []).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
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
                </div>
            </div>
        </AppShell>
    );
}
