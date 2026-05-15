import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { compressImage } from '../../utils/imageOptimizer';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyDetailsModal } from '../../components/PropertyDetailsModal';
import type { Property } from '../../types/property';
import { useToast } from '../../context/ToastContext';

export const CreateProperty = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        type: 'sale',
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
            if (selectedImages.length + files.length > 20) {
                showToast('Maximum 20 images allowed', 'warning');
                return;
            }

            try {
                setIsProcessing(true);
                // Optimization step
                const optimizedFiles = await Promise.all(
                    files.map(file => compressImage(file))
                );

                const newImages = [...selectedImages, ...optimizedFiles];
                setSelectedImages(newImages);

                // Generate previews
                const newPreviews = optimizedFiles.map(file => URL.createObjectURL(file));
                setPreviews([...previews, ...newPreviews]);
            } catch (error) {
                console.error('Image processing failed', error);
                showToast('Failed to process some images.', 'error');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setSelectedImages(newImages);
        setPreviews(newPreviews);

        // Adjust main image index if needed
        if (mainImageIndex === index) setMainImageIndex(0);
        else if (mainImageIndex > index) setMainImageIndex(mainImageIndex - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Sort images so main image is first
        const sortedImages = [...selectedImages];
        if (mainImageIndex > 0 && mainImageIndex < sortedImages.length) {
            const main = sortedImages[mainImageIndex];
            sortedImages.splice(mainImageIndex, 1);
            sortedImages.unshift(main);
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            // Ensure numeric values are numbers, even if they come from inputs
            if (['price', 'bedrooms', 'bathrooms', 'area_sqm', 'parking_spots'].includes(key)) {
                data.append(key, String(Number(value) || 0));
            } else {
                data.append(key, value);
            }
        });
        data.append('features', JSON.stringify(features));
        // Status defaults to available/Active

        sortedImages.forEach((file) => {
            data.append('images', file);
        });

        if (selectedVideo) {
            data.append('video', selectedVideo);
        }

        try {
            await api.post('/properties', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            showToast('Property created successfully!', 'success');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Upload failed', err);
            showToast('Failed to create property. Check connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Construct preview property object
    const previewProperty: Property = {
        id: 'preview',
        title: formData.title || 'Property Title',
        location: formData.location || 'Location',
        price: Number(formData.price) || 0,
        type: formData.type as 'sale' | 'rent_short' | 'rent_long',
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area_sqm: Number(formData.area_sqm) || 0,
        parking_spots: Number(formData.parking_spots) || 0,
        description: formData.description,
        amenities: features,
        features: features, // Using features for both fields to ensure compatibility
        media: previews.length > 0 ? previews.map((url, i) => ({
            id: `p-${i}`,
            type: 'image',
            url: url
        })) : [{ id: 'placeholder', type: 'image', url: '/logo/logoOriginal.png' }], // Use local logo as premium fallback
        status: 'available'
    };

    // Sort preview media to respect main image selection
    if (previews.length > 0 && mainImageIndex > 0 && mainImageIndex < previewProperty.media.length) {
        const main = previewProperty.media[mainImageIndex];
        previewProperty.media.splice(mainImageIndex, 1);
        previewProperty.media.unshift(main);
    }

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

                <h1 className="text-4xl font-serif text-[#D4AF37] mb-2 tracking-tight">Create Property</h1>
                <p className="text-gray-400 mb-10">Fill in the details to list a new luxury estate</p>

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
                                        <option value="luxury">Luxury</option>
                                        <option value="rent_short">Short Term Rent</option>
                                        <option value="rent_long">Long Term Rent</option>
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
                                            <button onClick={() => removeFeature(feat)} className="ml-2 hover:text-white"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                             {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Media Assets (Max 20 Images + 1 Video)</label>
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
                                                <p className="text-lg font-medium text-[#D4AF37] animate-pulse">Applying luxury standards...</p>
                                                <p className="text-sm text-gray-500 mt-1">Converting to WebP & Watermarking</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]'}`} />
                                                </div>
                                                <p className={`text-lg font-medium transition-colors ${isDragging ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                                                    {isDragging ? 'Release to upload' : 'Drag images here'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">or click to browse from your device</p>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Subtle decorative background gradient */}
                                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
                                </div>


                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        {previews.map((src, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={src}
                                                    alt={`Preview ${index}`}
                                                    className={`w-full h-32 object-cover rounded border-2 ${mainImageIndex === index ? 'border-[#D4AF37]' : 'border-transparent'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMainImageIndex(index)}
                                                    className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${mainImageIndex === index ? 'bg-[#D4AF37] text-black' : 'bg-black/70 text-white'}`}
                                                >
                                                    {mainImageIndex === index ? 'Main Cover' : 'Set as Main'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Video Upload */}
                            <div className="mt-8">
                                <label className="block text-gray-300 mb-2">Video (Optional - Max 1)</label>
                                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center hover:border-[#D4AF37] transition-colors relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={e => setSelectedVideo(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <p className="text-gray-400">
                                        {selectedVideo ? `Selected: ${selectedVideo.name}` : 'Click to upload video'}
                                    </p>
                                </div>
                                {selectedVideo && (
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedVideo(null)}
                                        className="mt-2 text-red-500 text-sm hover:underline"
                                    >
                                        Remove video
                                    </button>
                                )}
                            </div>

                            <div className="pt-6 border-t border-neutral-700">
                                {loading && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-[#D4AF37]">Uploading...</span>
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
                                    disabled={loading}
                                    className={`w-full bg-[#D4AF37] text-black font-bold py-4 rounded hover:bg-[#E5C158] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Processing...' : 'Create Property'}
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
