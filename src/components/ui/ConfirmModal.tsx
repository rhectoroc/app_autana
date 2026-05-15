import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDanger = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                        </div>

                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                                    isDanger 
                                    ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-900/20' 
                                    : 'bg-[#D4AF37] text-black hover:bg-[#E5C158] shadow-[#D4AF37]/20'
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
