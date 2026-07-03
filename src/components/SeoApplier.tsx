import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const SEO_KEYS = [
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_og_image",
  "seo_favicon_url",
  "seo_canonical_base",
  "seo_ga_id",
  "seo_gsc_verification",
  "seo_robots",
];

const setMeta = (name: string, content: string, isProperty = false) => {
  if (!content) return;
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setLink = (rel: string, href: string, type?: string) => {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (type) el.type = type;
};

let seoCache: Record<string, string> | null = null;

const loadSeo = async () => {
  if (seoCache) return seoCache;
  const { data } = await supabase.from("settings").select("key,value").in("key", SEO_KEYS);
  const map: Record<string, string> = {};
  data?.forEach((r: any) => (map[r.key] = r.value ?? ""));
  seoCache = map;
  return map;
};

export default function SeoApplier() {
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const map = await loadSeo();
      if (map.seo_title) document.title = map.seo_title;
      setMeta("description", map.seo_description);
      setMeta("keywords", map.seo_keywords);
      setMeta("robots", map.seo_robots || "index, follow");
      setMeta("og:title", map.seo_title, true);
      setMeta("og:description", map.seo_description, true);
      if (map.seo_og_image) {
        setMeta("og:image", map.seo_og_image, true);
        setMeta("twitter:image", map.seo_og_image);
      }
      setMeta("twitter:card", "summary_large_image");
      setMeta("twitter:title", map.seo_title);
      setMeta("twitter:description", map.seo_description);
      if (map.seo_gsc_verification) setMeta("google-site-verification", map.seo_gsc_verification);

      const base = (map.seo_canonical_base || "").replace(/\/$/, "");
      if (base) {
        const url = base + location.pathname;
        setLink("canonical", url);
        setMeta("og:url", url, true);
      }
      if (map.seo_favicon_url) setLink("icon", map.seo_favicon_url);

      // Google Analytics gtag injection
      if (map.seo_ga_id && !document.getElementById("ga-tag")) {
        const s1 = document.createElement("script");
        s1.id = "ga-tag";
        s1.async = true;
        s1.src = `https://www.googletagmanager.com/gtag/js?id=${map.seo_ga_id}`;
        document.head.appendChild(s1);
        const s2 = document.createElement("script");
        s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${map.seo_ga_id}');`;
        document.head.appendChild(s2);
      }
      // GA pageview on route change
      const w: any = window;
      if (map.seo_ga_id && w.gtag) {
        w.gtag("config", map.seo_ga_id, { page_path: location.pathname });
      }
    })();
  }, [location.pathname]);

  return null;
}
