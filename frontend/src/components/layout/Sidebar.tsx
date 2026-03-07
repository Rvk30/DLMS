'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
    LayoutDashboard, BookOpen, Search, ArrowLeftRight,
    Users, BookMarked, Settings, LogOut, Library, AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'Search Books', icon: Search },
    { href: '/transactions', label: 'My Books', icon: BookOpen },
    { href: '/fines', label: 'My Fines', icon: AlertCircle },
];

const librarianLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/books', label: 'Books', icon: BookMarked },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/search', label: 'Search', icon: Search },
];

export function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const links = user?.role === 'LIBRARIAN' ? librarianLinks : studentLinks;

    return (
        <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-30"
            style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #152B47 100%)' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
                <div className="w-9 h-9 bg-brand-gold rounded-lg flex items-center justify-center">
                    <Library className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight">DLMS</p>
                    <p className="text-blue-300 text-xs">Digital Library</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                    {user?.role === 'LIBRARIAN' ? 'Management' : 'Navigation'}
                </p>
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/' && pathname.startsWith(href) && href !== '/admin' ? true : pathname === href);
                    const isActive = pathname === href || (href.length > 6 && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href}
                            className={clsx('sidebar-link', isActive && 'active')}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-navy text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                        <p className="text-blue-300 text-[10px] capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="sidebar-link w-full text-left text-red-300 hover:text-red-200 hover:bg-red-900/20">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
