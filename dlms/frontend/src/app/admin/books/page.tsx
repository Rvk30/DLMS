'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireLibrarian } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const CATEGORIES = ['TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'FICTION', 'NON_FICTION', 'HISTORY', 'BIOGRAPHY', 'LITERATURE', 'ARTS', 'PHILOSOPHY', 'LAW', 'MEDICINE', 'REFERENCE', 'OTHER'];
const EMPTY = { title: '', author: '', isbn: '', category: 'TECHNOLOGY', description: '', totalCopies: 1, publishedYear: '', publisher: '', language: 'English', location: '' };

export default function AdminBooksPage() {
    useRequireLibrarian();
    const qc = useQueryClient();
    const [q, setQ] = useState('');
    const [modal, setModal] = useState<null | 'add' | 'edit'>(null);
    const [selected, setSelected] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [formError, setFormError] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-books', q],
        queryFn: () => api.get('/books/search', { params: { q: q || undefined, limit: 50 } }).then(r => r.data.data),
    });
    const books: any[] = data ?? [];

    const upsertMutation = useMutation({
        mutationFn: (payload: any) =>
            modal === 'add' ? api.post('/books', payload) : api.put(`/books/${selected.id}`, payload),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-books'] }); closeMod(); },
        onError: (err: any) => setFormError(err?.response?.data?.message || 'Failed to save book.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/books/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-books'] }),
    });

    const openAdd = () => { setForm(EMPTY); setFormError(''); setModal('add'); };
    const openEdit = (b: any) => { setSelected(b); setForm({ ...b }); setFormError(''); setModal('edit'); };
    const closeMod = () => { setModal(null); setSelected(null); };

    const onChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f: any) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        upsertMutation.mutate({ ...form, totalCopies: Number(form.totalCopies), publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined });
    };

    return (
        <AppShell>
            <div className="page-header">
                <h1 className="page-title">📚 Book Management</h1>
                <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Book</button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className="form-input pl-10" placeholder="Search by title, author, ISBN…"
                    value={q} onChange={e => setQ(e.target.value)} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr><th>Title / ISBN</th><th>Author</th><th>Category</th><th>Copies</th><th>Available</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
                                : books.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No books found</td></tr>
                                    : books.map(b => (
                                        <tr key={b.id}>
                                            <td>
                                                <p className="font-semibold text-sm text-brand-navy">{b.title}</p>
                                                <p className="text-xs font-mono text-muted-foreground">{b.isbn}</p>
                                            </td>
                                            <td className="text-sm">{b.author}</td>
                                            <td><span className="text-xs bg-muted px-2 py-0.5 rounded-full">{b.category}</span></td>
                                            <td className="text-sm text-center">{b.totalCopies}</td>
                                            <td className="text-sm text-center">{b.availableCopies}</td>
                                            <td><span className={b.availableCopies > 0 ? 'badge-available' : 'badge-overdue'}>{b.status}</span></td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => { if (confirm('Delete this book?')) deleteMutation.mutate(b.id); }}
                                                        className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="font-bold text-brand-navy">{modal === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
                            <button onClick={closeMod} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formError && <div className="sm:col-span-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{formError}</div>}
                            {[
                                { k: 'title', label: 'Title', span: 2 },
                                { k: 'author', label: 'Author' },
                                { k: 'isbn', label: 'ISBN' },
                                { k: 'publisher', label: 'Publisher' },
                                { k: 'publishedYear', label: 'Published Year' },
                                { k: 'totalCopies', label: 'Total Copies', type: 'number' },
                                { k: 'location', label: 'Shelf Location' },
                                { k: 'language', label: 'Language' },
                            ].map(({ k, label, span, type }) => (
                                <div key={k} className={span === 2 ? 'sm:col-span-2' : ''}>
                                    <label className="form-label">{label}</label>
                                    <input className="form-input" type={type || 'text'} value={form[k] ?? ''} onChange={onChange(k)}
                                        required={['title', 'author', 'isbn', 'totalCopies'].includes(k)} />
                                </div>
                            ))}
                            <div>
                                <label className="form-label">Category</label>
                                <select className="form-input" value={form.category} onChange={onChange('category')}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label">Description</label>
                                <textarea className="form-input min-h-[80px]" value={form.description ?? ''}
                                    onChange={onChange('description')} rows={3} />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeMod} className="btn-ghost">Cancel</button>
                                <button type="submit" className="btn-primary" disabled={upsertMutation.isPending}>
                                    {upsertMutation.isPending ? 'Saving…' : modal === 'add' ? 'Add Book' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
