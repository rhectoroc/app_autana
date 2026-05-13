import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Attempting login for:', email);
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Login Error Details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
            {/* BACKGROUND DECORATIONS */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[120px]"
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#D4AF37]/5 rounded-full blur-[150px]"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* LOGO AREA */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-6"
                    >
                        <ShieldCheck className="w-10 h-10 text-black" />
                    </motion.div>
                    <h1 className="text-4xl font-serif text-white tracking-tight text-center">
                        AUTANA <span className="text-[#D4AF37]">GROUP</span>
                    </h1>
                    <p className="text-[#D4AF37]/60 text-xs uppercase tracking-[0.4em] mt-2 font-light">Management Portal</p>
                </div>

                {/* LOGIN CARD */}
                <div className="relative group">
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    
                    <div className="relative bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-2xl shadow-2xl shadow-black/50">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-lg mb-6 text-center overflow-hidden"
                                >
                                    {t.login.error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70 font-bold ml-1">{t.login.email}</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5 group-focus-within/input:text-[#D4AF37] transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/10 focus:border-[#D4AF37]/50 focus:bg-white/[0.05] focus:outline-none transition-all"
                                        placeholder="Enter your administrative email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70 font-bold ml-1">{t.login.password}</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5 group-focus-within/input:text-[#D4AF37] transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/10 focus:border-[#D4AF37]/50 focus:bg-white/[0.05] focus:outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
                            >
                                {t.login.signIn}
                            </motion.button>
                        </form>

                        <div className="mt-10 flex items-center justify-center">
                            <button
                                onClick={() => window.location.href = 'https://autanagrouprd.com'}
                                className="flex items-center gap-2 text-white/30 hover:text-[#D4AF37] transition-colors text-[10px] uppercase tracking-widest font-bold group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                {t.login.back}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER INFO */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-12 text-white/10 text-[9px] uppercase tracking-[0.5em]"
                >
                    Secured by Autana Group Intelligence &copy; 2026
                </motion.p>
            </motion.div>
        </div>
    );
};
