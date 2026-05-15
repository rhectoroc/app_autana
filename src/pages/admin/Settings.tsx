import { useState, useEffect } from 'react';
import { Folder, File, HardDrive, Search, ChevronRight, ChevronDown, Package, ExternalLink, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface StorageFile {
    name: string;
    size: number;
    createdAt: string;
}

interface StorageFolder {
    name: string;
    fileCount: number;
    size: number;
    files: StorageFile[];
}

interface StorageStats {
    totalSize: number;
    folders: StorageFolder[];
    rootFiles: StorageFile[];
}

export const Settings = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'explorer'>('explorer');
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Modal states
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const { showToast } = useToast();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/explorer/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch storage stats', err);
            showToast('Failed to load explorer data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'explorer') {
            fetchStats();
        }
    }, [activeTab]);

    const toggleFolder = (folderName: string) => {
        const next = new Set(expandedFolders);
        if (next.has(folderName)) next.delete(folderName);
        else next.add(folderName);
        setExpandedFolders(next);
    };

    const handleDeleteFile = (folder: string | null, filename: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete File',
            message: `Are you sure you want to delete ${filename}? This action cannot be undone.`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.post('/explorer/delete-file', { folder, filename });
                    showToast('File deleted successfully', 'success');
                    fetchStats();
                } catch (err) {
                    showToast('Failed to delete file', 'error');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDeleteFolder = (folder: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Property Folder',
            message: `WARNING: This will delete the entire folder "${folder}" and ALL its content. This might break image links if the property still exists. Proceed?`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.post('/explorer/delete-folder', { folder });
                    showToast('Folder deleted successfully', 'success');
                    fetchStats();
                } catch (err) {
                    showToast('Failed to delete folder', 'error');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileUrl = (folder: string | null, filename: string) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return folder 
            ? `${baseUrl}/uploads/${folder}/${filename}`
            : `${baseUrl}/uploads/${filename}`;
    };

    const filteredFolders = stats?.folders.filter((f: StorageFolder) => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.files.some((file: StorageFile) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-serif text-[#D4AF37] mb-2">System Settings</h1>
                    <p className="text-gray-400">Manage your platform infrastructure and media assets</p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('explorer')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Media Explorer
                    </button>
                </div>

                {activeTab === 'general' ? (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-[#D4AF37]/50 mx-auto mb-6" />
                        <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">General Settings</h2>
                        <p className="text-gray-400 max-w-md mx-auto">Platform-wide configurations such as API keys, translation preferences, and branding are coming soon.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <HardDrive className="text-[#D4AF37] w-8 h-8" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Usage</span>
                                </div>
                                <div className="text-3xl font-serif text-white">{stats ? formatSize(stats.totalSize) : '0 MB'}</div>
                                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="bg-[#D4AF37] h-full w-[15%] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.2)]"></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <Folder className="text-[#D4AF37] w-8 h-8" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Properties</span>
                                </div>
                                <div className="text-3xl font-serif text-white">{stats?.folders.length || 0}</div>
                                <p className="text-xs text-gray-500 mt-2">Active media directories</p>
                            </div>

                            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <Package className="text-[#D4AF37] w-8 h-8" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Assets</span>
                                </div>
                                <div className="text-3xl font-serif text-white">
                                    {(stats?.folders.reduce((acc: number, f: StorageFolder) => acc + f.fileCount, 0) || 0) + (stats?.rootFiles.length || 0)}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Images and videos combined</p>
                            </div>
                        </div>

                        {/* Search and Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search property folders or files..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-all"
                                />
                            </div>
                            <button 
                                onClick={fetchStats}
                                className="px-4 py-2 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors flex items-center"
                            >
                                Refresh Data
                            </button>
                        </div>

                        {/* File Tree */}
                        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                                <h3 className="text-lg font-serif text-[#D4AF37]">Media Directory (/uploads)</h3>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Storage Structure: Virtual vs Physical</span>
                            </div>

                            <div className="p-2 md:p-6 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-white/10 rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-500 animate-pulse">Scanning volumes...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Property Folders */}
                                        {filteredFolders.map((folder) => (
                                            <div key={folder.name} className="group">
                                                <div className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-all">
                                                    <div 
                                                        onClick={() => toggleFolder(folder.name)}
                                                        className="flex items-center flex-1 min-w-0 cursor-pointer"
                                                    >
                                                        {expandedFolders.has(folder.name) ? <ChevronDown className="w-4 h-4 mr-3 text-gray-500" /> : <ChevronRight className="w-4 h-4 mr-3 text-gray-500" />}
                                                        <Folder className={`w-5 h-5 mr-3 ${expandedFolders.has(folder.name) ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm truncate">{folder.name}</span>
                                                                <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 rounded font-bold">{folder.fileCount} items</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono pr-4">{formatSize(folder.size)}</div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.name); }}
                                                        className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete entire folder"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {expandedFolders.has(folder.name) && (
                                                    <div className="ml-12 mt-1 space-y-1 pb-4 animate-in slide-in-from-top-2 duration-300">
                                                        {folder.files.map((file) => (
                                                            <div key={file.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group/file">
                                                                <div 
                                                                    className="flex items-center flex-1 min-w-0 cursor-pointer"
                                                                    onClick={() => setPreviewUrl(getFileUrl(folder.name, file.name))}
                                                                >
                                                                    <File className="w-4 h-4 mr-3 text-gray-600" />
                                                                    <span className="text-xs text-gray-400 truncate pr-4">{file.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[10px] text-gray-600 font-mono">{formatSize(file.size)}</span>
                                                                    <div className="flex items-center opacity-0 group-hover/file:opacity-100 transition-all">
                                                                        <button 
                                                                            onClick={() => setPreviewUrl(getFileUrl(folder.name, file.name))}
                                                                            className="p-1.5 text-gray-500 hover:text-[#D4AF37]"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDeleteFile(folder.name, file.name)}
                                                                            className="p-1.5 text-gray-500 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Root Files (Legacy) */}
                                        {stats?.rootFiles.length! > 0 && (
                                            <div className="mt-8">
                                                <div className="px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b border-white/5 mb-4 flex items-center gap-2">
                                                    <Package className="w-3 h-3" />
                                                    Legacy / Global Assets
                                                </div>
                                                <div className="space-y-1">
                                                    {stats?.rootFiles.map((file) => (
                                                        <div key={file.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group/file">
                                                            <div 
                                                                className="flex items-center flex-1 min-w-0 cursor-pointer"
                                                                onClick={() => setPreviewUrl(getFileUrl(null, file.name))}
                                                            >
                                                                <File className="w-4 h-4 mr-3 text-[#D4AF37]/50" />
                                                                <span className="text-xs text-gray-400 truncate pr-4">{file.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] text-gray-600 font-mono">{formatSize(file.size)}</span>
                                                                <div className="flex items-center opacity-0 group-hover/file:opacity-100 transition-all">
                                                                    <button 
                                                                        onClick={() => setPreviewUrl(getFileUrl(null, file.name))}
                                                                        className="p-1.5 text-gray-500 hover:text-[#D4AF37]"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteFile(null, file.name)}
                                                                        className="p-1.5 text-gray-500 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(!loading && filteredFolders.length === 0 && stats?.rootFiles.length === 0) && (
                                            <div className="py-20 text-center text-gray-500 italic">No media assets found in storage.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-6 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20">
                            <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-[#D4AF37] mb-1">Architecture Note</h4>
                                <p className="text-xs text-[#D4AF37]/70 leading-relaxed">
                                    Autana Group now uses a hierarchical storage system. Every property has its own physical directory based on its unique ID. 
                                    This ensures better data isolation, faster backups, and simpler media cleanup during property deletion.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}></div>
                    <div className="relative z-10 max-w-5xl w-full max-h-full bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-mono truncate mr-4">{previewUrl.split('/').pop()}</span>
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/50">
                            {previewUrl.toLowerCase().endsWith('.webm') || previewUrl.toLowerCase().endsWith('.mp4') ? (
                                <video src={previewUrl} controls autoPlay className="max-w-full max-h-full" />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            )}
                        </div>
                        <div className="p-4 bg-white/5 flex justify-center">
                            <button 
                                onClick={() => setPreviewUrl(null)}
                                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmText="Delete Permanently"
            />
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.3);
                }
            `}</style>
        </div>
    );
};

const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);
