'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password'];

export function useAuthGuard() {
    const { user, accessToken } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
        if (!accessToken && !isPublic) {
            router.replace('/login');
            return;
        }
        if (accessToken && isPublic) {
            router.replace(user?.role === 'LIBRARIAN' ? '/admin' : '/dashboard');
        }
    }, [accessToken, pathname, user, router]);

    return { user, isAuthenticated: !!accessToken };
}

export function useRequireLibrarian() {
    const { user, accessToken } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken) { router.replace('/login'); return; }
        if (user?.role !== 'LIBRARIAN') router.replace('/dashboard');
    }, [accessToken, user, router]);

    return { user };
}
