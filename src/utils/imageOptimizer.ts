import heic2any from 'heic2any';

/**
 * Compresses and resizes an image file using the browser's Canvas API.
 * @param file The original image file
 * @param maxWidth The maximum width for the image (default 1920px)
 * @param quality The image quality from 0 to 1 (default 0.8)
 * @returns A Promise that resolves to the compressed File
 */
export const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise(async (resolve, reject) => {
        let imageSource: Blob | File = file;

        // Check if HEIC
        if (file.type.toLowerCase().includes('heic') || file.type.toLowerCase().includes('heif') || file.name.toLowerCase().endsWith('.heic')) {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.9 // High quality for intermediate step
                });
                // heic2any can return Blob or Blob[]
                imageSource = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            } catch (err) {
                console.error('HEIC conversion failed:', err);
                reject(err);
                return;
            }
        }

        const reader = new FileReader();
        reader.readAsDataURL(imageSource);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resume dimensions if needed
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }
                        // Always save as webp
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const newFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
