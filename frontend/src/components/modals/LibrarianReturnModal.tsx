'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Book, User, AlertCircle, IndianRupee } from 'lucide-react';

interface LibrarianReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { waiveFine: boolean; waiverReason?: string }) => Promise<void>;
    bookTitle: string;
    borrowerName: string;
    overdueDays: number;
    fineAmount: number;
}

export function LibrarianReturnModal({
    isOpen,
    onClose,
    onConfirm,
    bookTitle,
    borrowerName,
    overdueDays,
    fineAmount
}: LibrarianReturnModalProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [waiveFine, setWaiveFine] = useState(false);
    const [waiverReason, setWaiverReason] = useState('');

    const handleConfirm = async () => {
        setStatus('loading');
        try {
            await onConfirm({ waiveFine, waiverReason: waiveFine ? waiverReason : undefined });
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setWaiveFine(false);
                setWaiverReason('');
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
                        className="glass-card relative w-full max-w-lg overflow-hidden p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        <div className="flex flex-col">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center py-12 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Return Processed!</h3>
                                    <p className="text-slate-500 mt-2">The book has been successfully returned to the library.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Book className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Process Book Return</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                                <Book className="w-3 h-3" /> Book Title
                                            </p>
                                            <p className="text-slate-900 font-bold text-sm truncate">{bookTitle}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Borrower
                                            </p>
                                            <p className="text-slate-900 font-bold text-sm truncate">{borrowerName}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Overdue
                                            </p>
                                            <p className={`font-bold text-sm ${overdueDays > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {overdueDays > 0 ? `${overdueDays} Days` : 'On Time'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                                <IndianRupee className="w-3 h-3" /> Current Fine
                                            </p>
                                            <p className="text-slate-900 font-bold text-sm">₹{fineAmount}</p>
                                        </div>
                                    </div>

                                    {fineAmount > 0 && (
                                        <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${waiveFine ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                        onClick={() => setWaiveFine(!waiveFine)}>
                                                        <motion.div
                                                            animate={{ x: waiveFine ? 18 : 2 }}
                                                            className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900">Waive Fine</span>
                                                </div>
                                                {waiveFine && (
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">Enabled</span>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {waiveFine && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <textarea
                                                            placeholder="Reason for waiving fine..."
                                                            value={waiverReason}
                                                            onChange={(e) => setWaiverReason(e.target.value)}
                                                            className="w-full mt-2 p-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-h-[80px] resize-none"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

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
                                                'Process Return'
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
