'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Book } from 'lucide-react';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    bookTitle: string;
    bookAuthor: string;
}

export function ReturnModal({ isOpen, onClose, onConfirm, bookTitle, bookAuthor }: ReturnModalProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleConfirm = async () => {
        setStatus('loading');
        try {
            await onConfirm();
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (error) {
            setStatus('idle');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="glass-card relative w-full max-w-md overflow-hidden p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center py-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Book Returned!</h3>
                                    <p className="text-slate-500 mt-2">Your return has been processed successfully.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                        <Book className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Confirm Return</h3>
                                    <p className="text-slate-500 text-sm mb-6">Are you sure you want to return this book?</p>

                                    <div className="w-full bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Book Details</p>
                                        <p className="text-slate-900 font-bold text-lg leading-tight mb-0.5">{bookTitle}</p>
                                        <p className="text-slate-500 text-sm">by {bookAuthor}</p>
                                    </div>

                                    <div className="flex flex-col w-full gap-3">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={status === 'loading'}
                                            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                                        >
                                            {status === 'loading' ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Confirm Return'
                                            )}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            disabled={status === 'loading'}
                                            className="w-full py-3 text-slate-500 font-medium hover:text-slate-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
