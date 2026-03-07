'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { BookOpen, RotateCcw, AlertOctagon } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
    ISSUED: 'badge-issued', RETURNED: 'badge-returned', OVERDUE: 'badge-overdue', LOST: 'badge-overdue',
};

export default function TransactionsPage() {
    const { user } = useAuthStore();
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', statusFilter],
        queryFn: () =>
            api.get('/transactions/history', { params: { status: statusFilter || undefined, limit: 50 } })
                .then(r => r.data),
    });

    const transactions: any[] = data?.data ?? [];
    const isLibrarian = user?.role === 'LIBRARIAN';

    return (
        <AppShell>
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <BookOpen className="w-6 h-6" /> {isLibrarian ? 'All Transactions' : 'My Books'}
                </h1>
                <select className="form-input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="ISSUED">Issued</option>
                    <option value="RETURNED">Returned</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Book</th>
                                {isLibrarian && <th>Student</th>}
                                <th>Issue Date</th>
                                <th>Due Date</th>
                                <th>Return Date</th>
                                <th>Status</th>
                                <th>Fine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: isLibrarian ? 7 : 6 }).map((_, j) => (
                                            <td key={j}><div className="h-4 bg-muted rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={isLibrarian ? 7 : 6} className="text-center py-12 text-muted-foreground">
                                        <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p>No transactions found</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t: any) => (
                                    <tr key={t.id}>
                                        <td>
                                            <div>
                                                <p className="font-semibold text-brand-navy text-sm">{t.book?.title}</p>
                                                <p className="text-xs text-muted-foreground">{t.book?.author}</p>
                                                <p className="text-xs font-mono text-muted-foreground">{t.book?.isbn}</p>
                                            </div>
                                        </td>
                                        {isLibrarian && (
                                            <td>
                                                <p className="text-sm font-medium">{t.student?.user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.student?.user?.email}</p>
                                            </td>
                                        )}
                                        <td className="text-sm">{t.issueDate ? format(new Date(t.issueDate), 'dd MMM yyyy') : '—'}</td>
                                        <td className="text-sm">{t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy') : '—'}</td>
                                        <td className="text-sm">{t.returnDate ? format(new Date(t.returnDate), 'dd MMM yyyy') : '—'}</td>
                                        <td>
                                            <span className={STATUS_LABELS[t.status] || 'badge-pending'}>{t.status}</span>
                                        </td>
                                        <td>
                                            {t.fine ? (
                                                <div>
                                                    <p className={`text-sm font-semibold ${t.fine.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                                                        ₹{t.fine.totalAmount}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{t.fine.status}</p>
                                                </div>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overdue warning */}
            {transactions.some(t => t.status === 'OVERDUE') && (
                <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                    <span>You have overdue books! Please return them immediately to avoid increasing fines.</span>
                </div>
            )}
        </AppShell>
    );
}
