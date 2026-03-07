'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Library, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            const user = useAuthStore.getState().user;
            router.replace(user?.role === 'LIBRARIAN' ? '/admin' : '/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2E4D7B 50%, #1E3A5F 100%)' }}>
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 text-white">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center">
                            <Library className="w-7 h-7 text-brand-navy" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">DLMS</h1>
                            <p className="text-blue-300 text-sm">Digital Library Management System</p>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                        Your Gateway to<br />
                        <span className="text-brand-gold">Knowledge</span>
                    </h2>
                    <p className="text-blue-200 text-lg mb-8">
                        Access thousands of books, manage your borrowings, and stay on top of due dates — all in one place.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[['10K+', 'Books'], ['500+', 'Students'], ['99%', 'Satisfaction']].map(([val, label]) => (
                            <div key={label} className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold text-brand-gold">{val}</div>
                                <div className="text-xs text-blue-300 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-brand-navy rounded-lg flex items-center justify-center">
                            <Library className="w-5 h-5 text-brand-gold" />
                        </div>
                        <span className="text-xl font-bold text-brand-navy">DLMS</span>
                    </div>

                    <h2 className="text-3xl font-bold text-brand-navy mb-2">Welcome back!</h2>
                    <p className="text-muted-foreground mb-8">Sign in to your library account</p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    className="form-input pl-10" placeholder="you@example.com" required autoComplete="email" />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input id="password" type={showPass ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="form-input pl-10 pr-10" placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-brand-navy hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-brand-navy font-semibold hover:underline">Register here</Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground mb-2">Demo Credentials:</p>
                        <p>📚 Librarian: <code>librarian@dlms.edu</code> / <code>Librarian@123</code></p>
                        <p>👨‍🎓 Student: <code>arjun.kumar@dlms.edu</code> / <code>Student@123</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
