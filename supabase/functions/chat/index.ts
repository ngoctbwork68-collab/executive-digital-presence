import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Lightweight keyword extraction (VI + EN). Removes stopwords & normalizes diacritics.
const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","of","for","to","in","on","at","by","with","and","or","but","if","then","than","that","this","these","those","i","you","he","she","we","they","it","me","my","your","our","their","what","who","when","where","why","how","do","does","did","can","could","should","would","will","about","tell","please","có","của","và","là","trong","cho","với","về","như","khi","đã","đang","sẽ","một","các","những","thì","mà","để","tôi","bạn","mình","gì","ai","nào","sao","tại","hỏi","cần","giúp","muốn","biết","nói","xin","cảm","ơn"
]);
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}
function extractKeywords(text: string): string[] {
  const tokens = normalize(text).split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !STOPWORDS.has(t));
  return [...new Set(tokens)];
}

async function fetchPortfolioContext(userQuery: string): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [heroRes, aboutRes, expRes, projRes, eduRes, skillsRes, contactRes, trainingRes, blogRes, prodRes, testRes, actRes, socialRes, settingsRes, catRes, prodCatRes, customRes, footerRes] = await Promise.all([
      supabase.from("hero_section").select("name, title, quote").maybeSingle(),
      supabase.from("about_section").select("headline, description").maybeSingle(),
      supabase.from("experiences").select("title, company, year, description, achievements, location").order("sort_order"),
      supabase.from("projects").select("title, description, full_description, category, technologies, link, slug, challenge, solution, metrics").order("sort_order").limit(20),
      supabase.from("education").select("degree, institution, year, field, description, achievements").order("sort_order"),
      supabase.from("skills").select("name").order("sort_order"),
      supabase.from("contacts").select("email, phone, location").maybeSingle(),
      supabase.from("chatbot_training").select("question, answer, keywords, language, priority").eq("active", true).order("priority", { ascending: false }),
      supabase.from("blogs").select("title, excerpt, slug, content").eq("published", true).order("created_at", { ascending: false }).limit(15),
      supabase.from("products").select("name, description, full_description, price, discount_percent, product_type, slug, stock_quantity").eq("published", true).order("sort_order").limit(30),
      supabase.from("testimonials").select("name, role_vi, role_en, quote_vi, quote_en").eq("published", true).limit(15),
      supabase.from("activities").select("title, description, content, date, location, category, link").eq("published", true).order("sort_order").limit(15),
      supabase.from("social_links").select("provider, url").order("sort_order"),
      supabase.from("settings").select("key, value").in("key", ["site_name", "footer_tagline", "footer_text"]),
      supabase.from("blog_categories").select("name, slug, description").order("sort_order"),
      supabase.from("product_categories").select("name, slug, description").order("sort_order"),
      supabase.from("custom_sections").select("title, subtitle, content, page, section_type").eq("published", true).order("sort_order").limit(20),
      supabase.from("footer_links").select("label, url, section").order("sort_order"),
    ]);

    const settingsMap = Object.fromEntries((settingsRes.data || []).map(s => [s.key, s.value]));
    const siteName = settingsMap.site_name || "Portfolio";

    // Strip HTML tags for cleaner context
    const strip = (s: string | null | undefined) => (s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

    // Score helper: keyword overlap
    const kw = extractKeywords(userQuery);
    const score = (text: string) => {
      if (!kw.length) return 0;
      const n = normalize(text);
      let s = 0;
      for (const k of kw) if (n.includes(k)) s++;
      return s;
    };

    const parts: string[] = [];

    parts.push(`# Website: ${siteName}${settingsMap.footer_tagline ? ` — ${settingsMap.footer_tagline}` : ''}\nThời gian hiện tại: ${new Date().toISOString()}`);

    if (heroRes.data) {
      parts.push(`# Chủ portfolio\nTên: ${heroRes.data.name}\nChức danh: ${heroRes.data.title}\nSlogan: "${heroRes.data.quote}"`);
    }
    if (aboutRes.data) {
      parts.push(`# Giới thiệu (${aboutRes.data.headline})\n${strip(aboutRes.data.description)}`);
    }

    if (skillsRes.data?.length) {
      parts.push(`# Kỹ năng\n${skillsRes.data.map(s => s.name).join(', ')}`);
    }

    if (expRes.data?.length) {
      parts.push(`# Kinh nghiệm (${expRes.data.length})\n${expRes.data.map(e =>
        `• ${e.title} @ ${e.company} (${e.year})${e.location ? ` - ${e.location}` : ''}${e.description ? ` — ${strip(e.description)}` : ''}${e.achievements?.length ? `\n  Thành tích: ${e.achievements.join('; ')}` : ''}`
      ).join('\n')}`);
    }

    if (eduRes.data?.length) {
      parts.push(`# Học vấn\n${eduRes.data.map(e =>
        `• ${e.degree} — ${e.institution} (${e.year})${e.field ? ` | ${e.field}` : ''}${e.description ? ` — ${strip(e.description)}` : ''}${e.achievements?.length ? ` | Thành tích: ${e.achievements.join('; ')}` : ''}`
      ).join('\n')}`);
    }

    // Projects — top by relevance, fallback to all
    if (projRes.data?.length) {
      const ranked = [...projRes.data].sort((a, b) => score(`${b.title} ${b.description} ${b.category} ${(b.technologies||[]).join(' ')}`) - score(`${a.title} ${a.description} ${a.category} ${(a.technologies||[]).join(' ')}`));
      parts.push(`# Dự án (${projRes.data.length})\n${ranked.slice(0, 12).map(p =>
        `• ${p.title} [${p.category}] — ${strip(p.description)}${p.technologies?.length ? ` | Tech: ${p.technologies.join(', ')}` : ''}${p.link ? ` | Link: ${p.link}` : ''}${p.slug ? ` | Trang chi tiết: /projects/${p.slug}` : ''}${p.challenge ? `\n  Thách thức: ${strip(p.challenge).slice(0, 200)}` : ''}${p.solution ? `\n  Giải pháp: ${strip(p.solution).slice(0, 200)}` : ''}`
      ).join('\n')}`);
    }

    if (actRes.data?.length) {
      parts.push(`# Hoạt động / Sự kiện\n${actRes.data.map(a =>
        `• ${a.title}${a.date ? ` (${a.date})` : ''}${a.location ? ` - ${a.location}` : ''}${a.category ? ` [${a.category}]` : ''}${a.description ? `: ${strip(a.description)}` : ''}${a.link ? ` | ${a.link}` : ''}`
      ).join('\n')}`);
    }

    // Blogs — rank by relevance
    if (blogRes.data?.length) {
      const ranked = [...blogRes.data].sort((a, b) => score(`${b.title} ${b.excerpt} ${b.content}`) - score(`${a.title} ${a.excerpt} ${a.content}`));
      parts.push(`# Blog (${blogRes.data.length})\n${ranked.slice(0, 10).map(b =>
        `• "${b.title}" — ${strip(b.excerpt) || strip(b.content).slice(0, 150)} → /blog/${b.slug}`
      ).join('\n')}`);
      if (catRes.data?.length) parts.push(`Danh mục blog: ${catRes.data.map(c => c.name).join(', ')}`);
    }

    if (prodRes.data?.length) {
      const ranked = [...prodRes.data].sort((a, b) => score(`${b.name} ${b.description}`) - score(`${a.name} ${a.description}`));
      parts.push(`# Sản phẩm / Dịch vụ (${prodRes.data.length})\n${ranked.slice(0, 15).map(p => {
        const finalPrice = p.discount_percent ? Number(p.price) * (1 - p.discount_percent/100) : Number(p.price);
        return `• ${p.name} [${p.product_type}] — ${finalPrice.toLocaleString('vi-VN')}₫${p.discount_percent ? ` (giảm ${p.discount_percent}%)` : ''}${p.stock_quantity > 0 ? ` | Còn ${p.stock_quantity}` : ' | Hết hàng'}${p.description ? `: ${strip(p.description)}` : ''} → /store/${p.slug}`;
      }).join('\n')}`);
      if (prodCatRes.data?.length) parts.push(`Danh mục cửa hàng: ${prodCatRes.data.map(c => c.name).join(', ')}`);
    }

    if (testRes.data?.length) {
      parts.push(`# Đánh giá khách hàng\n${testRes.data.map(t =>
        `• ${t.name} (${t.role_vi || t.role_en || ''}): "${t.quote_vi || t.quote_en}"`
      ).join('\n')}`);
    }

    if (customRes.data?.length) {
      parts.push(`# Nội dung trang tuỳ chỉnh\n${customRes.data.map(c =>
        `• [trang /${c.page}] ${c.title}${c.subtitle ? ` — ${c.subtitle}` : ''}: ${strip(c.content).slice(0, 250)}`
      ).join('\n')}`);
    }

    if (contactRes.data) {
      const c = contactRes.data;
      parts.push(`# Liên hệ\n${c.email ? `Email: ${c.email}` : ''}${c.phone ? ` | SĐT: ${c.phone}` : ''}${c.location ? ` | Địa chỉ: ${c.location}` : ''}\nTrang liên hệ: /contact (có form gửi tin nhắn + đặt lịch hẹn qua Google Calendar)`);
    }

    if (socialRes.data?.length) {
      parts.push(`# Mạng xã hội\n${socialRes.data.map(s => `• ${s.provider}: ${s.url}`).join('\n')}`);
    }

    if (footerRes.data?.length) {
      parts.push(`# Điều hướng nhanh\n${footerRes.data.map(f => `• [${f.section}] ${f.label} → ${f.url}`).join('\n')}`);
    }

    // FAQ — rank by keyword match with stored keywords + question text
    if (trainingRes.data?.length) {
      const ranked = [...trainingRes.data].sort((a, b) => {
        const sa = score(`${a.question} ${(a.keywords||[]).join(' ')}`) * 10 + (a.priority || 0);
        const sb = score(`${b.question} ${(b.keywords||[]).join(' ')}`) * 10 + (b.priority || 0);
        return sb - sa;
      });
      parts.push(`# FAQ đã huấn luyện (DÙNG NGUYÊN VĂN nếu khớp câu hỏi)\n${ranked.slice(0, 10).map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n')}`);
    }

    return parts.join('\n\n');
  } catch (e) {
    console.error("Error fetching portfolio context:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "vi" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const latestUser = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const portfolioContext = await fetchPortfolioContext(latestUser);

    const systemPrompt = language === "vi"
      ? `Bạn là **trợ lý AI cao cấp** cho portfolio này. Bạn THÔNG MINH, CHÍNH XÁC và HỮU ÍCH.

═══════════════ DỮ LIỆU THỰC TỪ DATABASE ═══════════════
${portfolioContext}
═══════════════════════════════════════════════════════════

QUY TẮC VÀNG:
1. **CHỈ dùng dữ liệu ở trên** — TUYỆT ĐỐI không bịa tên, con số, link, ngày tháng.
2. Nếu FAQ huấn luyện khớp ý câu hỏi → trả lời gần như NGUYÊN VĂN, có thể tinh chỉnh nhẹ.
3. Khi liệt kê dự án/blog/sản phẩm/sự kiện → LUÔN kèm link tương đối inline (vd: [Tên dự án](/projects/slug)).
4. Hiển thị giá tiền có định dạng VNĐ (vd: 1.500.000₫). Hiển thị giảm giá nếu có.
5. Nếu user hỏi liên hệ / đặt lịch → hướng dẫn họ vào **/contact** (form + Google Calendar).
6. Nếu thông tin KHÔNG có trong dữ liệu → nói thẳng "Tôi chưa có thông tin này" và mời họ liên hệ qua /contact. KHÔNG đoán.
7. Trả lời bằng **tiếng Việt tự nhiên, ấm áp, chuyên nghiệp**. Markdown gọn.
8. Tối đa ~280 từ. Súc tích.
9. **BẮT BUỘC TRÍCH NGUỒN**: Cuối mỗi câu trả lời thực chất (trừ chào hỏi), thêm DÒNG TRỐNG rồi block:

---
**📚 Nguồn tham khảo:**
- [Tên mục cụ thể](/đường-dẫn)
- [Tên mục khác](/đường-dẫn-khác)

   Chỉ liệt kê các mục THỰC SỰ đã dùng (1–4 mục), với tên rõ ràng + link tương đối từ dữ liệu trên. KHÔNG bịa link. Nếu không có link cụ thể trong DB, dùng /about, /projects, /blog, /store, /contact tương ứng.
10. Có thể đề xuất 1-2 câu hỏi tiếp theo (dòng "💡 *Bạn có thể hỏi tiếp:*") TRƯỚC khối nguồn.
11. Emoji vừa phải 🌟.`
      : `You are a **premium AI assistant** for this portfolio. Be SMART, ACCURATE, and HELPFUL.

═══════════════ LIVE DATABASE CONTEXT ═══════════════
${portfolioContext}
═════════════════════════════════════════════════════

GOLDEN RULES:
1. **Only use data above** — NEVER fabricate names, numbers, links, or dates.
2. If a trained FAQ matches → answer nearly verbatim.
3. When listing projects/blogs/products/events → ALWAYS include inline relative links (e.g. [Project name](/projects/slug)).
4. Format prices in VND (e.g. 1,500,000₫). Show discounts.
5. For contact/booking → direct to **/contact**.
6. If info NOT in data → say so and invite contact via /contact. Do NOT guess.
7. Reply in natural, warm, professional English. Light markdown.
8. Max ~280 words.
9. **MANDATORY CITATIONS**: End every substantive answer with a blank line then:

---
**📚 Sources:**
- [Specific item name](/path)
- [Another item](/another-path)

   List ONLY items actually used (1–4), real names + relative links from data above. Never invent links. Fallback to /about, /projects, /blog, /store, /contact when needed.
10. Optionally suggest 1-2 follow-ups ("💡 *You might also ask:*") BEFORE the sources block.
11. Emojis sparingly 🌟.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: language === 'vi' ? "Quá nhiều yêu cầu, vui lòng thử lại sau ít phút." : "Too many requests, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: language === 'vi' ? "Hết lượt sử dụng AI, vui lòng thử lại sau." : "AI quota exhausted, please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
