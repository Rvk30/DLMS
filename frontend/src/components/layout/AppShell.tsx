'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AppShellProps { children: React.ReactNode; }

export function AppShell({ children }: AppShellProps) {
    useAuthGuard();
    const { user } = useAuthStore();
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            {/* Main content - offset by sidebar width */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-medium">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <Bell className="w-4 h-4 text-slate-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/15">
                                <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                        </div>
                    </div>
                </header>
                {/* Page content with animation */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex-1 p-6"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
}
