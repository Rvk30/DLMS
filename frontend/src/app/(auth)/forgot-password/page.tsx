'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Library, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(res.data?.message || 'If that email exists, a password reset link has been sent.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

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

                {/* Card */}
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
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
                            <p className="text-slate-500 text-sm mb-6">{message}</p>
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-left mb-6">
                                <p className="font-semibold text-blue-800 mb-1">What's next?</p>
                                <p className="text-blue-600/80 text-xs">Open the link in the email to set a new password. The link expires in 1 hour.</p>
                            </div>
                            <Link href="/login" className="btn-primary w-full inline-block text-center">
                                Back to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot password?</h2>
                                <p className="text-slate-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
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
                                    <label className="form-label">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="form-input pl-11"
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
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
                                            Sending…
                                        </span>
                                    ) : (
                                        'Send Reset Link'
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
            </motion.div>
        </div>
    );
}
