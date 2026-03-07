'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
    Search, Filter, BookOpen, User, ChevronLeft, ChevronRight,
    CheckCircle2, AlertCircle, X, Grid3X3, List, SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = [
    '', 'TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'FICTION', 'NON_FICTION',
    'HISTORY', 'BIOGRAPHY', 'LITERATURE', 'ARTS', 'PHILOSOPHY', 'LAW',
    'MEDICINE', 'REFERENCE', 'OTHER',
];

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function BooksPage() {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const limit = 20;

    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [borrowingId, setBorrowingId] = useState<string | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['books', page, search, category],
        queryFn: () =>
            api.get('/books/search', {
                params: { q: search || undefined, category: category || undefined, page, limit },
            }).then(r => r.data),
    });

    const books: any[] = data?.data ?? [];
    const totalBooks = data?.meta?.total ?? 0;
    const totalPages = Math.ceil(totalBooks / limit) || 1;

    const initiateBorrow = (book: any) => {
        setSelectedBook(book);
        setErrorMsg('');
        setIsConfirmOpen(true);
    };

    const confirmBorrow = async () => {
        if (!selectedBook) return;
        try {
            setBorrowingId(selectedBook.id);
            setErrorMsg('');
            await api.post('/transactions/borrow', { bookId: selectedBook.id });
            setIsConfirmOpen(false);
            setIsSuccessOpen(true);
            refetch();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to borrow book.');
        } finally {
            setBorrowingId(null);
        }
    };

    const closeSuccess = () => {
        setIsSuccessOpen(false);
        setSelectedBook(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        refetch();
    };

    const bookGradient = (title: string) => {
        const hue = (title.charCodeAt(0) * 137 + (title.charCodeAt(1) || 0) * 97) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 35%, 30%), hsl(${hue}, 35%, 45%))`;
    };

    return (
        <AppShell>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Books</h1>
                    <p className="text-slate-500 text-sm">
                        Browse the complete library collection
                        {totalBooks > 0 && <span className="ml-1 font-semibold text-slate-700">• {totalBooks} books</span>}
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-slate-100 shadow-card mb-6">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by title, author, or ISBN..." className="form-input pl-11"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select className="form-input pl-10 pr-8 appearance-none cursor-pointer min-w-[160px]"
                            value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                            {CATEGORIES.map(c => (<option key={c} value={c}>{c ? c.replace(/_/g, ' ') : 'All Categories'}</option>))}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary px-6">Search</button>
                </div>
            </form>

            {/* Content */}
            {isLoading ? (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                            <div className="w-full h-32 bg-slate-100 rounded-lg mb-3" />
                            <div className="h-4 bg-slate-100 rounded mb-2 w-3/4" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold text-lg text-slate-600 mb-1">No books found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book: any, i: number) => (
                        <motion.div key={book.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                            className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
                            <div className="h-36 flex items-center justify-center relative overflow-hidden"
                                style={{ background: bookGradient(book.title) }}>
                                <span className="text-6xl font-black text-white/10 select-none group-hover:scale-110 transition-transform duration-500">
                                    {book.title.charAt(0)}
                                </span>
                                <div className="absolute top-2 right-2">
                                    <span className={book.availableCopies > 0 ? 'badge-available' : 'badge-overdue'}>
                                        {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Unavailable'}
                                    </span>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        {book.category?.replace(/_/g, ' ') ?? ''}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{book.title}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                    <User className="w-3 h-3" /> {book.author}
                                </div>
                                {book.publisher && <p className="text-[10px] text-slate-400 mb-2 truncate">Published by {book.publisher}</p>}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-mono text-slate-400">{book.isbn}</span>
                                </div>
                                {user?.role === 'STUDENT' && (
                                    <button onClick={() => initiateBorrow(book)}
                                        disabled={book.availableCopies <= 0 || borrowingId === book.id}
                                        className="btn-primary w-full py-2 text-xs disabled:opacity-50">
                                        {borrowingId === book.id ? 'Processing...' : 'Borrow Book'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Book</th><th>Category</th><th>ISBN</th><th>Copies</th><th>Status</th>
                                {user?.role === 'STUDENT' && <th className="text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book: any) => (
                                <tr key={book.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-10 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                                style={{ background: bookGradient(book.title) }}>{book.title.charAt(0)}</div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">{book.title}</p>
                                                <p className="text-[10px] text-slate-400">{book.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="text-xs bg-slate-50 px-2 py-0.5 rounded-full text-slate-500">{book.category?.replace(/_/g, ' ')}</span></td>
                                    <td className="text-xs text-slate-400 font-mono">{book.isbn}</td>
                                    <td className="text-sm font-medium text-slate-700">{book.availableCopies} / {book.totalCopies}</td>
                                    <td><span className={book.availableCopies > 0 ? 'badge-available' : 'badge-overdue'}>{book.availableCopies > 0 ? 'Available' : 'Unavailable'}</span></td>
                                    {user?.role === 'STUDENT' && (
                                        <td className="text-right">
                                            <button onClick={() => initiateBorrow(book)}
                                                disabled={book.availableCopies <= 0 || borrowingId === book.id}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50">
                                                {borrowingId === book.id ? 'Processing...' : 'Borrow'}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-slate-500">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalBooks)} of {totalBooks}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            const pg = i + 1;
                            return (
                                <button key={pg} onClick={() => setPage(pg)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${pg === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    {pg}
                                </button>
                            );
                        })}
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {isConfirmOpen && selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-md overflow-hidden p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Confirm Borrow</h3>
                            <button onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-500 mb-4">Are you sure you want to borrow this book?</p>
                        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                            <p className="font-semibold text-slate-900">{selectedBook.title}</p>
                            <p className="text-sm text-slate-500">by {selectedBook.author}</p>
                        </div>
                        {errorMsg && (
                            <div className="flex items-start gap-2 p-3 mb-6 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0" /><p>{errorMsg}</p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setIsConfirmOpen(false)} className="btn-ghost" disabled={!!borrowingId}>Cancel</button>
                            <button onClick={confirmBorrow} className="btn-primary" disabled={!!borrowingId}>
                                {borrowingId ? 'Confirming...' : 'Confirm Borrow'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-sm overflow-hidden text-center relative p-8">
                        <button onClick={closeSuccess} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-50">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Book Borrowed Successfully</h3>
                        <p className="text-slate-500 mb-4">You have successfully borrowed <strong>{selectedBook?.title}</strong>.</p>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-left mb-6">
                            <p className="font-semibold text-blue-800 mb-1">Confirmation Email Sent</p>
                            <p className="text-blue-600/80">A confirmation email has been sent to your registered email with due date details.</p>
                        </div>
                        <button onClick={closeSuccess} className="btn-primary w-full">Continue Browsing</button>
                    </motion.div>
                </div>
            )}
        </AppShell>
    );
}
