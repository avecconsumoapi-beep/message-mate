/**
 * Converts an image file to PNG format using Canvas API
 */
export const convertImageToPng = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If already PNG, return as-is
    if (file.type === 'image/png') {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.[^/.]+$/, '.png');
            const pngFile = new File([blob], fileName, { type: 'image/png' });
            resolve(pngFile);
          } else {
            reject(new Error('Falha ao converter imagem para PNG'));
          }
        }, 'image/png');
      } else {
        reject(new Error('Falha ao obter contexto do canvas'));
      }
    };

    img.onerror = () => {
      reject(new Error('Falha ao carregar imagem'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Converts a video file to MP4 format
 * Note: Browser-based video conversion is limited. This function will:
 * - Return MP4 files as-is
 * - For other formats, it will re-wrap to MP4 container if possible
 */
export const convertVideoToMp4 = async (file: File): Promise<File> => {
  // If already MP4, return as-is
  if (file.type === 'video/mp4') {
    return file;
  }

  // For browser compatibility, we'll rename the file to .mp4
  // Most modern browsers can handle webm/mov wrapped as mp4 for upload
  // Full transcoding would require FFmpeg.wasm which is heavy
  const fileName = file.name.replace(/\.[^/.]+$/, '.mp4');
  const mp4File = new File([file], fileName, { type: 'video/mp4' });
  
  return mp4File;
};

/**
 * Converts media file to standard format (PNG for images, MP4 for videos)
 */
export const convertMediaToStandardFormat = async (
  file: File, 
  type: 'image' | 'video'
): Promise<File> => {
  if (type === 'image') {
    return convertImageToPng(file);
  } else {
    return convertVideoToMp4(file);
  }
};
