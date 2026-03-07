'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';
import { Search, Filter, BookOpen, User, CheckCircle2, AlertCircle, X } from 'lucide-react';

const CATEGORIES = ['', 'TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'FICTION', 'NON_FICTION', 'HISTORY', 'BIOGRAPHY', 'LITERATURE', 'ARTS', 'PHILOSOPHY', 'LAW', 'MEDICINE', 'REFERENCE', 'OTHER'];

export default function SearchPage() {
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [submitted, setSubmitted] = useState('');
    const [submittedCat, setSubmittedCat] = useState('');
    const [borrowingId, setBorrowingId] = useState<string | null>(null);

    // Modal State
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
            // Call API
            await api.post('/transactions/borrow', { bookId: selectedBook.id });

            // Close confirm, open success
            setIsConfirmOpen(false);
            setIsSuccessOpen(true);

            // Refresh data in background without full page reload
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

    return (
        <AppShell>
            <div className="page-header">
                <h1 className="page-title">Search Books</h1>
                <p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} books found</p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="search-input" className="form-input pl-10" placeholder="Search by title, author, or ISBN…"
                        value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select className="form-input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]"
                        value={category} onChange={e => setCategory(e.target.value)}>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c || 'All Categories'}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn-primary">Search</button>
            </form>

            {/* Results */}
            {isLoading || isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-card p-4 animate-pulse">
                            <div className="w-full h-32 bg-muted rounded-lg mb-3" />
                            <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No books found</p>
                    <p className="text-sm mt-1">Try different search terms or browse all categories</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book: any) => (
                        <div key={book.id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                            {/* Book cover placeholder */}
                            <div className="h-32 flex items-center justify-center relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, hsl(${book.title.charCodeAt(0) * 3 % 360}, 60%, 25%), hsl(${book.title.charCodeAt(0) * 3 % 360}, 60%, 40%))` }}>
                                <span className="text-5xl font-black text-white/20 select-none">{book.title.charAt(0)}</span>
                                <div className="absolute top-2 right-2">
                                    <span className={book.availableCopies > 0 ? 'badge-available' : 'badge-overdue'}>
                                        {book.availableCopies > 0 ? `${book.availableCopies} avail.` : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-semibold text-brand-navy text-sm leading-snug line-clamp-2 mb-1">{book.title}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                    <User className="w-3 h-3" /> {book.author}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{book.category}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{book.isbn}</span>
                                </div>
                                {book.location && (
                                    <p className="text-xs text-muted-foreground mt-2 mb-3">📍 Shelf: {book.location}</p>
                                )}
                                <button
                                    onClick={() => initiateBorrow(book)}
                                    disabled={book.availableCopies <= 0 || borrowingId === book.id}
                                    className="btn-primary w-full py-2 disabled:opacity-50 transition-transform active:scale-95"
                                >
                                    {borrowingId === book.id ? 'Processing...' : 'Borrow Book'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmOpen && selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-brand-navy">Confirm Borrow</h3>
                                <button onClick={() => setIsConfirmOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-muted-foreground mb-4">Are you sure you want to borrow this book?</p>

                            <div className="bg-muted/50 p-4 rounded-xl mb-6">
                                <p className="font-semibold text-brand-navy">{selectedBook.title}</p>
                                <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>
                            </div>

                            {errorMsg && (
                                <div className="flex items-start gap-2 p-3 mb-6 bg-red-50 text-red-700 rounded-lg text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{errorMsg}</p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="btn-ghost"
                                    disabled={!!borrowingId}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBorrow}
                                    className="btn-primary"
                                    disabled={!!borrowingId}
                                >
                                    {borrowingId ? 'Confirming...' : 'Confirm Borrow'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up text-center relative p-8">
                        <button onClick={closeSuccess} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-bold text-brand-navy mb-2">Book Borrowed Successfully</h3>
                        <p className="text-muted-foreground mb-4">You have successfully borrowed <strong>{selectedBook?.title}</strong>.</p>

                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-left mb-6">
                            <p className="font-semibold text-blue-800 mb-1">Confirmation Email Sent</p>
                            <p className="text-blue-700/80">A confirmation email has been sent to your registered email address with the due date details.</p>
                        </div>

                        <button onClick={closeSuccess} className="btn-primary w-full">
                            Continue Browsing
                        </button>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
