import { useEffect } from 'react';

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string; // absolute or path
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const upsertMeta = (selector: string, attr: string, name: string, content: string) => {
  if (!content) return;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

const JSONLD_ID = 'page-jsonld';

export function usePageSeo(opts: SeoOptions) {
  const { title, description, image, canonical, type = 'website', jsonLd } = opts;

  useEffect(() => {
    if (title) document.title = title;
    if (description) upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title || '');
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description || '');
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    if (image) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    }
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title || '');
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description || '');

    let absUrl = '';
    if (canonical) {
      absUrl = canonical.startsWith('http')
        ? canonical
        : `${window.location.origin}${canonical.startsWith('/') ? '' : '/'}${canonical}`;
      upsertLink('canonical', absUrl);
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', absUrl);
    }

    // JSON-LD
    const prev = document.getElementById(JSONLD_ID);
    if (prev) prev.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = JSONLD_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById(JSONLD_ID);
      if (el) el.remove();
    };
  }, [title, description, image, canonical, type, JSON.stringify(jsonLd)]);
}
