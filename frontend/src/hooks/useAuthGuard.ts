'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password'];

export function useAuthGuard() {
    const { user, accessToken } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [hydrated, setHydrated] = useState(false);

    // Wait for Zustand persist store to hydrate from localStorage
    useEffect(() => {
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));

        // If already hydrated (e.g. navigating between pages), set immediately
        if (useAuthStore.persist.hasHydrated()) {
            setHydrated(true);
        }

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!hydrated) return; // Don't redirect until store is hydrated

        const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

        // Also check localStorage directly as a fallback
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const hasToken = !!accessToken || !!storedToken;

        if (!hasToken && !isPublic) {
            router.replace('/login');
            return;
        }
        if (hasToken && isPublic) {
            router.replace(user?.role === 'LIBRARIAN' ? '/admin' : '/dashboard');
        }
    }, [hydrated, accessToken, pathname, user, router]);

    return { user, isAuthenticated: !!accessToken };
}

export function useRequireLibrarian() {
    const { user, accessToken } = useAuthStore();
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        if (useAuthStore.persist.hasHydrated()) setHydrated(true);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!accessToken && !storedToken) { router.replace('/login'); return; }
        if (user?.role !== 'LIBRARIAN') router.replace('/dashboard');
    }, [hydrated, accessToken, user, router]);

    return { user };
}
