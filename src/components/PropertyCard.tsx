import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Bed, Bath, Car, Maximize, MapPin, Play } from 'lucide-react';
import type { Property } from '../types/property';
import { formatCurrency, formatArea } from '../utils/format';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import clsx from 'clsx';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { useTranslation } from '../store/useLanguageStore';

interface PropertyCardProps {
    property: Property;
    onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
    const [isPlaying, setIsPlaying] = useState<string | number | null>(null);
    const { t } = useTranslation();

    // 3D Hover Effect Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
    const mouseXSpring = useSpring(x, springConfig);
    const mouseYSpring = useSpring(y, springConfig);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const getTypeLabel = (type: Property['type']) => {
        switch (type) {
            case 'sale': return t.properties.tabs.sale;
            case 'rent_short': return t.properties.tabs.rent_short;
            case 'rent_long': return t.properties.tabs.rent_long;
            default: return type;
        }
    };

    const getTypeColor = (type: Property['type']) => {
        switch (type) {
            case 'sale': return 'bg-gold-500';
            default: return 'bg-charcoal';
        }
    };

    return (
        <motion.div
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-transparent hover:border-gold-400/50"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ scale: 1, zIndex: 0 }}
            whileHover={{
                scale: 1.05,
                zIndex: 50,
                boxShadow: "0px 20px 40px rgba(0,0,0,0.2)"
            }}
        >
            {/* Media Carousel */}
            <div className="relative h-64 w-full bg-gray-100">
                <Swiper
                    modules={[Pagination, Navigation, EffectFade]}
                    effect={'fade'}
                    fadeEffect={{ crossFade: true }}
                    speed={600}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    className="h-full w-full"
                >
                    {property.media.map((item, index) => (
                        <SwiperSlide key={item.id || index}>
                            {item.type === 'video' ? (
                                <div className="relative h-full w-full">
                                    <video
                                        src={item.url}
                                        className="h-full w-full object-cover"
                                        controls={isPlaying === item.id}
                                        poster={property.media.find(m => m.type === 'image')?.url}
                                        onPlay={() => setIsPlaying(item.id)}
                                        onPause={() => setIsPlaying(null)}
                                    />
                                    {isPlaying !== item.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                            <div className="bg-white/80 p-3 rounded-full backdrop-blur-sm">
                                                <Play className="w-6 h-6 text-gold-500 fill-gold-500 ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div onClick={onClick} className="block h-full w-full cursor-pointer">
                                    <img
                                        src={item.url}
                                        alt={property.title}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null; // Prevent loop
                                            target.src = 'https://placehold.co/600x400/1a1a1a/D4AF37?text=Autana+Group';
                                        }}
                                    />
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Status Badge */}
                <div className={clsx(
                    "absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wider",
                    getTypeColor(property.type)
                )}>
                    {getTypeLabel(property.type)}
                </div>

                {property.status === 'sold' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <span className="text-white text-3xl font-serif font-bold uppercase tracking-widest border-4 border-white px-6 py-2 transform -rotate-12">
                            SOLD
                        </span>
                    </div>
                )}

                {/* Price Overlay (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gold-500/30">
                        <span className="text-white font-serif text-lg font-medium">
                            {formatCurrency(property.price)}
                        </span>
                        {property.type.includes('rent') && <span className="text-gray-300 text-xs ml-1">/mo</span>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div onClick={onClick} className="block p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-xl text-charcoal font-medium line-clamp-1 group-hover:text-gold-500 transition-colors">
                        {property.title}
                    </h3>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-gold-500" />
                    <span className="line-clamp-1">{property.location}</span>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gray-100 my-4 group-hover:bg-gold-100 transition-colors" />

                {/* Features */}
                <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <Bed className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gold-500 transition-colors" />
                        <span className="text-xs text-gray-600 truncate w-full">{property.bedrooms} {t.properties.details.beds}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Bath className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gold-500 transition-colors" />
                        <span className="text-xs text-gray-600 truncate w-full">{property.bathrooms} {t.properties.details.baths}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Maximize className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gold-500 transition-colors" />
                        <span className="text-xs text-gray-600 truncate w-full">{formatArea(property.area_sqm)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Car className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gold-500 transition-colors" />
                        <span className="text-xs text-gray-600 truncate w-full">{property.parking_spots || 0} {t.properties.details.parking}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
