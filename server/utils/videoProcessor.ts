import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Checks if FFmpeg is available on the system
 */
const isFFmpegAvailable = (): Promise<boolean> => {
    return new Promise((resolve) => {
        ffmpeg.getAvailableFormats((err) => {
            if (err) resolve(false);
            else resolve(true);
        });
    });
};

export const processVideo = async (inputPath: string, propertyId: string | number = 'anon'): Promise<string> => {
    const filename = `video-${Date.now()}.mp4`;
    const propertyDirName = `prop_${propertyId}`;
    const propertyDirPath = path.join(process.cwd(), 'uploads', propertyDirName);

    console.log(`[VideoProcessor] Starting video processing for property ${propertyId}. Input: ${inputPath}`);

    if (!fs.existsSync(propertyDirPath)) {
        fs.mkdirSync(propertyDirPath, { recursive: true });
    }

    const outputPath = path.join(propertyDirPath, filename);
    const relativePath = `${propertyDirName}/${filename}`;

    const available = await isFFmpegAvailable();

    if (!available) {
        console.warn('[VideoProcessor] FFmpeg not found on system. Falling back to simple rename.');
        const fallbackFilename = `video-${Date.now()}${path.extname(inputPath)}`;
        const fallbackPath = path.join(propertyDirPath, fallbackFilename);
        const fallbackRelativePath = `${propertyDirName}/${fallbackFilename}`;
        fs.renameSync(inputPath, fallbackPath);
        return fallbackRelativePath;
    }

    console.log(`[VideoProcessor] Running FFmpeg (no audio, H.264 fast preset, web-optimized MP4) -> ${outputPath}`);

    const watermarkPath = path.join(process.cwd(), 'public', 'logo', 'autana_watermark.png');
    const hasWatermark = fs.existsSync(watermarkPath);

    return new Promise((resolve) => {
        let command = ffmpeg(inputPath);

        if (hasWatermark) {
            // Overlay watermark in bottom-right corner with 20% width and transparency
            command = command
                .input(watermarkPath)
                .complexFilter([
                    '[1:v]scale=iw*0.22:-1,format=rgba,colorchannelmixer=aa=0.75[wm]',
                    '[0:v][wm]overlay=W-w-15:H-h-15'
                ]);
        }

        command
            .toFormat('mp4')
            .videoCodec('libx264')
            .noAudio() // Strip all audio for silent autoplay
            .addOptions([
                '-preset ultrafast', // Fast compression to avoid VPS timeout
                '-crf 28',           // Efficient web compression
                '-movflags +faststart', // Starts playing immediately in browser without full download
                '-pix_fmt yuv420p'   // Universal browser compatibility (Safari, Chrome, iOS)
            ])
            .on('start', (commandLine) => {
                console.log(`[VideoProcessor] FFmpeg started with command: ${commandLine}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`[VideoProcessor] FFmpeg Progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`[VideoProcessor] FFmpeg successfully converted video -> ${relativePath}`);
                // Delete original temp file
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                } catch (delErr) {
                    console.error('[VideoProcessor] Could not delete temp video file:', delErr);
                }
                resolve(relativePath);
            })
            .on('error', (err) => {
                console.error('[VideoProcessor] FFmpeg conversion error:', err);
                // Fallback to original if conversion fails
                const fallbackFilename = `video-err-${Date.now()}${path.extname(inputPath)}`;
                const fallbackPath = path.join(propertyDirPath, fallbackFilename);
                const fallbackRelativePath = `${propertyDirName}/${fallbackFilename}`;
                try {
                    fs.renameSync(inputPath, fallbackPath);
                } catch (renameErr) {
                    console.error('[VideoProcessor] Fallback rename failed:', renameErr);
                }
                resolve(fallbackRelativePath);
            })
            .save(outputPath);
    });
};
