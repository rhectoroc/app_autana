import { useState, useRef } from 'react';
import { Download, UploadCloud, Database, AlertTriangle, CheckCircle2, RefreshCw, FileArchive, ArrowDownToLine } from 'lucide-react';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export const BackupsTab = () => {
    const [downloading, setDownloading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [restoreResult, setRestoreResult] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confirm restore modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const { showToast } = useToast();

    // Trigger backup download
    const handleDownloadBackup = async () => {
        try {
            setDownloading(true);
            const response = await api.get('/backup/export', {
                responseType: 'blob'
            });

            // Extract filename from header or construct fallback
            const contentDisposition = response.headers['content-disposition'];
            let filename = `backup_autana_${new Date().toISOString().replace(/[:.]/g, '-')}.sql.gz`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast('Backup downloaded successfully (.sql.gz)', 'success');
        } catch (err: any) {
            console.error('Download error:', err);
            showToast('Failed to generate database backup', 'error');
        } finally {
            setDownloading(false);
        }
    };

    // Trigger restore confirmation
    const handleRestoreClick = () => {
        if (!selectedFile) {
            showToast('Please select a backup file first', 'error');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Restore Database',
            message: `CRITICAL ACTION: Restoring "${selectedFile.name}" will completely replace and synchronize the current database tables with the contents of this backup file. All current records will be updated/truncated. Do you wish to proceed?`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                executeRestore();
            }
        });
    };

    // Execute restore upload
    const executeRestore = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploading(true);
            setRestoreResult(null);
            const res = await api.post('/backup/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setRestoreResult(res.data);
            showToast('Database restored successfully!', 'success');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            console.error('Restore error:', err);
            showToast(err.response?.data?.message || err.response?.data?.error || 'Failed to restore database', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Download Backup Card */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37] shrink-0">
                            <ArrowDownToLine className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-white">Export Database Backup</h2>
                            <p className="text-gray-400 text-sm mt-1 max-w-xl">
                                Downloads a compressed <code className="text-[#D4AF37] bg-black/40 px-2 py-0.5 rounded text-xs font-mono">.sql.gz</code> archive 
                                containing all properties, users, media relations and booking records stamped with the current date and time.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadBackup}
                        disabled={downloading}
                        className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#E5C158] transition-all shadow-lg shadow-[#D4AF37]/10 shrink-0 disabled:opacity-50"
                    >
                        {downloading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Compressing & Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download Backup (.gz)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Restore Backup Card */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
                        <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif text-white">Restore Database</h2>
                        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                            Upload a previously generated <code className="text-[#D4AF37] bg-black/40 px-2 py-0.5 rounded text-xs font-mono">.sql.gz</code> or <code className="text-gray-300 bg-black/40 px-2 py-0.5 rounded text-xs font-mono">.sql</code> dump 
                            to restore the system state. The restoration runs inside an isolated SQL transaction.
                        </p>
                    </div>
                </div>

                {/* Upload Box */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-[#D4AF37] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/[0.02]"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gz,.sql,.sql.gz"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    <FileArchive className="w-12 h-12 text-[#D4AF37] mx-auto mb-3 opacity-80" />
                    {selectedFile ? (
                        <div className="space-y-1">
                            <p className="text-white font-medium text-base">{selectedFile.name}</p>
                            <p className="text-xs text-[#D4AF37]">{(selectedFile.size / 1024).toFixed(1)} KB — Ready to restore</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-white font-medium">Click to browse or drag your .gz backup file here</p>
                            <p className="text-xs text-gray-500">Supports .sql.gz, .gz and uncompressed .sql dumps</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Always download a fresh backup before restoring to preserve current data.</span>
                    </div>

                    <button
                        onClick={handleRestoreClick}
                        disabled={!selectedFile || uploading}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Restoring Database...
                            </>
                        ) : (
                            <>
                                <Database className="w-4 h-4" />
                                Execute Restoration
                            </>
                        )}
                    </button>
                </div>

                {/* Restore Result Card */}
                {restoreResult && (
                    <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in fade-in">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <h4 className="font-semibold text-white">{restoreResult.message}</h4>
                        </div>
                        {restoreResult.stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-400 block">Properties</span>
                                    <span className="text-lg font-bold text-white">{restoreResult.stats.properties}</span>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-400 block">Images</span>
                                    <span className="text-lg font-bold text-white">{restoreResult.stats.images}</span>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-400 block">Users</span>
                                    <span className="text-lg font-bold text-white">{restoreResult.stats.users}</span>
                                </div>
                                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-400 block">Bookings</span>
                                    <span className="text-lg font-bold text-white">{restoreResult.stats.bookings}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Restore Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={true}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
