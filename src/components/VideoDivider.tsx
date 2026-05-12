import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '../store/useLanguageStore';

export const VideoDivider = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // 3D Transform Effects
    const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    // Smooth fade in/out but ensuring plenty of visibility time
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="relative h-[60vh] bg-charcoal font-sans overflow-hidden perspective-1000">
            <motion.div
                style={{
                    rotateX,
                    scale,
                    opacity
                }}
                className="w-full h-full relative transform-style-3d shadow-2xl origin-center"
            >
                <video
                    className="absolute inset-0 w-full h-full object-cover rounded-sm"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="/Manta.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Overlay Content - Removed dark background for clarity */}
                {/* Overlay Content - Moved to top */}
                <div className="absolute inset-0 flex items-start justify-center text-center pt-16 md:pt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="backdrop-blur-sm bg-white/5 p-8 border border-white/10 rounded-xl shadow-lg"
                    >
                        <h2 className="text-4xl md:text-6xl font-serif text-white mb-2 tracking-wide drop-shadow-lg">
                            Autana Group <span className="text-gold-500 italic">{t.video.title}</span>
                        </h2>
                        <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full shadow-[0_0_10px_rgba(191,149,63,0.8)]" />
                    </motion.div>
                </div>

                {/* Glass Reflection Effect - clear and subtle */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10 opacity-50" />
            </motion.div>
        </section>
    );
};
