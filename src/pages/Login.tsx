import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';

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
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="bg-black/40 border border-[#D4AF37]/20 p-8 rounded-lg shadow-2xl w-full max-w-md backdrop-blur-sm">
                <h2 className="text-3xl font-serif text-[#D4AF37] mb-8 text-center">{t.login.title}</h2>
                {error && <p className="text-red-500 text-center mb-4">{t.login.error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#E5C158]/80 mb-2 font-sans">{t.login.email}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-[#D4AF37]/50 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-800 border border-[#D4AF37]/30 rounded pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
                                placeholder="admin@autana.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#E5C158]/80 mb-2 font-sans">{t.login.password}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-[#D4AF37]/50 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-800 border border-[#D4AF37]/30 rounded pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold py-3 rounded transition-colors cursor-pointer">
                        {t.login.signIn}
                    </button>
                </form>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 w-full flex items-center justify-center text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.login.back}
                </button>
            </div>
        </div>
    );
};
