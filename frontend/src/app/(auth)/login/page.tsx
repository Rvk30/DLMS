'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Library, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

/* ─── Floating background shapes ──────────────────────── */
function FloatingShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {/* Large soft circle — top right */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-200/20 float-slow" />
            {/* Small filled circle — bottom left */}
            <div className="absolute bottom-20 left-16 w-20 h-20 rounded-full bg-indigo-300/25 float-medium" />
            {/* Book-like rectangle — top left */}
            <div className="absolute top-32 left-[10%] w-16 h-24 rounded-xl bg-blue-400/10 rotate-12 float-fast"
                style={{ backdropFilter: 'blur(2px)' }} />
            {/* Donut ring — mid right */}
            <div className="absolute top-1/2 right-[12%] w-28 h-28 rounded-full border-[6px] border-indigo-200/20 float-slow"
                style={{ animationDelay: '1s' }} />
            {/* Tiny square — bottom right */}
            <div className="absolute bottom-32 right-[25%] w-10 h-10 rounded-lg bg-sky-300/15 rotate-45 float-medium"
                style={{ animationDelay: '0.5s' }} />
            {/* Large gradient blob — center left */}
            <div className="absolute top-[40%] -left-20 w-64 h-64 rounded-full float-slow"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', animationDelay: '2s' }} />
            {/* Small accent — lower center */}
            <div className="absolute bottom-[15%] left-[45%] w-6 h-6 rounded-full bg-blue-500/20 float-fast"
                style={{ animationDelay: '1.5s' }} />
        </div>
    );
}

export default function LoginPage() {
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState<string | null>(null);

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
        <div className="auth-bg min-h-screen flex items-center justify-center p-4">
            <FloatingShapes />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Library className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">DLMS</h1>
                        <p className="text-xs text-slate-500 -mt-0.5">Digital Library</p>
                    </div>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 text-sm mt-1">Sign in to continue to your library</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="form-label">Email</label>
                            <div className="relative">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    className="form-input pl-11"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    className="form-input pl-11 pr-11"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full group"
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                            Register
                        </Link>
                    </p>
                </div>

                {/* Demo credentials */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500"
                >
                    <p className="font-semibold text-slate-700 mb-1.5">Demo Credentials</p>
                    <div className="space-y-1">
                        <p>📚 Librarian: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">librarian@dlms.edu</code> / <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">Librarian@123</code></p>
                        <p>👨‍🎓 Student: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">arjun.kumar@dlms.edu</code> / <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">Student@123</code></p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
