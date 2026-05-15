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

export const processVideo = async (inputPath: string): Promise<string> => {
    const filename = `video-${Date.now()}.webm`;
    const outputPath = path.join(process.cwd(), 'uploads', filename);

    const available = await isFFmpegAvailable();

    if (!available) {
        console.warn('FFmpeg not found. Skipping video conversion, just renaming.');
        const fallbackFilename = `video-${Date.now()}${path.extname(inputPath)}`;
        const fallbackPath = path.join(process.cwd(), 'uploads', fallbackFilename);
        fs.renameSync(inputPath, fallbackPath);
        return fallbackFilename;
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('webm')
            .videoCodec('libvpx-vp9')
            .addOptions(['-crf 30', '-b:v 0']) // Constant Quality mode for VP9
            .audioCodec('libopus')
            .on('end', () => {
                // Delete original temp file
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                resolve(filename);
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                // Fallback to original if conversion fails
                const fallbackFilename = `video-err-${Date.now()}${path.extname(inputPath)}`;
                const fallbackPath = path.join(process.cwd(), 'uploads', fallbackFilename);
                fs.renameSync(inputPath, fallbackPath);
                resolve(fallbackFilename);
            })
            .save(outputPath);
    });
};
