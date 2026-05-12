import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingModal } from './BookingModal';
import { useTranslation } from '../store/useLanguageStore';
import { Globe } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { t, language, toggleLanguage } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t.navbar.properties, href: '#properties' },
        { name: t.navbar.services, href: '#services' },
        { name: t.navbar.gallery, href: '#gallery' },
        { name: t.navbar.about, href: '#about' },
    ];

    return (
        <>
            <nav
                className={clsx(
                    'fixed w-full z-50 transition-all duration-500 ease-in-out',
                    isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-4'
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            {/* Text Logo for now, replace with Image if provided */}
                            <a href="/" className="group block">
                                <img
                                    src="/logo/logoOriginal.png"
                                    alt="Autana Group"
                                    className="h-14 w-auto object-contain transition-all duration-300"
                                />
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className={clsx(
                                        'text-sm font-medium tracking-wide uppercase transition-colors duration-300 hover:text-gold-500',
                                        isScrolled ? 'text-charcoal' : 'text-white'
                                    )}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center space-x-6">

                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                className={clsx(
                                    "flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-300 p-2",
                                    isScrolled ? "text-charcoal hover:text-gold-500" : "text-white hover:text-gold-400"
                                )}
                            >
                                <Globe className="w-4 h-4" />
                                <span>{language === 'en' ? 'ES' : 'EN'}</span>
                            </button>

                            <Link
                                to="/login"
                                className={clsx(
                                    "transition-colors duration-300 p-2",
                                    isScrolled ? "text-charcoal hover:text-gold-500" : "text-white hover:text-gold-400"
                                )}
                                title={t.navbar.adminSignIn}
                            >
                                <User className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-sm uppercase text-xs font-bold tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20"
                            >
                                {t.navbar.bookNow}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={clsx(
                                    "p-2 rounded-md transition-colors",
                                    isScrolled ? "text-charcoal" : "text-white"
                                )}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-1">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="block px-3 py-4 text-center text-base font-serif text-charcoal hover:bg-gray-50 hover:text-gold-500 border-b border-gray-100"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="pt-4 px-3 flex flex-col gap-4">
                                    <div className="flex items-center justify-center gap-8">
                                        <button
                                            onClick={() => {
                                                toggleLanguage();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-2 text-charcoal font-medium hover:text-gold-500 transition-colors"
                                            aria-label="Toggle Language"
                                        >
                                            <Globe className="w-6 h-6" />
                                        </button>

                                        <Link
                                            to="/login"
                                            className="flex items-center gap-2 text-charcoal font-medium hover:text-gold-500 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            aria-label="Sign In"
                                        >
                                            <User className="w-6 h-6" />
                                        </Link>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsBookingModalOpen(true);
                                        }}
                                        className="w-full bg-gold-500 text-white px-6 py-3 uppercase text-sm font-bold tracking-widest"
                                    >
                                        {t.navbar.bookNow}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav >

            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
        </>
    );
};
