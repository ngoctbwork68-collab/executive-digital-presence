/**
 * Convert an HTML string (potentially from a rich-text editor) into clean
 * plain text. Removes all tags, decodes a few common entities, and
 * collapses whitespace. Safe to use inside JSX text nodes.
 */
export const stripHtml = (input?: string | null): string => {
  if (!input) return '';
  return input
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};
