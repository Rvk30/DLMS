'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireLibrarian } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import { Search, UserX, UserCheck, Trash2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersPage() {
    useRequireLibrarian();
    const qc = useQueryClient();
    const [q, setQ] = useState('');
    const [role, setRole] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', q, role],
        queryFn: () => api.get('/admin/users', { params: { q: q || undefined, role: role || undefined, limit: 50 } }).then(r => r.data),
    });
    const users: any[] = data?.data ?? [];

    const statusMutation = useMutation({
        mutationFn: ({ studentId, status }: { studentId: string; status: string }) =>
            api.patch(`/admin/students/${studentId}/status`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    return (
        <AppShell>
            <div className="page-header">
                <h1 className="page-title">👥 User Management</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Total: <strong>{data?.meta?.total ?? 0}</strong>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className="form-input pl-10" placeholder="Search by name or email…"
                        value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <select className="form-input w-auto" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="LIBRARIAN">Librarians</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th><th>Role</th><th>Student ID / Emp ID</th>
                                <th>Borrowed</th><th>Fine</th><th>Status</th><th>Joined</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
                                : users.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No users found</td></tr>
                                    : users.map(u => {
                                        const isSuspended = u.student?.account?.status === 'SUSPENDED';
                                        return (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white text-xs font-bold">{u.name?.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-brand-navy">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={u.role === 'LIBRARIAN' ? 'badge-issued' : 'badge-available'}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="text-xs font-mono text-muted-foreground">
                                                    {u.student?.studentId ?? u.librarian?.employeeId ?? '—'}
                                                </td>
                                                <td className="text-sm text-center">{u.student?.borrowedCount ?? '—'}</td>
                                                <td className="text-sm">
                                                    {u.student?.account?.outstandingFine != null
                                                        ? <span className={Number(u.student.account.outstandingFine) > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                                            ₹{Number(u.student.account.outstandingFine).toFixed(0)}
                                                        </span>
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {u.student?.account && (
                                                        <span className={isSuspended ? 'badge-overdue' : 'badge-available'}>
                                                            {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                                                        </span>
                                                    )}
                                                    {!u.student && <span className="text-xs text-muted-foreground">—</span>}
                                                </td>
                                                <td className="text-xs text-muted-foreground">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                                                <td>
                                                    <div className="flex gap-1.5">
                                                        {u.student?.account && (
                                                            <button
                                                                title={isSuspended ? 'Activate account' : 'Suspend account'}
                                                                onClick={() => statusMutation.mutate({ studentId: u.student.id, status: isSuspended ? 'ACTIVE' : 'SUSPENDED' })}
                                                                className={`p-1.5 rounded transition-colors ${isSuspended ? 'hover:bg-green-50 hover:text-green-600' : 'hover:bg-yellow-50 hover:text-yellow-600'} text-muted-foreground`}>
                                                                {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                                            </button>
                                                        )}
                                                        <button
                                                            title="Delete user"
                                                            onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u.id); }}
                                                            className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppShell>
    );
}
