import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export type Role = 'STUDENT' | 'LIBRARIAN';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
    student?: { id: string; studentId: string; className: string; borrowedCount: number; account?: { outstandingFine: number; status: string } };
    librarian?: { id: string; employeeId: string; department: string };
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<void>;
    logout: () => void;
    fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
                    const { user, tokens } = data.data;
                    localStorage.setItem('accessToken', tokens.accessToken);
                    localStorage.setItem('refreshToken', tokens.refreshToken);
                    set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isLoading: false });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            register: async (formData) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post('/auth/register', formData);
                    const { user, tokens } = data.data;
                    localStorage.setItem('accessToken', tokens.accessToken);
                    localStorage.setItem('refreshToken', tokens.refreshToken);
                    set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isLoading: false });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            logout: () => {
                api.post('/auth/logout').catch(() => { });
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, refreshToken: null });
                window.location.href = '/login';
            },

            fetchMe: async () => {
                if (!get().accessToken) return;
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.data });
                } catch {
                    get().logout();
                }
            },
        }),
        {
            name: 'dlms-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);
