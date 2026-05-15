import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onRemove: (id: string) => void;
}

const toastStyles = {
    success: {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-200'
    },
    error: {
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-200'
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-200'
    },
    info: {
        icon: <Info className="w-5 h-5 text-[#D4AF37]" />,
        bg: 'bg-[#D4AF37]/10',
        border: 'border-[#D4AF37]/20',
        text: 'text-[#D4AF37]'
    }
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, onRemove }) => {
    const style = toastStyles[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
            className={clsx(
                "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-md pointer-events-auto",
                style.bg,
                style.border
            )}
        >
            <div className="flex-shrink-0">{style.icon}</div>
            <div className={clsx("flex-grow text-sm font-medium", style.text)}>
                {message}
            </div>
            <button
                onClick={() => onRemove(id)}
                className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: { id: string; message: string; type: ToastType }[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
