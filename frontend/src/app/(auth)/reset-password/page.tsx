'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Library, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

/* ─── Floating background shapes ──────────────────────── */
function FloatingShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-200/20 float-slow" />
            <div className="absolute bottom-20 left-16 w-20 h-20 rounded-full bg-indigo-300/25 float-medium" />
            <div className="absolute top-32 left-[10%] w-16 h-24 rounded-xl bg-blue-400/10 rotate-12 float-fast" />
            <div className="absolute top-1/2 right-[12%] w-28 h-28 rounded-full border-[6px] border-indigo-200/20 float-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-32 right-[25%] w-10 h-10 rounded-lg bg-sky-300/15 rotate-45 float-medium" style={{ animationDelay: '0.5s' }} />
        </div>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters.');
            return;
        }

        setStatus('loading');
        setMessage('');
        try {
            const res = await api.post('/auth/reset-password', { token, newPassword: password });
            setStatus('success');
            setMessage(res.data?.message || 'Password updated successfully.');
            setTimeout(() => router.replace('/login'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
        }
    };

    if (!token) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-red-50">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Reset Link</h2>
                <p className="text-slate-500 text-sm mb-6">This password reset link is missing or invalid. Please request a new one.</p>
                <Link href="/forgot-password" className="btn-primary inline-block px-6">
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="glass-card p-8">
            {status === 'success' ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-50">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h2>
                    <p className="text-slate-500 text-sm mb-6">{message}</p>
                    <p className="text-xs text-slate-400 mb-4">Redirecting to login in 3 seconds…</p>
                    <Link href="/login" className="btn-primary w-full inline-block text-center">
                        Go to Login
                    </Link>
                </motion.div>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Set new password</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter your new password below</p>
                    </div>

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{message}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="form-input pl-11 pr-11"
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
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

                        <div>
                            <label className="form-label">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="form-input pl-11 pr-11"
                                    placeholder="Re-enter password"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-primary w-full"
                            whileTap={{ scale: 0.98 }}
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating…
                                </span>
                            ) : (
                                'Update Password'
                            )}
                        </motion.button>
                    </form>
                </>
            )}

            <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="auth-bg min-h-screen flex items-center justify-center p-4 relative">
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

                <Suspense fallback={
                    <div className="glass-card p-8 text-center">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
