import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ClipboardCheck, Wrench, PaintBucket, Check } from 'lucide-react';

import { useTranslation } from '../store/useLanguageStore';

const ServiceCard = ({ service, index }: { service: any, index: number }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;

        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="feature-card relative w-full h-full min-h-[500px] bg-charcoal rounded-2xl p-8 border border-white/10 shadow-2xl group cursor-pointer overflow-hidden"
        >
            {/* Background Gradient Effect */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ transform: "translateZ(-50px)" }}
            />

            {/* Cone Light Effect */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500"
                style={{
                    background: useTransform(
                        mouseX,
                        [-0.5, 0.5],
                        [
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)",
                            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 60%)"
                        ]
                    ),
                    transform: "translateZ(1px)"
                }}
            />

            {/* Content Container */}
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10 h-full flex flex-col">

                {/* Icon Box */}
                <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <service.icon className="w-8 h-8 text-charcoal" />
                </div>

                <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-gold-400 transition-colors duration-300">
                    {service.title}
                </h3>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mt-auto">
                    {service.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center text-sm text-gray-300">
                            <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mr-3 border border-white/10 group-hover:border-gold-500/50 transition-colors">
                                <Check className="w-3 h-3 text-gold-500" />
                            </span>
                            {feature}
                        </li>
                    ))}
                </ul>


            </div>
        </motion.div>
    );
};

export const ServicesSection = () => {
    const { t } = useTranslation();

    const services = [
        {
            title: t.services.items.admin.title,
            description: t.services.items.admin.desc,
            icon: ClipboardCheck,
            features: t.services.items.admin.features
        },
        {
            title: t.services.items.maintenance.title,
            description: t.services.items.maintenance.desc,
            icon: Wrench,
            features: t.services.items.maintenance.features
        },
        {
            title: t.services.items.renovations.title,
            description: t.services.items.renovations.desc,
            icon: PaintBucket,
            features: t.services.items.renovations.features
        }
    ];

    return (
        <section id="services" className="py-24 bg-charcoal-dark relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#0F1115]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-gold-500 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
                            {t.services.header}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                            {t.services.title} <br /> <span className="text-gold-500 italic">{t.services.titleHighlight}</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {t.services.description}
                        </p>
                    </motion.div>
                </div>

                {/* 3D Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
                    {services.map((service, index) => (
                        <ServiceCard key={index} service={service} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
};
