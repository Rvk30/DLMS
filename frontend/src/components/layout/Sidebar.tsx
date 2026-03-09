'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, Search, ArrowLeftRight,
    Users, BookMarked, LogOut, Library, AlertCircle,
} from 'lucide-react';

const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'Search Books', icon: Search },
    { href: '/books', label: 'All Books', icon: BookOpen },
    { href: '/transactions', label: 'My Books', icon: BookMarked },
    { href: '/fines', label: 'My Fines', icon: AlertCircle },
];

const librarianLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/books', label: 'Manage Books', icon: BookMarked },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/search', label: 'Search', icon: Search },
];

export function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const links = user?.role === 'LIBRARIAN' ? librarianLinks : studentLinks;

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname === href || (href.length > 5 && pathname.startsWith(href));
    };

    return (
        <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-30 bg-white border-r border-slate-200/80">

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-600/20">
                    <Library className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-slate-900 font-bold text-sm leading-tight tracking-tight">DLMS</p>
                    <p className="text-slate-400 text-[11px]">Digital Library</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {user?.role === 'LIBRARIAN' ? 'Management' : 'Navigation'}
                </p>
                {links.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link key={href} href={href}
                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}>
                            {active && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="px-3 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/15">
                        <span className="text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-slate-900 text-xs font-semibold truncate">{user?.name}</p>
                        <p className="text-slate-400 text-[10px] capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                    <LogOut className="w-[18px] h-[18px]" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
