/**
 * Client-side image optimization helpers.
 * - Detects oversized images
 * - Resizes (max dimension) and re-encodes to WebP (or AVIF when supported)
 * - Returns a new File plus a diff report for admin UI feedback
 */

export interface OptimizeOptions {
  maxDimension?: number; // longest edge in px
  quality?: number; // 0..1
  preferAvif?: boolean;
  /** Skip optimization if original is already smaller than this (bytes) */
  skipUnderBytes?: number;
}

export interface OptimizeReport {
  optimized: boolean;
  skipped?: string;
  originalSize: number;
  newSize: number;
  originalDimensions?: { w: number; h: number };
  newDimensions?: { w: number; h: number };
  originalType: string;
  newType: string;
  savedPct: number;
  file: File;
}

const DEFAULTS: Required<OptimizeOptions> = {
  maxDimension: 1920,
  quality: 0.82,
  preferAvif: false,
  skipUnderBytes: 200 * 1024, // <200KB & already web format → skip
};

let _avifSupport: boolean | null = null;
async function supportsAvifEncode(): Promise<boolean> {
  if (_avifSupport !== null) return _avifSupport;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, 'image/avif', 0.5)
    );
    _avifSupport = !!blob && blob.type === 'image/avif';
  } catch {
    _avifSupport = false;
  }
  return _avifSupport;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function optimizeImage(
  file: File,
  opts: OptimizeOptions = {}
): Promise<OptimizeReport> {
  const o = { ...DEFAULTS, ...opts };
  const baseReport: OptimizeReport = {
    optimized: false,
    originalSize: file.size,
    newSize: file.size,
    originalType: file.type,
    newType: file.type,
    savedPct: 0,
    file,
  };

  // Only operate on images we can decode in canvas
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return { ...baseReport, skipped: 'unsupported-format' };
  }

  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  const longest = Math.max(w, h);
  const scale = longest > o.maxDimension ? o.maxDimension / longest : 1;
  const targetW = Math.round(w * scale);
  const targetH = Math.round(h * scale);

  const alreadyWeb =
    file.type === 'image/webp' || file.type === 'image/avif';
  if (alreadyWeb && scale === 1 && file.size < o.skipUnderBytes) {
    return {
      ...baseReport,
      originalDimensions: { w, h },
      newDimensions: { w, h },
      skipped: 'already-optimized',
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { ...baseReport, skipped: 'no-canvas' };
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const useAvif = o.preferAvif && (await supportsAvifEncode());
  const mime = useAvif ? 'image/avif' : 'image/webp';
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, mime, o.quality)
  );
  if (!blob) return { ...baseReport, skipped: 'encode-failed' };

  // Bail out if the "optimized" version is actually larger
  if (blob.size >= file.size && scale === 1) {
    return {
      ...baseReport,
      originalDimensions: { w, h },
      newDimensions: { w, h },
      skipped: 'no-gain',
    };
  }

  const ext = useAvif ? 'avif' : 'webp';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const newFile = new File([blob], `${baseName}.${ext}`, { type: mime });

  return {
    optimized: true,
    originalSize: file.size,
    newSize: newFile.size,
    originalDimensions: { w, h },
    newDimensions: { w: targetW, h: targetH },
    originalType: file.type,
    newType: mime,
    savedPct: Math.round((1 - newFile.size / file.size) * 100),
    file: newFile,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
