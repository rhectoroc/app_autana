import { useState } from 'react';
import { Search, MapPin, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../store/useLanguageStore';

interface SearchFilters {
    q: string;
    location: string;
    type: 'all' | 'sale' | 'rent_long' | 'rent_short';
}

interface PropertySearchProps {
    onSearch: (filters: SearchFilters) => void;
}

export const PropertySearch = ({ onSearch }: PropertySearchProps) => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<SearchFilters>({
        q: '',
        location: '',
        type: 'all'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(filters);
        // Scroll to properties section
        const element = document.getElementById('properties');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="w-full max-w-6xl mx-auto mt-12 px-4"
        >
            <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md p-4 md:p-2 rounded-3xl md:rounded-full shadow-2xl border border-white/20 flex flex-col md:flex-row items-center gap-0 md:gap-2">

                {/* Search Input */}
                <div className="flex-1 w-full relative group p-2 md:p-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder={t.search.placeholder}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 md:bg-transparent md:border-none focus:ring-0 text-charcoal placeholder-gray-400 font-medium rounded-xl md:rounded-full md:hover:bg-gray-50/50 transition-colors"
                        value={filters.q}
                        onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                    />
                </div>

                <div className="h-px w-full bg-gray-100 md:hidden my-1" /> {/* Mobile Divider */}
                <div className="h-8 w-px bg-gray-200 hidden md:block" />   {/* Desktop Divider */}

                {/* Location Input */}
                <div className="flex-1 w-full relative group p-2 md:p-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder={t.search.location}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 md:bg-transparent md:border-none focus:ring-0 text-charcoal placeholder-gray-400 font-medium rounded-xl md:rounded-full md:hover:bg-gray-50/50 transition-colors"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                </div>

                <div className="h-px w-full bg-gray-100 md:hidden my-1" /> {/* Mobile Divider */}
                <div className="h-8 w-px bg-gray-200 hidden md:block" />   {/* Desktop Divider */}

                {/* Type Select */}
                <div className="w-full md:w-48 relative group p-2 md:p-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500">
                        <Home className="w-5 h-5" />
                    </div>
                    <select
                        className="w-full pl-12 pr-8 py-3 bg-gray-50 md:bg-transparent md:border-none focus:ring-0 text-charcoal font-medium appearance-none cursor-pointer rounded-xl md:rounded-full md:hover:bg-gray-50/50 transition-colors"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                        <option value="all">{t.search.types.all}</option>
                        <option value="sale">{t.search.types.sale}</option>
                        <option value="rent_long">{t.search.types.rent_long}</option>
                        <option value="rent_short">{t.search.types.rent_short}</option>
                    </select>
                </div>

                {/* Search Button */}
                <div className="w-full md:w-auto p-2 md:p-0 mt-2 md:mt-0">
                    <button
                        type="submit"
                        className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-xl md:rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
                    >
                        {t.search.searchButton}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
