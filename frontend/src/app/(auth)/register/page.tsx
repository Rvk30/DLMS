'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Library, AlertCircle, User, Mail, Lock, Hash, BookOpen } from 'lucide-react';

export default function RegisterPage() {
    const { register, isLoading } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState('');
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
            router.replace('/dashboard');
        } catch (err: any) {
            const msgs = err?.response?.data?.errors;
            setError(msgs?.join(', ') || err?.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg, #F9F9F9 0%, #E8EEF5 100%)' }}>
            <div className="w-full max-w-2xl animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-brand-navy rounded-2xl px-4 py-2 mb-4">
                        <Library className="w-5 h-5 text-brand-gold" />
                        <span className="text-white font-bold text-sm">DLMS</span>
                    </div>
                    <h1 className="text-3xl font-bold text-brand-navy">Create Student Account</h1>
                    <p className="text-muted-foreground mt-1">Join thousands of students accessing our digital library</p>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-8">
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="sm:col-span-2">
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input className="form-input pl-10" id="name" placeholder="Arjun Kumar"
                                    value={form.name} onChange={update('name')} required />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input className="form-input pl-10" id="email" type="email" placeholder="you@college.edu"
                                    value={form.email} onChange={update('email')} required />
                            </div>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="form-label">Student ID / Roll No.</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input className="form-input pl-10" id="studentId" placeholder="STU-2024-001"
                                    value={form.studentId} onChange={update('studentId')} required />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input className="form-input pl-10" id="password" type="password" placeholder="Min. 8 characters"
                                    value={form.password} onChange={update('password')} required minLength={8} />
                            </div>
                        </div>

                        {/* Class */}
                        <div>
                            <label className="form-label">Class / Year</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input className="form-input pl-10" id="className" placeholder="B.Tech CSE – 3rd Year"
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
                            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                                {isLoading
                                    ? <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account…
                                    </span>
                                    : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-navy font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
