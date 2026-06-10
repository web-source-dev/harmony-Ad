const MAX_IMAGE_DIMENSION = 1920;
const COMPRESS_IF_LARGER_THAN = 500 * 1024;
const SAFE_UPLOAD_BYTES = 900 * 1024;

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function compressImageIfNeeded(file) {
  if (!file?.type?.startsWith('image/')) {
    return file;
  }

  if (file.size <= COMPRESS_IF_LARGER_THAN) {
    return file;
  }

  try {
    let compressed = await compressImage(file, MAX_IMAGE_DIMENSION, 0.82);

    if (compressed.size > SAFE_UPLOAD_BYTES) {
      compressed = await compressImage(file, 1280, 0.72);
    }

    if (compressed.size > SAFE_UPLOAD_BYTES) {
      compressed = await compressImage(file, 960, 0.6);
    }

    return compressed.size < file.size ? compressed : file;
  } catch (error) {
    console.warn('Image compression failed, uploading original file:', error);
    return file;
  }
}

function compressImage(file, maxDimension, quality) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = image;
      const scale = Math.min(1, maxDimension / Math.max(width, height));

      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas is not supported'));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, '');
          resolve(
            new File([blob], `${baseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
          );
        },
        'image/jpeg',
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    image.src = objectUrl;
  });
}
