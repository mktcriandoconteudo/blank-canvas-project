import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("MP Webhook received:", JSON.stringify(body));

    // Only process payment notifications
    if (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // We need to find which resort's access token to use
    // First, try to get the external_reference from MP to find the reservation
    // We'll check all payment configs to find the right one
    const { data: configs } = await supabase
      .from("resort_payment_config")
      .select("resort_id, mp_access_token")
      .eq("payment_method", "mercadopago")
      .not("mp_access_token", "is", null);

    if (!configs || configs.length === 0) {
      console.error("No MP configs found");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try each config's access token to get payment details
    let paymentData: any = null;
    for (const config of configs) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${config.mp_access_token}` },
      });
      if (res.ok) {
        paymentData = await res.json();
        break;
      }
    }

    if (!paymentData) {
      console.error("Could not fetch payment from MP");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reservationId = paymentData.external_reference;
    if (!reservationId) {
      console.error("No external_reference in payment");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map MP status to our status
    let paymentStatus = "pending";
    if (paymentData.status === "approved") paymentStatus = "confirmed";
    else if (paymentData.status === "rejected") paymentStatus = "failed";
    else if (paymentData.status === "cancelled") paymentStatus = "cancelled";

    // Update reservation
    const { data: reservation } = await supabase
      .from("reservations")
      .update({
        payment_status: paymentStatus,
        mp_payment_id: String(paymentId),
      })
      .eq("id", reservationId)
      .select("*")
      .single();

    // Auto-block dates if payment confirmed
    if (paymentStatus === "confirmed" && reservation) {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      const dates: { resort_id: string; blocked_date: string; reason: string }[] = [];

      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        dates.push({
          resort_id: reservation.resort_id,
          blocked_date: d.toISOString().split("T")[0],
          reason: `Reserva ${reservation.guest_name || reservationId}`,
        });
      }

      if (dates.length > 0) {
        await supabase.from("blocked_dates").upsert(dates, {
          onConflict: "resort_id,blocked_date",
        });
      }
    }

    console.log(`Reservation ${reservationId} updated to ${paymentStatus}`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
