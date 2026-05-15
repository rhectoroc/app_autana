import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Optimize sharp for limited memory environments
sharp.cache(false);
sharp.concurrency(1);

interface ProcessedImage {
    filename: string;
    // We no longer return a buffer, we write directly to disk
}

export const processImage = async (inputPath: string, originalName: string, index: number = 0, propertyId: string | number = 'anon'): Promise<ProcessedImage> => {
    // Generate new filename with propertyId and timestamp
    const date = new Date();
    const timestamp = date.getTime();
    const suffix = index > 0 ? String(index).padStart(2, '0') : Math.random().toString(36).substring(2, 6);
    const newFilename = `prop_${propertyId}_${timestamp}_${suffix}.webp`;
    const outputPath = path.join(process.cwd(), 'uploads', newFilename);

    // Path to watermark
    const watermarkPath = path.join(process.cwd(), 'public', 'logo', 'autana_watermark.png');

    try {
        // Get metadata to calculate proportional watermark size
        const metadata = await sharp(inputPath).metadata();
        const width = metadata.width || 1920;
        
        let pipeline = sharp(inputPath)
            .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85, effort: 6 });

        // Check if watermark exists before attempting to composite
        if (fs.existsSync(watermarkPath)) {
            try {
                // Resize watermark to be ~20% of the main image width and add transparency
                const watermarkWidth = Math.round(width * 0.2);
                const resizedWatermark = await sharp(watermarkPath)
                    .resize({ width: watermarkWidth })
                    .composite([{
                        input: Buffer.from([255, 255, 255, 178]), // ~70% opacity white mask (255 * 0.7 = 178)
                        raw: { width: 1, height: 1, channels: 4 },
                        tile: true,
                        blend: 'dest-in'
                    }])
                    .toBuffer();

                pipeline = pipeline.composite([
                    {
                        input: resizedWatermark,
                        gravity: 'southeast',
                        blend: 'over',
                    }
                ]);
            } catch (error) {
                console.warn('Failed to process watermark image:', error);
            }
        }

        // Write directly to file (Stream) to avoid buffering in RAM
        await pipeline.toFile(outputPath);

        // Try to delete the input file (temp file)
        try {
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        } catch (delError) {
            console.error('Failed to delete temp file:', delError);
        }

        return {
            filename: newFilename
        };
    } catch (error) {
        console.error('CRITICAL ERROR processing image:', error);

        // Fallback: If processing fails, we must keep the original. 
        // But the original is 'temp-...' and might be HEIC.
        // We should rename it to be a permanent file (removing temp- prefix if we want, or keeping unique).
        // And we just return that filename.

        // However, if the original is HEIC, browsers won't show it. 
        // But better to have a broken image than a crashed server.

        // Let's rename the temp file to a "final" name so it isn't treated as garbage.
        const fallbackName = `fallback-${Date.now()}-${path.basename(originalName)}`;
        const fallbackPath = path.join(process.cwd(), 'uploads', fallbackName);

        try {
            fs.renameSync(inputPath, fallbackPath);
            return { filename: fallbackName };
        } catch (renameError) {
            console.error('Failed to rename fallback file:', renameError);
            // Worst case, return the temp name if we couldn't rename (unlikely)
            // But we need to make sure we strip the directory from the return if it's just filename.
            return { filename: path.basename(inputPath) };
        }
    }
};
