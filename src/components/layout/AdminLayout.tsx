import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';

export const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar Fijo */}
            <Sidebar />

            {/* Contenido Principal */}
            <main className="flex-1 ml-72 relative">
                {/* Fondo Decorativo */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
};
