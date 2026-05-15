import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Home, 
    Users, 
    Settings, 
    LogOut, 
    ShieldCheck,
    BarChart3,
    ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

export const Sidebar = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Home, label: 'Properties', path: '/admin/properties' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <aside className="w-72 min-h-screen bg-[#0A0A0A] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        <ShieldCheck className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-white font-serif text-lg tracking-tight">AUTANA <span className="text-[#D4AF37]">GROUP</span></h1>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/50 font-bold">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
                            ${isActive 
                                ? 'bg-[#D4AF37]/10 text-[#D4AF37] shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-[#D4AF37] rounded-r-full"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Area */}
            <div className="p-4 space-y-2 border-t border-white/5">
                <button 
                    onClick={() => window.open('https://autanagrouprd.com', '_blank')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm group"
                >
                    <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>View Public Site</span>
                </button>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all text-sm font-bold group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
