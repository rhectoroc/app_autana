import React, { useState, useEffect } from 'react';
import { X, MapPin, Bed, Bath, Maximize, Car, Check, Share2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import type { Property } from '../types/property';
import { formatCurrency, getMediaUrl } from '../utils/format';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTranslation } from '../store/useLanguageStore';

interface PropertyDetailsModalProps {
    property: Property;
    onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [swiperInstance, setSwiperInstance] = useState<any>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: property.title,
                    text: `Check out this property: ${property.title}`,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full transition-all duration-300 shadow-sm
                                 bg-black/50 text-white hover:bg-black/70
                                 lg:bg-gray-100 lg:text-charcoal lg:hover:bg-gray-200 lg:hover:text-gold-500"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

                        {/* Split Layout: Media (Left/Top) & Details (Right/Bottom) */}
                        <div className="flex flex-col lg:flex-row">

                            {/* Visuals Column */}
                            <div className="lg:w-3/5 bg-gray-100 flex flex-col relative">
                                <div className="h-[350px] lg:h-[450px] relative w-full">
                                    <Swiper
                                        modules={[Pagination, Navigation]}
                                        speed={700}
                                        pagination={{ clickable: true, dynamicBullets: true }}
                                        navigation
                                        loop={true}
                                        onSwiper={setSwiperInstance}
                                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                                        className="w-full h-full text-white"
                                    >
                                        {property.media.map((item, index) => (
                                            <SwiperSlide key={item.id || index} className="w-full h-full bg-black">
                                                {item.type === 'video' ? (
                                                    <video
                                                        src={getMediaUrl(item.url)}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="relative w-full h-full flex items-center justify-center">
                                                        <img
                                                            src={getMediaUrl(item.url)}
                                                            alt={`View ${index + 1}`}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = 'https://placehold.co/600x400/1a1a1a/D4AF37?text=Image+Missing';
                                                            }}
                                                        />
                                                        {/* Brand Watermark Overlay (Pre-upload Preview) */}
                                                        {item.url.startsWith('blob:') && (
                                                            <div className="absolute bottom-6 right-6 w-1/5 max-w-[120px] pointer-events-none opacity-40 z-10">
                                                                <img src="/logo/autana_watermark.png" alt="Watermark" className="w-full h-auto" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    <div className="absolute top-6 left-6 z-10">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md text-white ${property.status === 'sold' ? 'bg-red-600' :
                                            property.type === 'sale' ? 'bg-gold-500' : 'bg-charcoal'
                                            }`}>
                                            {property.status === 'sold' ? 'SOLD' : property.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                <div className="p-4 bg-white border-t border-gray-100 flex gap-3 overflow-x-auto scrollbar-hide">
                                    {property.media.map((item, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => swiperInstance?.slideToLoop(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${activeIndex === index ? 'border-gold-500 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                                                }`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-charcoal flex items-center justify-center relative">
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                                        <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                                                        </div>
                                                    </div>
                                                    <video src={getMediaUrl(item.url)} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={getMediaUrl(item.url)}
                                                    alt={`Thumbnail ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Details Column */}
                            <div className="lg:w-2/5 p-6 lg:p-8 bg-white overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl md:text-3xl font-serif text-charcoal leading-tight">
                                        {property.title}
                                    </h2>
                                </div>

                                <div className="flex items-center text-gray-500 mb-6 text-sm">
                                    <MapPin className="w-4 h-4 mr-1 text-gold-500" />
                                    {property.location}
                                </div>

                                <div className="flex items-baseline mb-6 border-b border-gray-100 pb-6">
                                    <span className="text-3xl font-serif text-charcoal font-bold">
                                        {formatCurrency(property.price)}
                                    </span>
                                    {property.type.includes('rent') && <span className="text-gray-500 ml-2">/month</span>}
                                </div>

                                {/* Key Specs */}
                                <div className="grid grid-cols-4 gap-2 mb-8 text-center bg-off-white p-4 rounded-xl">
                                    <div className="flex flex-col items-center">
                                        <Bed className="w-5 h-5 text-gold-500 mb-1" />
                                        <span className="font-bold text-gray-800">{property.bedrooms}</span>
                                        <span className="text-[10px] uppercase text-gray-500">{t.properties.details.beds}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Bath className="w-5 h-5 text-gold-500 mb-1" />
                                        <span className="font-bold text-gray-800">{property.bathrooms}</span>
                                        <span className="text-[10px] uppercase text-gray-500">{t.properties.details.baths}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Maximize className="w-5 h-5 text-gold-500 mb-1" />
                                        <span className="font-bold text-gray-800">{property.area_sqm}</span>
                                        <span className="text-[10px] uppercase text-gray-500">m²</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Car className="w-5 h-5 text-gold-500 mb-1" />
                                        <span className="font-bold text-gray-800">{property.parking_spots}</span>
                                        <span className="text-[10px] uppercase text-gray-500">{t.properties.details.parking}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase text-charcoal mb-2 tracking-wider">Description</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed text-justify indent-8">
                                            {property.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold uppercase text-charcoal mb-3 tracking-wider">Amenities</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {property.amenities?.map((amenity, i) => (
                                                <div key={i} className="flex items-center text-xs text-gray-600">
                                                    <Check className="w-3 h-3 text-gold-500 mr-2 flex-shrink-0" />
                                                    {amenity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Footer (Sticky) */}
                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                                    <motion.button
                                        whileHover="hover"
                                        initial="initial"
                                        className="flex-1 relative overflow-hidden bg-charcoal text-white font-bold py-4 rounded-sm uppercase text-xs tracking-[0.2em] shadow-xl group"
                                    >
                                        <span className="relative z-10 transition-colors duration-500 group-hover:text-charcoal flex items-center justify-center gap-2">
                                            Contact Agent
                                        </span>
                                        <motion.div
                                            variants={{
                                                initial: { x: '-100%' },
                                                hover: { x: '0%' }
                                            }}
                                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
                                            className="absolute inset-0 bg-gold-500"
                                        />
                                    </motion.button>

                                    <button
                                        onClick={handleShare}
                                        className={`p-4 border rounded-sm transition-all duration-300 ${copied ? 'border-green-500 text-green-500 bg-green-50' : 'border-gray-200 hover:border-gold-500 hover:text-gold-500 hover:bg-gold-50'}`}
                                        title={copied ? "Copied!" : "Share Property"}
                                    >
                                        {copied ? <CheckCheck className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
