'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import api from '@/lib/api';
import { Search, Filter, BookOpen, User } from 'lucide-react';

const CATEGORIES = ['', 'TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'FICTION', 'NON_FICTION', 'HISTORY', 'BIOGRAPHY', 'LITERATURE', 'ARTS', 'PHILOSOPHY', 'LAW', 'MEDICINE', 'REFERENCE', 'OTHER'];

export default function SearchPage() {
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [submitted, setSubmitted] = useState('');
    const [submittedCat, setSubmittedCat] = useState('');

    const { data, isLoading, isFetching } = useQuery({
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
                        <div key={book.id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
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
                                    <p className="text-xs text-muted-foreground mt-2">📍 Shelf: {book.location}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
