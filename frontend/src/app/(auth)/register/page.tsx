'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Library, AlertCircle, User, Mail, Lock, Hash, BookOpen, ArrowRight, CheckCircle, X } from 'lucide-react';

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

export default function RegisterPage() {
    const { register, isLoading } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState('');
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', studentId: '', className: '', department: '', semester: '',
    });

    const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register({ ...form, semester: form.semester ? Number(form.semester) : undefined });
            setShowVerifyPopup(true);
        } catch (err: any) {
            const msgs = err?.response?.data?.errors;
            setError(msgs?.join(', ') || err?.response?.data?.message || 'Registration failed.');
        }
    };

    const handleVerifyDismiss = () => {
        setShowVerifyPopup(false);
        router.replace('/dashboard');
    };

    return (
        <div className="auth-bg min-h-screen flex items-center justify-center p-4 relative">
            <FloatingShapes />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Library className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DLMS</h1>
                            <p className="text-xs text-slate-500 -mt-0.5">Digital Library</p>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Student Account</h2>
                    <p className="text-slate-500 text-sm mt-1">Join thousands of students accessing our digital library</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="sm:col-span-2">
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="form-input pl-11" id="name" placeholder="Arjun Kumar"
                                    value={form.name} onChange={update('name')} required />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="form-input pl-11" id="email" type="email" placeholder="you@college.edu"
                                    value={form.email} onChange={update('email')} required />
                            </div>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="form-label">Student ID / Roll No.</label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="form-input pl-11" id="studentId" placeholder="STU-2024-001"
                                    value={form.studentId} onChange={update('studentId')} required />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="form-input pl-11" id="password" type="password" placeholder="Min. 8 characters"
                                    value={form.password} onChange={update('password')} required minLength={8} />
                            </div>
                        </div>

                        {/* Class */}
                        <div>
                            <label className="form-label">Class / Year</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="form-input pl-11" id="className" placeholder="B.Tech CSE – 3rd Year"
                                    value={form.className} onChange={update('className')} required />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="form-label">Department</label>
                            <input className="form-input" id="department" placeholder="Computer Science"
                                value={form.department} onChange={update('department')} />
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="form-label">Semester</label>
                            <select className="form-input" id="semester" value={form.semester} onChange={update('semester')}>
                                <option value="">Select semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>

                        {/* Submit */}
                        <div className="sm:col-span-2 mt-2">
                            <motion.button type="submit" className="btn-primary w-full group" disabled={isLoading}
                                whileTap={{ scale: 0.98 }}>
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
                </p>
            </motion.div>

            {/* Email Verification Popup */}
            <AnimatePresence>
                {showVerifyPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-sm p-8 text-center relative"
                        >
                            <button onClick={handleVerifyDismiss}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-blue-50">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Verification Email Sent</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                We've sent a verification email to <strong className="text-slate-700">{form.email}</strong>. Please check your inbox and verify your account.
                            </p>
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-left mb-6">
                                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                                    <CheckCircle className="w-4 h-4" /> Account Created Successfully
                                </div>
                                <p className="text-emerald-600/80 text-xs">Your account has been created. You can start using the library immediately.</p>
                            </div>
                            <button onClick={handleVerifyDismiss} className="btn-primary w-full">
                                Continue to Dashboard
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
