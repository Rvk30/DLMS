'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { Bell } from 'lucide-react';

interface AppShellProps { children: React.ReactNode; }

export function AppShell({ children }: AppShellProps) {
    useAuthGuard();
    const { user } = useAuthStore();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            {/* Main content - offset by sidebar width */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-border px-6 py-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{user?.name}</span>
                        </div>
                    </div>
                </header>
                {/* Page content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
