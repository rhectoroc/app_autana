import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Home, LogOut, Edit } from 'lucide-react';
import api from '../../services/api';
import type { Property } from '../../types/property';
import { useAuthStore } from '../../store/useAuthStore';

export const AdminDashboard = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const { logout } = useAuthStore();

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

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                await api.delete(`/properties/${id}`);
                setProperties(properties.filter(p => p.id !== id));
            } catch (err) {
                console.error('Failed to delete property', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <nav className="bg-neutral-900 text-[#D4AF37] p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Home className="w-6 h-6" />
                    <h1 className="text-xl font-serif font-bold">Autana Admin</h1>
                </div>
                <button onClick={logout} className="flex items-center gap-2 hover:text-[#E5C158] transition-colors cursor-pointer">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </nav>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-gray-800">Properties</h2>
                    <Link
                        to="/admin/create"
                        className="bg-[#D4AF37] hover:bg-[#E5C158] text-black px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Add Property
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Image</th>
                                    <th className="p-4 font-semibold text-gray-600">Title</th>
                                    <th className="p-4 font-semibold text-gray-600">Price</th>
                                    <th className="p-4 font-semibold text-gray-600">Type</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {properties.map((prop) => {
                                    const mainImage = prop.media?.find(m => m.type === 'image') || prop.media?.[0];
                                    const getImageUrl = (url: string) => {
                                        if (!url) return '';
                                        if (url.startsWith('http')) return url;
                                        // If API URL is /api, assets are at root
                                        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                        return `${baseUrl}${url}`;
                                    };
                                    return (
                                        <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                {mainImage ? (
                                                    <img
                                                        src={getImageUrl(mainImage.url)}
                                                        alt={prop.title}
                                                        className="w-16 h-16 object-cover rounded"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.onerror = null;
                                                            target.src = 'https://placehold.co/400x400/1a1a1a/D4AF37?text=Image+Missing';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">{prop.title}</td>
                                            <td className="p-4 text-gray-600">${prop.price}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    prop.type === 'luxury' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' :
                                                    prop.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                                                    prop.type === 'rent_long' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {prop.type === 'rent_short' ? 'Rent (Short)' :
                                                     prop.type === 'rent_long' ? 'Rent (Long)' : 
                                                     prop.type === 'luxury' ? 'Luxury' : 'Sale'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${prop.status === 'sold' ? 'bg-red-100 text-red-800' :
                                                    prop.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {(prop.status || 'available').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <Link
                                                    to={`/admin/edit/${prop.id}`}
                                                    className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prop.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {properties.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No properties found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
