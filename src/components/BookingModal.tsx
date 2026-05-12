import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Phone, Home, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
    const { t } = useTranslation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        property: '',
        date: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            // Here you would typically send the data to your backend
            console.log('Booking request sent:', formData, 'to Ll.es.servicios@gmail.com');
        }, 1500);
    };

    const handleClose = () => {
        if (isSuccess) {
            // Reset after closing if success was shown
            setTimeout(() => {
                setIsSuccess(false);
                setFormData({ name: '', email: '', phone: '', property: '', date: '' });
            }, 500);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden m-0"
                    >
                        {/* Gold Accent Line */}
                        <div className="h-2 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-charcoal transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 md:p-8 relative">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />

                            <AnimatePresence mode="wait">
                                {!isSuccess ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <div className="text-center mb-8">
                                            <span className="text-gold-500 font-bold uppercase tracking-widest text-xs mb-2 block">{t.booking.label}</span>
                                            <h2 className="text-3xl font-serif text-charcoal">{t.booking.title}</h2>
                                            <p className="text-gray-500 mt-2 text-sm">{t.booking.subtitle}</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {/* Name Input */}
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={t.booking.form.name}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-charcoal placeholder-gray-400"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            {/* Contact Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder={t.booking.form.email}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-charcoal placeholder-gray-400"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        placeholder={t.booking.form.phone}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-charcoal placeholder-gray-400"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Property of Interest */}
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                                                    <Home className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={t.booking.form.property}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-charcoal placeholder-gray-400"
                                                    value={formData.property}
                                                    onChange={e => setFormData({ ...formData, property: e.target.value })}
                                                />
                                            </div>

                                            {/* Date Picker */}
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="date"
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-charcoal placeholder-gray-400 text-sm"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-charcoal hover:bg-gold-500 hover:text-white text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group/btn mt-4"
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                ) : (
                                                    t.booking.form.button
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-serif text-charcoal mb-4">{t.booking.success.title}</h3>
                                        <p className="text-gray-500 leading-relaxed mb-8">
                                            {t.booking.success.message}
                                        </p>
                                        <button
                                            onClick={handleClose}
                                            className="bg-charcoal text-white px-8 py-3 rounded-lg uppercase text-sm font-bold tracking-widest hover:bg-gold-500 transition-colors"
                                        >
                                            {t.booking.success.close}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
