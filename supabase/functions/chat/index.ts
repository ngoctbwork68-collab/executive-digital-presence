import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchPortfolioContext(): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [heroRes, aboutRes, expRes, projRes, eduRes, skillsRes, contactRes, trainingRes, blogRes, prodRes, testRes, actRes, socialRes, settingsRes] = await Promise.all([
      supabase.from("hero_section").select("name, title, quote").maybeSingle(),
      supabase.from("about_section").select("headline, description").maybeSingle(),
      supabase.from("experiences").select("title, company, year, description, achievements, location").order("sort_order"),
      supabase.from("projects").select("title, description, category, technologies, link").order("sort_order").limit(15),
      supabase.from("education").select("degree, institution, year, field, achievements").order("sort_order"),
      supabase.from("skills").select("name").order("sort_order"),
      supabase.from("contacts").select("email, phone, location").maybeSingle(),
      supabase.from("chatbot_training").select("question, answer, language").eq("active", true).order("priority", { ascending: false }),
      supabase.from("blogs").select("title, excerpt, slug").eq("published", true).order("created_at", { ascending: false }).limit(10),
      supabase.from("products").select("name, description, price, product_type, slug").eq("published", true).order("sort_order").limit(20),
      supabase.from("testimonials").select("name, role_vi, role_en, quote_vi, quote_en").eq("published", true).limit(10),
      supabase.from("activities").select("title, description, date, location, category").eq("published", true).order("sort_order").limit(10),
      supabase.from("social_links").select("provider, url").order("sort_order"),
      supabase.from("settings").select("key, value").in("key", ["site_name", "footer_tagline"]),
    ]);

    const parts: string[] = [];
    const settingsMap = Object.fromEntries((settingsRes.data || []).map(s => [s.key, s.value]));

    if (settingsMap.site_name) parts.push(`# Tên website\n${settingsMap.site_name}${settingsMap.footer_tagline ? ` — ${settingsMap.footer_tagline}` : ''}`);

    if (heroRes.data) {
      parts.push(`# Thông tin chủ portfolio\nTên: ${heroRes.data.name}\nChức danh: ${heroRes.data.title}\nSlogan: ${heroRes.data.quote}`);
    }

    if (aboutRes.data) {
      parts.push(`# Giới thiệu\n${aboutRes.data.description}`);
    }

    if (expRes.data?.length) {
      parts.push(`# Kinh nghiệm làm việc\n${expRes.data.map(e =>
        `- ${e.title} tại ${e.company} (${e.year})${e.location ? ` - ${e.location}` : ''}${e.description ? `\n  ${e.description}` : ''}${e.achievements?.length ? `\n  Thành tích: ${e.achievements.join('; ')}` : ''}`
      ).join('\n')}`);
    }

    if (projRes.data?.length) {
      parts.push(`# Dự án\n${projRes.data.map(p =>
        `- ${p.title} (${p.category}): ${p.description}${p.technologies?.length ? ` | Công nghệ: ${p.technologies.join(', ')}` : ''}${p.link ? ` | Link: ${p.link}` : ''}`
      ).join('\n')}`);
    }

    if (eduRes.data?.length) {
      parts.push(`# Học vấn\n${eduRes.data.map(e =>
        `- ${e.degree} - ${e.institution} (${e.year})${e.field ? ` | ${e.field}` : ''}${e.achievements?.length ? ` | ${e.achievements.join('; ')}` : ''}`
      ).join('\n')}`);
    }

    if (skillsRes.data?.length) {
      parts.push(`# Kỹ năng\n${skillsRes.data.map(s => s.name).join(', ')}`);
    }

    if (actRes.data?.length) {
      parts.push(`# Hoạt động / Sự kiện\n${actRes.data.map(a =>
        `- ${a.title}${a.date ? ` (${a.date})` : ''}${a.location ? ` - ${a.location}` : ''}${a.category ? ` [${a.category}]` : ''}${a.description ? `: ${a.description}` : ''}`
      ).join('\n')}`);
    }

    if (blogRes.data?.length) {
      parts.push(`# Bài viết blog\n${blogRes.data.map(b =>
        `- ${b.title}${b.excerpt ? `: ${b.excerpt}` : ''} (/blog/${b.slug})`
      ).join('\n')}`);
    }

    if (prodRes.data?.length) {
      parts.push(`# Sản phẩm / Dịch vụ trong cửa hàng\n${prodRes.data.map(p =>
        `- ${p.name} [${p.product_type}] - ${Number(p.price).toLocaleString('vi-VN')}₫${p.description ? `: ${p.description}` : ''} (/store/${p.slug})`
      ).join('\n')}`);
    }

    if (testRes.data?.length) {
      parts.push(`# Đánh giá khách hàng\n${testRes.data.map(t =>
        `- ${t.name} (${t.role_vi || t.role_en || ''}): "${t.quote_vi || t.quote_en}"`
      ).join('\n')}`);
    }

    if (contactRes.data) {
      const c = contactRes.data;
      parts.push(`# Liên hệ\n${c.email ? `Email: ${c.email}` : ''}${c.phone ? ` | SĐT: ${c.phone}` : ''}${c.location ? ` | Địa chỉ: ${c.location}` : ''}`);
    }

    if (socialRes.data?.length) {
      parts.push(`# Mạng xã hội\n${socialRes.data.map(s => `- ${s.provider}: ${s.url}`).join('\n')}`);
    }

    if (trainingRes.data?.length) {
      parts.push(`# FAQ đã huấn luyện (ưu tiên cao nhất)\n${trainingRes.data.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n')}`);
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

    const portfolioContext = await fetchPortfolioContext();

    const systemPrompt = language === "vi"
      ? `Bạn là trợ lý AI thông minh của portfolio cá nhân. Dưới đây là TOÀN BỘ dữ liệu thực tế từ database (cập nhật trực tiếp):

${portfolioContext}

Hướng dẫn QUAN TRỌNG:
- Trả lời bằng tiếng Việt, chuyên nghiệp, ấm áp, dễ hiểu
- LUÔN ưu tiên dùng dữ liệu thật ở trên — KHÔNG bịa thông tin
- Nếu user hỏi về dự án/sản phẩm/blog/hoạt động cụ thể, trích chính xác tên + chi tiết và kèm link nếu có
- Nếu FAQ đã huấn luyện có câu trả lời sát, dùng nguyên văn câu trả lời đó
- Nếu thông tin không có trong dữ liệu, nói thẳng "Tôi chưa có thông tin này" và mời liên hệ qua trang /contact
- Trình bày dùng markdown gọn (danh sách, bold), tối đa ~250 từ
- Có thể dùng emoji phù hợp 🌟`
      : `You are a smart AI assistant for a personal portfolio. Below is the COMPLETE real-time data from the database:

${portfolioContext}

IMPORTANT guidelines:
- Reply in English, professional and friendly
- ALWAYS use the real data above — DO NOT make things up
- For specific project/product/blog/activity questions, quote exact name + details and include link if available
- If a trained FAQ matches, use that answer verbatim
- If info isn't in the data, say "I don't have that info yet" and invite contact via /contact
- Use concise markdown (lists, bold), max ~250 words
- Use appropriate emojis 🌟`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Hết lượt sử dụng AI, vui lòng thử lại sau." }), {
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
