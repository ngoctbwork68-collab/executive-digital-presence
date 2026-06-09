import { ImgHTMLAttributes, useState, useMemo } from 'react';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  /** Target render width in CSS px; used to request a smaller transformed image */
  width?: number;
  height?: number;
  /** Set true only for above-the-fold LCP images */
  priority?: boolean;
  quality?: number;
}

/**
 * Drop-in replacement for <img> that:
 *  - lazy-loads by default (loading="lazy", decoding="async")
 *  - async-decodes to keep the main thread responsive
 *  - reserves space via width/height when provided (reduces CLS)
 *  - rewrites Supabase Storage URLs to the on-the-fly image transform
 *    endpoint (WebP, resized) when a width is given, with graceful fallback
 *    to the original URL if transforms aren't enabled on the project.
 */
const SUPABASE_OBJECT_RE = /\/storage\/v1\/object\/public\//;

function toTransformedUrl(src: string, width?: number, quality = 75) {
  if (!width) return src;
  if (!SUPABASE_OBJECT_RE.test(src)) return src;
  try {
    const url = new URL(src);
    url.pathname = url.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    url.searchParams.set('width', String(Math.round(width * 2))); // 2x for retina
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('resize', 'contain');
    return url.toString();
  } catch {
    return src;
  }
}

const SmartImage = ({
  src,
  alt,
  width,
  height,
  priority,
  quality,
  loading,
  decoding,
  fetchPriority,
  ...rest
}: SmartImageProps) => {
  const originalSrc = src || '';
  const [currentSrc, setCurrentSrc] = useState(() =>
    toTransformedUrl(originalSrc, width, quality)
  );

  // Re-compute when src changes
  useMemo(() => {
    setCurrentSrc(toTransformedUrl(originalSrc, width, quality));
  }, [originalSrc, width, quality]);

  if (!originalSrc) return null;

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      decoding={decoding ?? 'async'}
      fetchPriority={fetchPriority ?? (priority ? 'high' : 'auto')}
      onError={(e) => {
        // Fall back to the original (untransformed) URL if the render endpoint
        // isn't available (e.g. image transforms disabled on the project).
        if (currentSrc !== originalSrc) {
          setCurrentSrc(originalSrc);
        }
        rest.onError?.(e);
      }}
    />
  );
};

export default SmartImage;
