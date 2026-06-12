import { useEffect, useRef } from 'react';

interface RichContentProps {
  html: string | null | undefined;
  className?: string;
  id?: string;
}

/**
 * Sanitizes & renders rich HTML content from the TipTap editor.
 * - If the value is plain text containing escaped/literal HTML markup
 *   (e.g. "<p>Hello</p>" stored as text), render it as text wrapped in <p>
 * - If it's real HTML, render it via dangerouslySetInnerHTML
 * - Strips leftover Facebook/markdown rubbish (![alt], [text](url) image refs,
 *   "No photo description available", emoji-only image alts, etc.)
 * - Replaces broken <img> with a styled placeholder (no ugly alt text)
 */

const looksLikeHtml = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const stripRubbish = (s: string) =>
  s
    // Markdown image refs left over from copy-paste
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Bare alt-text leftovers like "![No photo description available.]"
    .replace(/!\[[^\]]*\]/g, '')
    // Common Facebook fallback strings
    .replace(/No photo description available\.?/gi, '')
    .replace(/May be an image of[^.<]*\.?/gi, '')
    // Empty paragraphs / brs left behind
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '');

const RichContent = ({ html, className, id }: RichContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const raw = (html ?? '').trim();
  let processed = raw;

  if (raw && !looksLikeHtml(raw)) {
    // Plain text, possibly with literal "<p>...</p>" — escape so the tags show as text? No.
    // The user wants tags to NOT show. So strip them and present as text.
    const stripped = raw
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .replace(/&nbsp;/g, ' ');
    processed = `<p>${escapeHtml(stripped).replace(/\n/g, '<br/>')}</p>`;
  }

  processed = stripRubbish(processed);

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;

    const imgs = container.querySelectorAll('img');
    imgs.forEach((img) => {
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';

      // Reserve space to avoid layout shift / "broken ratio" feel
      if (!img.style.aspectRatio && !img.getAttribute('width')) {
        img.style.aspectRatio = '16 / 9';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'cover';
        img.style.background = 'hsl(var(--muted))';
        img.style.borderRadius = '1rem';
      }

      const originalSrc = img.getAttribute('src') || '';
      const isExternal =
        /^https?:\/\//i.test(originalSrc) &&
        !/supabase\.co\//i.test(originalSrc) &&
        !/wsrv\.nl\//i.test(originalSrc) &&
        !/^data:/i.test(originalSrc);
      if (isExternal) {
        // Proxy + normalize: WebP, max width 1600, on error try original
        const proxied = `https://wsrv.nl/?url=${encodeURIComponent(originalSrc)}&output=webp&w=1600&we`;
        img.setAttribute('data-original-src', originalSrc);
        img.src = proxied;
      }

      // Validate dimensions once loaded — if natural size is suspiciously tiny
      // or fails to decode, swap for placeholder.
      const handleLoad = () => {
        if (img.naturalWidth < 32 || img.naturalHeight < 32) {
          handleError();
          return;
        }
        // Update aspect ratio to real ratio once known (prevents distortion)
        img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        img.style.objectFit = 'contain';
      };

      const handleError = () => {
        const orig = img.getAttribute('data-original-src');
        if (orig && img.src !== orig) {
          img.removeAttribute('data-original-src');
          img.src = orig;
          return;
        }
        const placeholder = document.createElement('div');
        placeholder.className =
          'flex items-center justify-center w-full aspect-[16/9] my-6 rounded-2xl bg-muted text-muted-foreground border border-dashed border-border';
        placeholder.innerHTML =
          '<div class="flex flex-col items-center gap-2 text-sm opacity-70"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><path d="M13.5 13.5 6 21h12a2 2 0 0 0 2-2v-5.5"/><path d="M18 12V5a2 2 0 0 0-2-2H9.5"/></svg><span>Image unavailable</span></div>';
        img.replaceWith(placeholder);
      };
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      if (img.complete) {
        if (img.naturalWidth === 0) handleError();
        else handleLoad();
      }
    });
  }, [processed]);


  if (!processed) return null;

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};

export default RichContent;
