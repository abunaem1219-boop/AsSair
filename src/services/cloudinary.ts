/**
 * Cloudinary Media Upload Service for As Sair
 * Configured with unsigned upload preset.
 * Never expose Cloudinary API secrets in client code.
 */

export const CLOUDINARY_CLOUD_NAME = "dinbje135";
export const CLOUDINARY_UPLOAD_PRESET = "As_sair";

export interface MediaUploadResult {
  url: string;
  publicId?: string;
  resourceType: 'image' | 'video';
  type: 'image' | 'video';
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  uploaderUid?: string;
  createdAt: number;
}

/**
 * Compresses an image in the browser before upload to save bandwidth and improve mobile performance.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file; // Return as-is if video or gif
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Uploads media to Cloudinary via unsigned upload preset.
 * Strictly avoids storing large base64 data in Firebase.
 */
export async function uploadMediaToCloudinary(
  file: File,
  uploaderUid?: string,
  customCloudName?: string,
  customPreset?: string
): Promise<MediaUploadResult> {
  const cloudName = customCloudName || localStorage.getItem('as_sair_cloud_name') || CLOUDINARY_CLOUD_NAME;
  const uploadPreset = customPreset || localStorage.getItem('as_sair_upload_preset') || CLOUDINARY_UPLOAD_PRESET;
  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  // Compress image before upload
  let uploadBlob: Blob = file;
  if (!isVideo) {
    try {
      uploadBlob = await compressImage(file);
    } catch (err) {
      console.warn('Image compression skipped due to error:', err);
      uploadBlob = file;
    }
  }

  const formData = new FormData();
  formData.append('file', uploadBlob, file.name);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'as-sair');
  formData.append('tags', 'as-sair,community');

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Cloudinary upload failed with HTTP status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    resourceType,
    type: resourceType,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes || file.size,
    uploaderUid,
    createdAt: Date.now(),
  };
}

/**
 * Generates an optimized Cloudinary thumbnail URL for gallery and feed preview.
 */
export function getOptimizedMediaUrl(url: string, width = 500): string {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  // Inject transformation
  return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto,f_auto/`);
}
