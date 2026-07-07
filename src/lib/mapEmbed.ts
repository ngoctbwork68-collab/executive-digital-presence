// Safe Google Maps embed URL parser.
// Accepts either a raw URL or a full <iframe ...> HTML snippet (with entities),
// and always returns a valid https://www.google.com/maps/embed URL.

export const FALLBACK_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d476855.7336670022!2d105.3230731579968!3d20.975176246258698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1777937845356!5m2!1svi!2s";

const ALLOWED_HOST = /^https:\/\/(www\.)?google\.com\/maps\/embed(\?|$)/i;

/** Decode common HTML entities so pasted iframe HTML parses correctly. */
const decodeEntities = (input: string): string =>
  input
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");

/** Strip any HTML tags leaving only text. */
const stripTags = (input: string): string => input.replace(/<[^>]*>/g, " ");

/**
 * Extract a valid Google Maps embed URL from arbitrary user input.
 * Returns null if nothing safe is found.
 */
export function extractMapEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // Decode entities up to 3 passes (handle double-encoded input).
  for (let i = 0; i < 3; i++) {
    const next = decodeEntities(s);
    if (next === s) break;
    s = next;
  }

  const candidates: string[] = [];

  // 1) All src="..." / src='...' attributes (handle nested iframes — prefer last).
  const srcMatches = [...s.matchAll(/src\s*=\s*["']([^"']+)["']/gi)];
  for (const m of srcMatches) candidates.push(m[1].trim());

  // 2) Any bare google maps embed URL in the string.
  const urlMatches = [
    ...s.matchAll(/https?:\/\/(?:www\.)?google\.com\/maps\/embed[^\s"'<>]*/gi),
  ];
  for (const m of urlMatches) candidates.push(m[0].trim());

  // 3) If input itself is a pure URL, consider it.
  const cleaned = stripTags(s).trim();
  if (cleaned && !/\s/.test(cleaned)) candidates.push(cleaned);

  // Pick the last (deepest) valid candidate.
  for (let i = candidates.length - 1; i >= 0; i--) {
    const c = candidates[i];
    if (ALLOWED_HOST.test(c)) {
      // Strip any accidental trailing HTML/quote fragments.
      return c.replace(/["'<>].*$/, "");
    }
  }
  return null;
}

/** Always returns a safe URL: extracted value, or the fallback. */
export function safeMapEmbedUrl(raw: string | null | undefined): string {
  return extractMapEmbedUrl(raw) ?? FALLBACK_MAP_EMBED;
}
