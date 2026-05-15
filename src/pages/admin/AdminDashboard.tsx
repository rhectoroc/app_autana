import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Home, Edit } from 'lucide-react';
import api from '../../services/api';
import type { Property } from '../../types/property';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const AdminDashboard = () => {
    const [properties, setProperties] = useState<Property[]>([]);

    // Modal state
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | number | null }>({
        isOpen: false,
        id: null
    });

    const fetchProperties = async () => {
        try {
            const res = await api.get('/properties');
            setProperties(res.data);
        } catch (err) {
            console.error('Failed to fetch properties', err);
        }
    };

    /**
     * Fetch properties on mount
     */
    useEffect(() => {
        fetchProperties();
    }, []);

    const handleDelete = (id: string | number) => {
        setConfirmDelete({ isOpen: true, id });
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete.id) return;
        try {
            await api.delete(`/properties/${confirmDelete.id}`);
            setProperties(properties.filter(p => p.id !== confirmDelete.id));
        } catch (err) {
            console.error('Failed to delete property', err);
        } finally {
            setConfirmDelete({ isOpen: false, id: null });
        }
    };

    return (
        <div className="space-y-8 pt-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-4xl font-serif text-[#D4AF37] mb-2 tracking-tight">Property Inventory</h2>
                    <p className="text-gray-500">Manage and publish your real estate assets with precision.</p>
                </div>
                <Link
                    to="/admin/create"
                    className="bg-[#D4AF37] hover:bg-[#E5C158] text-black px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-[0_10px_20px_rgba(212,175,55,0.1)] group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    New Property
                </Link>
            </div>

            {/* Table Container */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/10">
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Preview</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Details</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Investment</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Type</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Status</th>
                                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {properties.map((prop) => {
                                const mainImage = prop.media?.find(m => m.type === 'image') || prop.media?.[0];
                                const getImageUrl = (url: string) => {
                                    if (!url) return 'https://placehold.co/400x400/1a1a1a/D4AF37?text=No+Image';
                                    if (url.startsWith('http')) return url;
                                    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                    return `${baseUrl}${url}`;
                                };
                                return (
                                    <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:border-[#D4AF37]/50 transition-colors">
                                                <img
                                                    src={getImageUrl(mainImage?.url)}
                                                    alt={prop.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = 'https://placehold.co/400x400/1a1a1a/D4AF37?text=Error';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-white font-medium text-lg leading-tight mb-1 group-hover:text-[#D4AF37] transition-colors">{prop.title}</p>
                                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                                <Home className="w-3 h-3" /> {prop.location}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-[#D4AF37] font-bold text-xl tracking-tighter">
                                                ${Number(prop.price).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                prop.type === 'luxury' ? 'bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' :
                                                prop.type === 'sale' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                prop.type === 'rent_long' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            }`}>
                                                {prop.type === 'rent_short' ? 'Vacation' :
                                                 prop.type === 'rent_long' ? 'Long Rent' : 
                                                 prop.type === 'luxury' ? 'Luxury' : 'Sale'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                                    prop.status === 'available' ? 'bg-green-500' :
                                                    prop.status === 'sold' ? 'bg-red-500' : 'bg-blue-500'
                                                }`} />
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                    {(prop.status || 'available')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    to={`/admin/edit/${prop.id}`}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prop.id)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-xl cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <Home className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No properties registered yet.</p>
                                        <Link to="/admin/create" className="text-[#D4AF37] text-sm mt-2 hover:underline">Start by adding the first one</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Delete Property"
                message="Are you sure you want to permanently delete this luxury estate? This action will remove all associated media and data."
                confirmText="Delete Property"
                isDanger={true}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
            />
        </div>
    );
};
