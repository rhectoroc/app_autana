import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ArrowLeft, Loader } from 'lucide-react';
import api from '../../services/api';
import { compressImage } from '../../utils/imageOptimizer';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyDetailsModal } from '../../components/PropertyDetailsModal';
import type { Property } from '../../types/property';

export const EditProperty = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        type: 'sale',
        status: 'available',
        bedrooms: '',
        bathrooms: '',
        area_sqm: '',
        parking_spots: '',
        description: ''
    });

    // Features state
    const [featureInput, setFeatureInput] = useState('');
    const [features, setFeatures] = useState<string[]>([]);

    // Images state
    const [existingImages, setExistingImages] = useState<{ id: string | number, image_url: string, is_main: boolean }[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    const fetchProperty = useCallback(async () => {
        try {
            const res = await api.get(`/properties/${id}`);
            const p = res.data;
            setFormData({
                title: p.title,
                location: p.location,
                price: p.price,
                type: p.type,
                status: p.status || 'available',
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                area_sqm: p.area_sqm || '',
                parking_spots: p.parking_spots || '',
                description: p.description
            });
            setFeatures(Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'));
            setExistingImages(p.images || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch property', err);
            alert('Failed to load property details');
            navigate('/admin/dashboard');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    const handleFeaturesKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && featureInput.trim()) {
            e.preventDefault();
            if (!features.includes(featureInput.trim())) {
                setFeatures([...features, featureInput.trim()]);
            }
            setFeatureInput('');
        }
    };

    const removeFeature = (feature: string) => {
        setFeatures(features.filter(f => f !== feature));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = existingImages.length + newImages.length + files.length;
            if (totalImages > 12) {
                alert('Maximum 12 images allowed');
                return;
            }

            try {
                setIsProcessing(true);
                // Optimization step
                const optimizedFiles = await Promise.all(
                    files.map(file => compressImage(file))
                );

                const incomingImages = [...newImages, ...optimizedFiles];
                setNewImages(incomingImages);

                // Generate previews
                const incomingPreviews = optimizedFiles.map(file => URL.createObjectURL(file));
                setNewPreviews([...newPreviews, ...incomingPreviews]);
            } catch (error) {
                console.error('Image processing failed', error);
                alert('Failed to process some images.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const removeExistingImage = (imageId: string | number) => {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
    };

    const removeNewImage = (index: number) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = newPreviews.filter((_, i) => i !== index);
        setNewImages(updatedImages);
        setNewPreviews(updatedPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        data.append('features', JSON.stringify(features));

        // Send existing image IDs as JSON array string
        const keepIds = existingImages.map(img => img.id);
        data.append('existingImages', JSON.stringify(keepIds));

        // Append new images
        newImages.forEach((file) => {
            data.append('images', file);
        });

        try {
            await api.put(`/properties/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            });
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update property. Check console.');
        } finally {
            setSubmitting(false);
        }
    };

    // Construct Preview
    const previewMedia = [
        ...existingImages.map(img => ({ id: img.id, type: 'image' as const, url: img.image_url })),
        ...newPreviews.map((url, i) => ({ id: `new-${i}`, type: 'image' as const, url: url }))
    ];

    const previewProperty: Property = {
        id: id || 'preview',
        title: formData.title || 'Property Title',
        location: formData.location || 'Location',
        price: Number(formData.price) || 0,
        type: formData.type as Property['type'],
        status: formData.status as Property['status'],
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area_sqm: Number(formData.area_sqm) || 0,
        parking_spots: Number(formData.parking_spots) || 0,
        description: formData.description,
        amenities: features,
        features: features,
        media: previewMedia.length > 0 ? previewMedia : [{ id: 'placeholder', type: 'image', url: 'https://via.placeholder.com/400x300?text=No+Image' }],
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-[#D4AF37]"><Loader className="animate-spin w-10 h-10" /></div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center text-[#D4AF37] hover:text-[#E5C158] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <h1 className="text-4xl font-serif text-[#D4AF37] mb-2 tracking-tight">Edit Property</h1>
                <p className="text-gray-400 mb-10">Update the details of your listed estate</p>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* LEFT COLUMN: FORM */}
                    <div className="xl:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-10 bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-300 mb-2">Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Location</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="luxury">Luxury / De Lujo</option>
                                        <option value="rent_short">Short Term Rent</option>
                                        <option value="rent_long">Long Term Rent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className={`w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none font-bold ${formData.status === 'available' ? 'text-green-500' :
                                            formData.status === 'sold' ? 'text-red-500' : 'text-blue-500'
                                            }`}
                                    >
                                        <option value="available" className="text-green-500">Available</option>
                                        <option value="sold" className="text-red-500">Sold</option>
                                        <option value="rented" className="text-blue-500">Rented</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Bedrooms</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.bedrooms}
                                        onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Bathrooms</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={formData.bathrooms}
                                        onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Area (m²)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.area_sqm}
                                        onChange={e => setFormData({ ...formData, area_sqm: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">Parking</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.parking_spots}
                                        onChange={e => setFormData({ ...formData, parking_spots: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                />
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-gray-300 mb-2">Features (Type and press Enter)</label>
                                <input
                                    value={featureInput}
                                    onChange={e => setFeatureInput(e.target.value)}
                                    onKeyDown={handleFeaturesKeyDown}
                                    placeholder="Example: Pool, WiFi, Gym..."
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 focus:border-[#D4AF37] focus:outline-none"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {features.map(feat => (
                                        <span key={feat} className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm flex items-center">
                                            {feat}
                                            <button type="button" onClick={() => removeFeature(feat)} className="ml-2 hover:text-white"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                             {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Media Assets (Max 12)</label>
                                <div 
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files) {
                                            const event = { target: { files: e.dataTransfer.files } } as any;
                                            handleImageChange(event);
                                        }
                                    }}
                                    className={`group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 relative overflow-hidden ${
                                        isDragging 
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01] shadow-[0_0_30px_rgba(212,175,55,0.2)]' 
                                        : 'border-white/10 bg-black/20 hover:border-[#D4AF37]/50'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="relative z-0">
                                        {isProcessing ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full border-4 border-t-[#D4AF37] border-white/10 animate-spin mb-4"></div>
                                                <p className="text-lg font-medium text-[#D4AF37] animate-pulse">Optimizing images...</p>
                                                <p className="text-sm text-gray-500 mt-1">Applying luxury standards to your media</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]'}`} />
                                                </div>
                                                <p className={`text-lg font-medium transition-colors ${isDragging ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                                                    {isDragging ? 'Release to upload' : 'Drag images here to add more'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">or click to browse from your device</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
                                </div>


                                {/* Existing Images */}
                                {(existingImages.length > 0 || newPreviews.length > 0) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        {existingImages.map((img, index) => (
                                            <div key={`existing-${img.id}`} className="relative group">
                                                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded z-10">Saved</span>
                                                <img
                                                    src={img.image_url}
                                                    alt={`Existing ${index}`}
                                                    className="w-full h-32 object-cover rounded border-2 border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 hover:scale-110 transition-all z-10"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {newPreviews.map((src, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <span className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-1 rounded z-10">New</span>
                                                <img
                                                    src={src}
                                                    alt={`New ${index}`}
                                                    className="w-full h-32 object-cover rounded border-2 border-green-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 hover:scale-110 transition-all z-10"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-neutral-700">
                                {submitting && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-[#D4AF37]">Saving changes...</span>
                                            <span className="text-gray-400">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-neutral-700 rounded-full h-2">
                                            <div 
                                                className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-[#D4AF37] text-black font-bold py-4 rounded hover:bg-[#E5C158] transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? 'Processing...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    <div className="xl:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <h3 className="text-xl font-serif text-[#D4AF37] border-b border-neutral-700 pb-2">Live Preview</h3>
                            <div className="bg-gray-100 rounded-xl p-4 shadow-lg border border-neutral-700/50">
                                <p className="text-xs text-gray-500 mb-2 text-center uppercase tracking-widest">How it looks on the site</p>
                                <PropertyCard
                                    property={previewProperty}
                                    onClick={() => setShowPreviewModal(true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
                {showPreviewModal && (
                    <PropertyDetailsModal
                        property={previewProperty}
                        onClose={() => setShowPreviewModal(false)}
                    />
                )}
            </div>
        </div>
    );
};
