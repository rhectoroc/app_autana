import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PropertySearch } from './PropertySearch';
import { useTranslation } from '../store/useLanguageStore';

const heroImages = [
    '/hero/20240618_065649.jpg',
    '/hero/20240619_064841.jpg',
    '/hero/20250514_064439.jpg'
];

interface HeroProps {
    onSearch?: (filters: any) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        // Efficient Image Preloading: Only preload on desktop/tablet to save data on mobile
        const isMobile = window.innerWidth < 768;
        if (!isMobile) {
            heroImages.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        }

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Slider */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
                <AnimatePresence mode='popLayout'>
                    <motion.img
                        key={currentIndex}
                        src={heroImages[currentIndex]}
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Hero Background"
                    />
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Faster container entry
                    className="w-full max-w-7xl"
                >
                    <motion.h2
                        initial={{ opacity: 0, letterSpacing: '0.1em' }}
                        animate={{ opacity: 1, letterSpacing: '0.3em' }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="text-white font-sans text-sm md:text-base uppercase mb-6"
                    >
                        {t.hero.subtitle}
                    </motion.h2>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 tracking-tight flex flex-col items-center drop-shadow-2xl">
                        <motion.span
                            initial={{
                                opacity: 0,
                                y: 40,
                                filter: 'blur(10px)',
                                backgroundPosition: '0% 50%'
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                backgroundPosition: ['0% 50%', '200% 50%']
                            }}
                            transition={{
                                opacity: { duration: 0.8, delay: 0.2, ease: "easeOut" },
                                y: { duration: 0.8, delay: 0.2, ease: "easeOut" },
                                filter: { duration: 0.8, delay: 0.2, ease: "easeOut" },
                                backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" }
                            }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] bg-[length:200%_auto]"
                        >
                            {t.hero.title}
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto font-light mb-10"
                    >
                        {t.hero.description}
                    </motion.p>

                    {/* Search Bar */}
                    {onSearch && <PropertySearch onSearch={onSearch} />}

                </motion.div>
            </div>
            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 text-white cursor-pointer"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest mb-2 opacity-80">{t.hero.scroll}</span>
                    <ChevronDown className="w-6 h-6 animate-bounce" />
                </div>
            </motion.div>
        </div >
    );
};
