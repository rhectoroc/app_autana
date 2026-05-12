import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

import { useTranslation } from '../store/useLanguageStore';

export const GallerySection = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { t } = useTranslation();

    const galleryImages = [
        { src: '/gallery/beach.jpg', alt: t.gallery.images.beach, span: 'md:col-span-2 md:row-span-1' },
        { src: '/gallery/comunes01.jpg', alt: t.gallery.images.common, span: 'md:col-span-1 md:row-span-1' },
        { src: '/gallery/beach01.jpg', alt: t.gallery.images.coastal, span: 'md:col-span-1 md:row-span-1' },
        { src: '/gallery/tenis.jpg', alt: t.gallery.images.sports, span: 'md:col-span-1 md:row-span-2' },
        { src: '/gallery/after03.jpg', alt: t.gallery.images.sunset, span: 'md:col-span-1 md:row-span-1' },
        { src: '/gallery/fauna.jpg', alt: t.gallery.images.wildlife, span: 'md:col-span-1 md:row-span-1' },
        { src: '/gallery/beach02.jpg', alt: t.gallery.images.ocean, span: 'md:col-span-1 md:row-span-1' },
        { src: '/gallery/imagen01.jpg', alt: t.gallery.images.arch, span: 'md:col-span-2 md:row-span-1' },
        { src: '/gallery/muelle01.jpg', alt: t.gallery.images.pier, span: 'md:col-span-1 md:row-span-1' },
    ];

    return (
        <section id="gallery" className="py-24 bg-charcoal text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-transparent to-charcoal z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-gold-500 uppercase tracking-[0.3em] text-xs font-bold"
                    >
                        {t.gallery.label}
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-serif mt-4"
                    >
                        {t.gallery.title} <span className="text-gold-500 italic">{t.gallery.highlight}</span>
                    </motion.h2>
                </div>

                {/* Innovative Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
                    {galleryImages.map((item, index) => (
                        <motion.div
                            layoutId={`card-${index}`}
                            key={index}
                            className={`relative group overflow-hidden rounded-xl cursor-pointer ${item.span}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            onClick={() => setSelectedId(index.toString())}
                        >
                            <motion.img
                                src={item.src}
                                alt={item.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    className="bg-white/10 p-4 rounded-full border border-white/30 backdrop-blur-md"
                                >
                                    <ZoomIn className="w-6 h-6 text-white" />
                                </motion.div>
                            </div>

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                                <p className="text-white font-serif text-lg">{item.alt}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedId !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                        onClick={() => setSelectedId(null)}
                    >
                        <motion.button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full"
                            onClick={() => setSelectedId(null)}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                        >
                            <X className="w-8 h-8" />
                        </motion.button>

                        <motion.div
                            layoutId={`card-${selectedId}`}
                            className="relative max-w-7xl max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={galleryImages[parseInt(selectedId)].src}
                                alt={galleryImages[parseInt(selectedId)].alt}
                                className="w-full h-full object-contain max-h-[85vh] rounded-md"
                            />
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <h3 className="text-white font-serif text-2xl drop-shadow-lg">
                                    {galleryImages[parseInt(selectedId)].alt}
                                </h3>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
