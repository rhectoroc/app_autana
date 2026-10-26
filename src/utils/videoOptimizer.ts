/**
 * Client-Side Video Compressor & Optimizer using HTML5 Canvas & MediaRecorder API.
 * Compresses videos down to web-friendly sizes (720p, 30fps, ~2Mbps, no audio).
 * Takes large 300MB+ mobile camera videos and shrinks them to ~5MB - 12MB in the browser.
 */

export interface CompressionProgress {
    percent: number;
    currentSeconds: number;
    totalSeconds: number;
}

export const compressVideo = async (
    file: File,
    onProgress?: (progress: CompressionProgress) => void
): Promise<File> => {
    // If file is already tiny (less than 6MB) and is MP4 or WebM, no need to re-encode
    if (file.size <= 6 * 1024 * 1024 && (file.type === 'video/mp4' || file.type === 'video/webm')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        video.onerror = (e) => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Cannot load video file for compression: ' + e));
        };

        video.onloadedmetadata = async () => {
            try {
                const duration = video.duration;
                if (!duration || isNaN(duration)) {
                    URL.revokeObjectURL(objectUrl);
                    // Fallback to original if duration is invalid
                    resolve(file);
                    return;
                }

                // Compute optimal target dimensions (Max 1280x720 for cards/web autoplay)
                const origWidth = video.videoWidth || 1280;
                const origHeight = video.videoHeight || 720;
                const maxDim = 1280;

                let targetWidth = origWidth;
                let targetHeight = origHeight;

                if (origWidth >= origHeight && origWidth > maxDim) {
                    targetWidth = maxDim;
                    targetHeight = Math.round((origHeight * maxDim) / origWidth);
                } else if (origHeight > origWidth && origHeight > maxDim) {
                    targetHeight = maxDim;
                    targetWidth = Math.round((origWidth * maxDim) / origHeight);
                }

                // Width and Height must be even numbers for video codecs
                targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
                targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d', { alpha: false });

                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    resolve(file);
                    return;
                }

                // Choose best supported container in browser
                const mimeTypes = [
                    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                    'video/mp4',
                    'video/webm;codecs=vp9',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];

                const selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
                const isMp4 = selectedMime.includes('mp4');

                // Capture canvas stream at 30 fps
                const stream = canvas.captureStream(30);

                // Target video bitrate: 1.8 Mbps (produces ~13MB per minute of crisp HD video)
                const videoBitsPerSecond = 1800000;

                const recorder = new MediaRecorder(stream, {
                    mimeType: selectedMime,
                    videoBitsPerSecond
                });

                const chunks: Blob[] = [];
                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    URL.revokeObjectURL(objectUrl);
                    // Normalize clean MIME type (without parameters like ;codecs=...)
                    const cleanMime = isMp4 ? 'video/mp4' : 'video/webm';
                    const blob = new Blob(chunks, { type: cleanMime });
                    const extension = isMp4 ? '.mp4' : '.webm';
                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                    const compressedFile = new File([blob], `${baseName}_compressed${extension}`, {
                        type: cleanMime,
                        lastModified: Date.now()
                    });

                    console.log(`[VideoCompressor] Original: ${(file.size / (1024 * 1024)).toFixed(1)}MB -> Compressed: ${(compressedFile.size / (1024 * 1024)).toFixed(1)}MB, MIME: ${cleanMime}`);
                    resolve(compressedFile);
                };

                recorder.start(100); // 100ms chunks

                // Draw frames loop
                video.currentTime = 0;
                await video.play();

                const renderLoop = () => {
                    if (video.paused || video.ended) {
                        if (recorder.state === 'recording') {
                            recorder.stop();
                        }
                        return;
                    }

                    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

                    if (onProgress) {
                        const percent = Math.min(99, Math.round((video.currentTime / duration) * 100));
                        onProgress({
                            percent,
                            currentSeconds: video.currentTime,
                            totalSeconds: duration
                        });
                    }

                    requestAnimationFrame(renderLoop);
                };

                renderLoop();

                video.onended = () => {
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                };
            } catch (err) {
                console.error('[VideoCompressor] Compression error:', err);
                URL.revokeObjectURL(objectUrl);
                // Fallback to original file
                resolve(file);
            }
        };
    });
};
