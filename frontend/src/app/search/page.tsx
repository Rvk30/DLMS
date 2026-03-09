'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';
import { Search, Filter, BookOpen, User, CheckCircle2, AlertCircle, X } from 'lucide-react';

const CATEGORIES = ['', 'TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'FICTION', 'NON_FICTION', 'HISTORY', 'BIOGRAPHY', 'LITERATURE', 'ARTS', 'PHILOSOPHY', 'LAW', 'MEDICINE', 'REFERENCE', 'OTHER'];

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

export default function SearchPage() {
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [submitted, setSubmitted] = useState('');
    const [submittedCat, setSubmittedCat] = useState('');
    const [borrowingId, setBorrowingId] = useState<string | null>(null);

    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['book-search', submitted, submittedCat],
        queryFn: () =>
            api.get('/books/search', { params: { q: submitted || undefined, category: submittedCat || undefined, limit: 24 } })
                .then(r => r.data),
        enabled: true,
    });

    const books: any[] = data?.data ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(q);
        setSubmittedCat(category);
    };

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
            setErrorMsg(err.response?.data?.message || 'Failed to borrow book. Please check if you are logged in or reached your limit.');
        } finally {
            setBorrowingId(null);
        }
    };

    const closeSuccess = () => {
        setIsSuccessOpen(false);
        setSelectedBook(null);
    };

    const bookGradient = (title: string) => {
        const hue = (title.charCodeAt(0) * 137 + (title.charCodeAt(1) || 0) * 97) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 35%, 30%), hsl(${hue}, 35%, 45%))`;
    };

    return (
        <AppShell>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Search Books</h1>
                    <p className="text-slate-500 text-sm">{data?.meta?.total ?? 0} books found</p>
                </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="form-input pl-11" placeholder="Search by title, author, or ISBN…"
                        value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select className="form-input pl-10 pr-8 appearance-none cursor-pointer min-w-[160px]"
                        value={category} onChange={e => setCategory(e.target.value)}>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c ? c.replace(/_/g, ' ') : 'All Categories'}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn-primary">Search</button>
            </form>

            {/* Results */}
            {isLoading || isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-slate-600">No books found</p>
                    <p className="text-sm mt-1">Try different search terms or browse all categories</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book: any, i: number) => (
                        <motion.div
                            key={book.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
                            <div className="h-32 flex items-center justify-center relative overflow-hidden"
                                style={{ background: bookGradient(book.title) }}>
                                <span className="text-5xl font-black text-white/10 select-none group-hover:scale-110 transition-transform duration-500">
                                    {book.title.charAt(0)}
                                </span>
                                <div className="absolute top-2 right-2">
                                    <span className={book.availableCopies > 0 ? 'badge-available' : 'badge-overdue'}>
                                        {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{book.title}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                                    <User className="w-3 h-3" /> {book.author}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs bg-slate-50 px-2 py-0.5 rounded-full text-slate-500">{book.category}</span>
                                    <span className="text-xs text-slate-400 font-mono">{book.isbn}</span>
                                </div>
                                {book.location && (
                                    <p className="text-xs text-slate-400 mt-2 mb-3">📍 Shelf: {book.location}</p>
                                )}
                                <button
                                    onClick={() => initiateBorrow(book)}
                                    disabled={book.availableCopies <= 0 || borrowingId === book.id}
                                    className="btn-primary w-full py-2 mt-2 disabled:opacity-50 text-xs"
                                >
                                    {borrowingId === book.id ? 'Processing...' : 'Borrow Book'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmOpen && selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card w-full max-w-md overflow-hidden">
                        <div className="p-6">
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
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{errorMsg}</p>
                                </div>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsConfirmOpen(false)} className="btn-ghost" disabled={!!borrowingId}>Cancel</button>
                                <button onClick={confirmBorrow} className="btn-primary" disabled={!!borrowingId}>
                                    {borrowingId ? 'Confirming...' : 'Confirm Borrow'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                            <p className="text-blue-600/80">A confirmation email has been sent to your registered email address with the due date details.</p>
                        </div>
                        <button onClick={closeSuccess} className="btn-primary w-full">Continue Browsing</button>
                    </motion.div>
                </div>
            )}
        </AppShell>
    );
}
