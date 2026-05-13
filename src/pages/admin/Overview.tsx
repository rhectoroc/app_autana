import { motion } from 'framer-motion';
import { 
    Home, 
    TrendingUp, 
    Users, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export const Overview = () => {
    const stats = [
        { label: 'Total Propiedades', value: '24', icon: Home, trend: '+12%', positive: true },
        { label: 'Visitas Mensuales', value: '1,284', icon: Users, trend: '+5.4%', positive: true },
        { label: 'Ventas Realizadas', value: '8', icon: TrendingUp, trend: '-2%', positive: false },
        { label: 'Valor Portafolio', value: '$4.2M', icon: DollarSign, trend: '+18%', positive: true },
    ];

    return (
        <div className="space-y-10 pt-4">
            <div>
                <h1 className="text-4xl font-serif text-[#D4AF37] mb-2 tracking-tight">Executive Overview</h1>
                <p className="text-gray-500">Bienvenido al centro de control de Autana Group.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl group hover:border-[#D4AF37]/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#D4AF37]/10 rounded-xl group-hover:scale-110 transition-transform">
                                <stat.icon className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend}
                                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <h3 className="text-white text-3xl font-bold mb-1 tracking-tighter">{stat.value}</h3>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-50" />
                    <div className="text-center z-10">
                        <BarChart3 className="w-12 h-12 text-[#D4AF37]/20 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-medium">Gráfico de Rendimiento de Ventas</p>
                        <p className="text-[10px] text-[#D4AF37]/40 uppercase tracking-widest mt-2">Cargando Inteligencia...</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-50" />
                    <div className="text-center z-10">
                        <Users className="w-12 h-12 text-[#D4AF37]/20 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-medium">Distribución Geográfica de Leads</p>
                        <p className="text-[10px] text-[#D4AF37]/40 uppercase tracking-widest mt-2">Sincronizando Datos...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BarChart3 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
);
