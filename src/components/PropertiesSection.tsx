import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import clsx from 'clsx';
import api from '../services/api';
import { useTranslation } from '../store/useLanguageStore';

interface PropertiesSectionProps {
    filters?: {
        q: string;
        location: string;
        type: 'all' | 'sale' | 'rent_long' | 'rent_short';
    } | null;
}

export const PropertiesSection = ({ filters }: PropertiesSectionProps) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'rent_long' | 'rent_short'>('all');
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    // Sync activeFilter with prop filters if present
    useEffect(() => {
        if (filters?.type) {
            setActiveFilter(filters.type);
        }
    }, [filters]);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                // Construct query params
                const params: any = {};
                if (filters) {
                    if (filters.q) params.q = filters.q;
                    if (filters.location) params.location = filters.location;
                    if (filters.type && filters.type !== 'all') params.type = filters.type;
                }

                // If we are filtering using the local tabs (and no global search is active OR the global search type matches the tab),
                // we might want to ensure consistency. 
                // BUT, simplify: The API call should reflect the CURRENT state the user expects.
                // If filters prop changed, we used it. If user clicks tab, we use that.
                // However, fetching happens on mount or when dependencies change.

                // Better approach: 
                // 1. Initial load: fetch all.
                // 2. If 'filters' prop updates -> params = filters -> activeFilter updates -> fetch.
                // 3. If 'activeFilter' updates (user clicks tab) -> params.type = activeFilter -> fetch.
                // 
                // To avoid conflicts, let's merge them.

                if (activeFilter !== 'all') params.type = activeFilter;

                // If filters prop exists, it overrides or augments.
                // actually, if user just searched "Punta Cana" (type: all), but then clicks "Sale", we want "Punta Cana" + "Sale".
                if (filters?.q) params.q = filters.q;
                if (filters?.location) params.location = filters.location;

                const res = await api.get('/properties', { params });

                // Map API data to PropertyCard format
                const mapped = res.data.map((p: any) => ({
                    ...p,
                    id: p.id,
                    media: (p.images || []).map((img: any) => ({
                        id: img.id,
                        url: img.image_url,
                        type: 'image'
                    })),
                    // Defaults for usage if missing
                    area_sqm: p.area_sqm || 0,
                    parking_spots: p.parking_spots || 0,
                    type: p.type
                }));
                setProperties(mapped);
            } catch (err) {
                console.error('Failed to fetch', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [filters, activeFilter]);

    // Client-side filtering is no longer needed if API handles it, 
    // BUT if API returns everything (e.g. no params), we still might want client filtering?
    // Current API design: returns everything if no params.
    // So if params are sent, we get filtered list.
    // If we use activeFilter to param, we get filtered list.
    // So 'filteredProperties' is just 'properties'.

    const filteredProperties = properties;

    const tabs = [
        { id: 'all', label: t.properties.tabs.all },
        { id: 'sale', label: t.properties.tabs.sale },
        { id: 'rent_long', label: t.properties.tabs.rent_long },
        { id: 'rent_short', label: t.properties.tabs.rent_short },
    ];

    if (loading) {
        return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <div>
                    <span className="text-gold-500 uppercase tracking-widest text-sm font-semibold">{t.properties.collection}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-charcoal mt-2">
                        {t.properties.featured}
                    </h2>
                </div>

                {/* Filter Tabs - Desktop */}
                <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as any)}
                            className={clsx(
                                "px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300",
                                activeFilter === tab.id
                                    ? "bg-white text-gold-500 shadow-sm"
                                    : "text-gray-500 hover:text-charcoal"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Tabs - Mobile (Scrollable) */}
            <div className="md:hidden overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex space-x-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as any)}
                            className={clsx(
                                "flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border transition-all duration-300",
                                activeFilter === tab.id
                                    ? "bg-gold-500 border-gold-500 text-white"
                                    : "bg-transparent border-gray-200 text-gray-500 hover:border-gold-500 hover:text-gold-500"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Properties Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[500px]"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProperties.map((property) => (
                        <motion.div
                            key={property.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PropertyCard
                                property={property}
                                onClick={() => setSelectedProperty(property)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredProperties.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-400 text-lg">{t.properties.noProps}</p>
                    {/* Optional: Add admin hint if logged in */}
                </div>
            )}


            {selectedProperty && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
        </div>
    );
};
