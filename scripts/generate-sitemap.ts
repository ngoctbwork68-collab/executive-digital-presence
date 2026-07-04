// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = (process.env.SITE_URL || "https://baongoctran.id.vn").replace(/\/$/, "");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xfgzpqcvejscxuaxkouh.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZ3pwcWN2ZWpzY3h1YXhrb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxMjcsImV4cCI6MjA4MDYzMjEyN30.R-Dokun3eBdldACkm2GCPP7T4knGrNBSCpflBOsVRJo";

const POSTS_PER_PAGE = 9;

interface Entry {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/store", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

function xml(entries: Entry[]) {
  const urls = entries.map((e) => {
    const parts = [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const entries: Entry[] = [...staticEntries];

  try {
    const { data: blogs } = await supabase
      .from("blogs")
      .select("slug,updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });
    if (blogs) {
      // blog pagination pages
      const totalPages = Math.max(1, Math.ceil(blogs.length / POSTS_PER_PAGE));
      for (let p = 2; p <= totalPages; p++) {
        entries.push({ path: `/blog?page=${p}`, changefreq: "weekly", priority: "0.6" });
      }
      blogs.forEach((b: any) => {
        if (!b.slug) return;
        entries.push({
          path: `/blog/${b.slug}`,
          lastmod: b.updated_at ? new Date(b.updated_at).toISOString().slice(0, 10) : undefined,
          changefreq: "monthly",
          priority: "0.7",
        });
      });
    }
  } catch (e) {
    console.warn("[sitemap] blogs skipped:", (e as Error).message);
  }

  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("slug,updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });
    projects?.forEach((p: any) => {
      if (!p.slug) return;
      entries.push({
        path: `/projects/${p.slug}`,
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
    });
  } catch (e) {
    console.warn("[sitemap] projects skipped:", (e as Error).message);
  }

  try {
    const { data: products } = await supabase
      .from("products")
      .select("slug,updated_at")
      .order("updated_at", { ascending: false });
    products?.forEach((p: any) => {
      if (!p.slug) return;
      entries.push({
        path: `/store/${p.slug}`,
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
        changefreq: "monthly",
        priority: "0.6",
      });
    });
  } catch (e) {
    console.warn("[sitemap] products skipped:", (e as Error).message);
  }

  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`[sitemap] wrote ${entries.length} entries → public/sitemap.xml`);
}

main().catch((e) => {
  console.error("[sitemap] failed:", e);
  // Fall back to static-only sitemap so build never fails
  writeFileSync(resolve("public/sitemap.xml"), xml(staticEntries));
});
