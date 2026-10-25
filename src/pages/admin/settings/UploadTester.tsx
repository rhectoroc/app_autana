import { useState, useRef } from 'react';
import { Activity, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const UploadTester = () => {
    const [testing, setTesting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState<string>('');
    const [result, setResult] = useState<any | null>(null);
    const [errorDetails, setErrorDetails] = useState<any | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setTesting(true);
        setProgress(0);
        setResult(null);
        setErrorDetails(null);
        setStatusMsg(`Starting upload test for "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`);

        const data = new FormData();
        data.append('file', file);

        const startTime = Date.now();

        try {
            const res = await api.post('/diagnostic/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
                        const loadedMb = (progressEvent.loaded / (1024 * 1024)).toFixed(1);
                        const totalMb = (progressEvent.total / (1024 * 1024)).toFixed(1);
                        setStatusMsg(`Transmitting to server: ${loadedMb} MB / ${totalMb} MB (${percent}%) — ${elapsedSec}s elapsed`);
                    }
                }
            });

            setResult(res.data);
            showToast('Server received and validated file successfully!', 'success');
        } catch (err: any) {
            console.error('Diagnostic upload failed:', err);
            const status = err.response?.status;
            const data = err.response?.data;
            const msg = data?.error || data?.message || err.message;

            setErrorDetails({
                httpStatus: status || 'Network Error / Proxy Cut',
                serverMessage: msg,
                details: err.code || 'TIMEOUT_OR_CLIENT_MAX_BODY'
            });

            showToast(`Upload Failed (${status || 'Network'}): ${msg}`, 'error');
        } finally {
            setTesting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-serif text-white flex items-center gap-2">
                            Server Upload Pipeline Diagnostics
                            <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold">1GB TESTER</span>
                        </h3>
                        <p className="text-xs text-gray-400">Test uploading large videos directly to reveal HTTP status, proxy timeouts or body limit rejections in real time.</p>
                    </div>
                </div>

                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={testing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-xl hover:bg-[#E5C158] transition-all shadow-lg shadow-[#D4AF37]/10 text-xs disabled:opacity-50 shrink-0"
                >
                    {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {testing ? 'Testing...' : 'Test Large Video File'}
                </button>
                <input ref={fileRef} type="file" onChange={handleFileSelect} className="hidden" />
            </div>

            {/* Progress bar */}
            {testing && (
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-[#D4AF37] font-medium">{statusMsg}</span>
                        <span className="text-white font-mono font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5">
                        <div 
                            className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Result Box */}
            {result && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-semibold text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Server Upload Test Passed! (100% processed)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-300 font-mono text-[11px] pt-1">
                        <div>Size: <span className="text-white font-bold">{result.sizeMb}</span></div>
                        <div>Duration: <span className="text-white font-bold">{result.durationMs}ms</span></div>
                        <div>Speed: <span className="text-[#D4AF37] font-bold">{result.speedMbps} Mbps</span></div>
                        <div>Server: <span className="text-emerald-400 font-bold">ACK OK (200)</span></div>
                    </div>
                </div>
            )}

            {/* Error Box */}
            {errorDetails && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-semibold text-white">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>Upload Pipeline Rejected: {errorDetails.httpStatus}</span>
                    </div>
                    <p className="text-gray-300 text-[11px]">Reason: <span className="text-red-300 font-mono">{errorDetails.serverMessage}</span></p>
                    {errorDetails.httpStatus === 413 && (
                        <p className="text-[#D4AF37] text-[11px] pt-1">
                            Tip: Error 413 indicates the Nginx/Traefik reverse proxy in Easypanel is rejecting files larger than client_max_body_size.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
