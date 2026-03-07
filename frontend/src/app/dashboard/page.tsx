'use client';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { BookOpen, Clock, AlertTriangle, IndianRupee, Calendar, BookX } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <div className="stat-card flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-brand-navy mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const studentId = user?.student?.id;

    const { data: txData } = useQuery({
        queryKey: ['my-transactions'],
        queryFn: () => api.get('/transactions/history?status=ISSUED&limit=10').then(r => r.data.data),
        enabled: !!studentId,
    });

    const { data: fineData } = useQuery({
        queryKey: ['my-fines-summary'],
        queryFn: () => api.get('/fines/summary').then(r => r.data.data),
        enabled: !!studentId,
    });

    const transactions: any[] = txData || [];
    const overdue = transactions.filter((t: any) => t.status === 'OVERDUE');
    const issued = transactions.filter((t: any) => t.status === 'ISSUED');

    return (
        <AppShell>
            {/* Welcome banner */}
            <div className="rounded-2xl mb-6 p-6 text-white flex items-center justify-between overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2E4D7B 100%)' }}>
                <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5">
                    <BookOpen className="w-full h-full" />
                </div>
                <div>
                    <p className="text-blue-300 text-sm">Welcome back,</p>
                    <h1 className="text-2xl font-bold">{user?.name} 👋</h1>
                    <p className="text-blue-200 text-sm mt-1">
                        {format(new Date(), 'EEEE, dd MMMM yyyy')}
                    </p>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-blue-300 text-xs">Student ID</p>
                    <p className="text-white font-mono font-semibold">{user?.student?.studentId}</p>
                    <p className="text-blue-200 text-xs mt-1">{user?.student?.className}</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={BookOpen} label="Books Borrowed"
                    value={`${user?.student?.borrowedCount ?? 0}/3`}
                    color="bg-blue-100 text-blue-700" />
                <StatCard icon={AlertTriangle} label="Overdue"
                    value={overdue.length}
                    color="bg-red-100 text-red-700" />
                <StatCard icon={IndianRupee} label="Fine Amount"
                    value={`₹${Number(fineData?.pending?.amount ?? user?.student?.account?.outstandingFine ?? 0).toFixed(0)}`}
                    color="bg-yellow-100 text-yellow-700" />
                <StatCard icon={Clock} label="Books Issued"
                    value={issued.length}
                    color="bg-green-100 text-green-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Currently Borrowed Books */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-card">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h2 className="font-semibold text-brand-navy flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Currently Borrowed Books
                            </h2>
                            <span className="text-xs text-muted-foreground">{user?.student?.borrowedCount ?? 0} / 3 books</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {transactions.filter(t => ['ISSUED', 'OVERDUE'].includes(t.status)).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookX className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No books currently borrowed</p>
                                </div>
                            ) : (
                                transactions.filter(t => ['ISSUED', 'OVERDUE'].includes(t.status)).map((t: any) => {
                                    const daysLeft = differenceInDays(new Date(t.dueDate), new Date());
                                    const isOv = t.status === 'OVERDUE' || daysLeft < 0;
                                    return (
                                        <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                                            <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                                                style={{ background: 'linear-gradient(135deg, #1E3A5F, #2E4D7B)' }}>
                                                {t.book?.title?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-brand-navy truncate">{t.book?.title}</p>
                                                <p className="text-xs text-muted-foreground">{t.book?.author}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Due: {format(new Date(t.dueDate), 'dd MMM yyyy')}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className={isOv ? 'badge-overdue' : daysLeft <= 3 ? 'badge-pending' : 'badge-available'}>
                                                    {isOv ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                                                </span>
                                                {t.fine && (
                                                    <p className="text-xs text-red-600 font-semibold mt-1">₹{t.fine.totalAmount}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Fine Summary */}
                    <div className="bg-white rounded-xl shadow-card p-5">
                        <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Fine Summary
                        </h3>
                        {Number(fineData?.pending?.amount ?? 0) > 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-yellow-700 text-xs font-medium">Outstanding Fine</p>
                                <p className="text-3xl font-bold text-yellow-800 mt-1">
                                    ₹{Number(fineData?.pending?.amount ?? 0).toFixed(2)}
                                </p>
                                <p className="text-yellow-600 text-xs mt-1">
                                    {fineData?.pending?.count} overdue item(s)
                                </p>
                                <a href="/fines" className="btn-secondary w-full mt-3 text-xs">Pay Fine</a>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-3xl mb-1">✅</div>
                                <p className="text-sm text-green-700 font-medium">No outstanding fines</p>
                            </div>
                        )}
                    </div>

                    {/* Borrow limit progress */}
                    <div className="bg-white rounded-xl shadow-card p-5">
                        <h3 className="font-semibold text-brand-navy mb-3">Borrow Limit</h3>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>{user?.student?.borrowedCount ?? 0} borrowed</span>
                            <span>3 max</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="h-2.5 rounded-full transition-all duration-500"
                                style={{
                                    width: `${((user?.student?.borrowedCount ?? 0) / 3) * 100}%`,
                                    background: (user?.student?.borrowedCount ?? 0) >= 3 ? '#DC2626' : '#1E3A5F',
                                }} />
                        </div>
                        {(user?.student?.borrowedCount ?? 0) >= 3 && (
                            <p className="text-red-600 text-xs mt-2 font-medium">Maximum limit reached. Return a book to borrow more.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
