'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { IndianRupee, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.35 },
    }),
};

export default function FinesPage() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [paying, setPaying] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['my-fines'],
        queryFn: () => api.get('/fines').then(r => r.data),
    });

    const { data: summary } = useQuery({
        queryKey: ['fine-summary'],
        queryFn: () => api.get('/fines/summary').then(r => r.data.data),
    });

    const payMutation = useMutation({
        mutationFn: (fineId: string) => api.post(`/fines/${fineId}/pay`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-fines'] }); qc.invalidateQueries({ queryKey: ['fine-summary'] }); },
        onSettled: () => setPaying(null),
    });

    const fines: any[] = data?.data ?? [];

    return (
        <AppShell>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <IndianRupee className="w-6 h-6 text-amber-500" /> My Fines
                </h1>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Outstanding', amount: summary?.pending?.amount ?? 0, color: 'bg-red-50 border-red-100 text-red-700', i: 0 },
                    { label: 'Total Paid', amount: summary?.paid?.amount ?? 0, color: 'bg-emerald-50 border-emerald-100 text-emerald-700', i: 1 },
                    { label: 'Waived', amount: summary?.waived?.amount ?? 0, color: 'bg-blue-50 border-blue-100 text-blue-700', i: 2 },
                ].map(({ label, amount, color, i }) => (
                    <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                        className={`rounded-xl border p-4 ${color}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
                        <p className="text-2xl font-bold mt-1">₹{Number(amount).toFixed(2)}</p>
                    </motion.div>
                ))}
            </div>

            {/* Fines table */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden"
            >
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Book</th><th>Days Overdue</th><th>Rate</th><th>Total Fine</th><th>Status</th><th>Date</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading…</td></tr>
                        ) : fines.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-400">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                                    <p>No fines — great job!</p>
                                </td>
                            </tr>
                        ) : (
                            fines.map((f: any) => (
                                <tr key={f.id}>
                                    <td>
                                        <p className="font-medium text-sm text-slate-900">{f.transaction?.book?.title}</p>
                                        <p className="text-xs text-slate-400">{f.transaction?.book?.author}</p>
                                    </td>
                                    <td className="text-sm text-slate-700">{f.daysOverdue} days</td>
                                    <td className="text-sm text-slate-700">₹{f.ratePerDay}/day</td>
                                    <td className="text-sm font-bold text-red-600">₹{f.totalAmount}</td>
                                    <td>
                                        <span className={f.status === 'PAID' ? 'badge-returned' : f.status === 'WAIVED' ? 'badge-issued' : 'badge-overdue'}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-slate-500">
                                        {f.createdAt ? format(new Date(f.createdAt), 'dd MMM yyyy') : '—'}
                                    </td>
                                    <td>
                                        {f.status === 'PENDING' && (
                                            <button className="btn-primary text-xs px-3 py-1.5"
                                                disabled={paying === f.id}
                                                onClick={() => { setPaying(f.id); payMutation.mutate(f.id); }}>
                                                {paying === f.id ? 'Processing…' : 'Pay Now'}
                                            </button>
                                        )}
                                        {f.status !== 'PENDING' && (
                                            <span className="text-xs text-slate-400">
                                                {f.status === 'PAID' ? `Paid ${format(new Date(f.paidAt), 'dd MMM')}` : 'Waived'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>
        </AppShell>
    );
}
