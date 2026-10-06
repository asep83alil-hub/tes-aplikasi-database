/**
 * Utility for client-side signature image processing:
 * - Load image from File (PNG, JPG, WebP)
 * - Canvas 2D background removal (converting white/light paper background to transparent)
 * - Resolution normalization (crisp vector-like rasterization at 300 DPI scale)
 * - LocalStorage persistence for default signatures
 */

export interface SignatureConfig {
  imageUrl: string;      // Base64 data URL
  scale: number;        // 50 to 150 (%)
  offsetX: number;      // -30 to +30 px
  offsetY: number;      // -20 to +20 px
  removeBackground: boolean;
  isConfirmed: boolean;
  updatedAt?: string;
}

export interface RapotSignatures {
  therapist?: SignatureConfig;
  manager?: SignatureConfig;
  signer3?: SignatureConfig;
}

const STORAGE_KEY_DEFAULT_SIGNATURES = 'pelangi_lazuardi_default_signatures';

/**
 * Remove white/light backgrounds from a canvas by setting alpha of near-white pixels to 0.
 * Preserves the original dark ink smoothly.
 */
export function removeWhiteBackgroundFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number = 215
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Perceived brightness (luminance)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    if (brightness >= threshold) {
      // Pixel is considered paper background - make fully transparent
      data[i + 3] = 0;
    } else if (brightness >= threshold - 30) {
      // Soft antialiased edge falloff
      const factor = (threshold - brightness) / 30;
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
    // Dark ink pixels remain completely opaque and untouched
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Reads a File and outputs a normalized Base64 PNG.
 * Optionally applies background removal.
 */
export async function processSignatureFile(
  file: File, 
  removeBackground: boolean = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung atau rusak.'));
      img.onload = () => {
        // High quality target dimensions
        const maxDimension = 900;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context tidak tersedia.'));
          return;
        }

        // Draw image onto canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        if (removeBackground) {
          removeWhiteBackgroundFromCanvas(ctx, width, height, 220);
        }

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Re-process an existing base64 data URL to toggle background removal on/off.
 */
export async function toggleBackgroundOnDataUrl(
  originalDataUrl: string,
  removeBackground: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Gagal memuat gambar tanda tangan.'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(originalDataUrl);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (removeBackground) {
        removeWhiteBackgroundFromCanvas(ctx, canvas.width, canvas.height, 220);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = originalDataUrl;
  });
}

/**
 * Retrieve saved default signatures from localStorage
 */
export function getSavedDefaultSignatures(): RapotSignatures {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEFAULT_SIGNATURES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading default signatures:', e);
    return {};
  }
}

/**
 * Save default signatures to localStorage
 */
export function saveDefaultSignatures(signatures: RapotSignatures): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEFAULT_SIGNATURES, JSON.stringify(signatures));
  } catch (e) {
    console.error('Error saving default signatures:', e);
  }
}
