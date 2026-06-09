import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

const BookingSchema = z.object({
  customer_name: z.string().trim().min(1).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(40).optional().nullable(),
  topic: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  start_time: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(240).default(30),
  timezone: z.string().max(80).optional().default("Asia/Ho_Chi_Minh"),
  // Honeypot: must be empty. Bots fill hidden fields.
  website: z.string().max(0).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const {
      customer_name, customer_email, customer_phone, topic, message,
      start_time, duration_minutes, timezone,
    } = parsed.data;

    const startDate = new Date(start_time);
    if (Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now() - 60_000) {
      return new Response(
        JSON.stringify({ error: "start_time phải là thời điểm trong tương lai" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const endDate = new Date(startDate.getTime() + duration_minutes * 60_000);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Rate limit: reject if same email or phone created a booking in last 60s,
    // or more than 5 bookings in the last hour.
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

    const { count: recentBurst } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", customer_email)
      .gte("created_at", oneMinAgo);
    if ((recentBurst ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: "Bạn vừa gửi yêu cầu, vui lòng đợi một chút trước khi thử lại." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { count: hourly } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", customer_email)
      .gte("created_at", oneHourAgo);
    if ((hourly ?? 0) >= 5) {
      return new Response(
        JSON.stringify({ error: "Quá nhiều yêu cầu đặt lịch. Vui lòng thử lại sau." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1) Insert booking
    const { data: booking, error: insertErr } = await supabase
      .from("bookings")
      .insert({
        customer_name, customer_email,
        customer_phone: customer_phone || null,
        topic: topic || null,
        message: message || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_minutes,
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // 2) Try syncing to Google Calendar (non-fatal)
    let syncError: string | null = null;
    let eventId: string | null = null;
    let eventLink: string | null = null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_CALENDAR_API_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");

    if (LOVABLE_API_KEY && GOOGLE_CALENDAR_API_KEY) {
      try {
        const eventBody = {
          summary: `[Đặt lịch] ${customer_name}${topic ? ` — ${topic}` : ""}`,
          description:
            `Khách: ${customer_name}\nEmail: ${customer_email}` +
            (customer_phone ? `\nĐiện thoại: ${customer_phone}` : "") +
            (topic ? `\nChủ đề: ${topic}` : "") +
            (message ? `\n\nLời nhắn:\n${message}` : ""),
          start: { dateTime: startDate.toISOString(), timeZone: timezone },
          end: { dateTime: endDate.toISOString(), timeZone: timezone },
          attendees: [{ email: customer_email, displayName: customer_name }],
          reminders: { useDefault: true },
        };

        const gRes = await fetch(`${GATEWAY_URL}/calendars/primary/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": GOOGLE_CALENDAR_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventBody),
        });
        const gData = await gRes.json();
        if (!gRes.ok) {
          syncError = `Google Calendar [${gRes.status}]: ${JSON.stringify(gData).slice(0, 400)}`;
        } else {
          eventId = gData.id ?? null;
          eventLink = gData.htmlLink ?? null;
        }
      } catch (e) {
        syncError = e instanceof Error ? e.message : String(e);
      }
    } else {
      syncError = "Google Calendar chưa kết nối";
    }

    if (eventId || syncError) {
      await supabase
        .from("bookings")
        .update({
          google_event_id: eventId,
          google_event_link: eventLink,
          google_sync_error: syncError,
        })
        .eq("id", booking.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        google_synced: !!eventId,
        google_event_link: eventLink,
        sync_error: syncError,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("create-booking error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
