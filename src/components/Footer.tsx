import { Facebook, Instagram, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../store/useLanguageStore';

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-charcoal text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <a href="/" className="block mb-6">
                            <img
                                src="/logo/logoOriginal.png"
                                alt="Autana Group"
                                className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </a>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {t.footer.about}
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/autana.group/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-500 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/AutanaGroup" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-500 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://api.whatsapp.com/send?phone=18293515702&text=Saludos%2C%20necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20una%20propiedad." target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-500 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="h-[200px] w-full rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60529.69176161271!2d-68.40698242187501!3d18.57053538805561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea8eb625607b32d%3A0x6295383556ba0062!2sPunta%20Cana%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1705850000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale hover:grayscale-0 transition-all duration-700 opacity-70 hover:opacity-100"
                            title="Punta Cana Location"
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif text-lg mb-6 text-gold-500">{t.footer.contact}</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-gold-500 flex-shrink-0" />
                                <span>Calle principal de Villas Bávaro<br />La Altagracia, RD 23301</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-3 text-gold-500 flex-shrink-0" />
                                <span>+1 (829) 351-5702</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-gold-500 flex-shrink-0" />
                                <span>Ll.es.servicios@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-serif text-lg mb-6 text-gold-500">{t.footer.newsletter.title}</h4>
                        <p className="text-gray-400 text-sm mb-4">{t.footer.newsletter.text}</p>
                        <div className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder={t.footer.newsletter.placeholder}
                                className="bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
                                aria-label="Email address"
                            />
                            <button className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-3 uppercase text-xs font-bold tracking-widest transition-colors">
                                {t.footer.newsletter.button}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} {t.footer.rights}</p>
                        <div className="flex space-x-6">
                            <Link to="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-center md:text-right">
                        <p>
                            {t.footer.developer}{' '}
                            <a href="http://adrielssystems.com" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:text-white transition-colors">
                                Adriel's Systems
                            </a>{' '}
                            | {t.footer.slogan}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
