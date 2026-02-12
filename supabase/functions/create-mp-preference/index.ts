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
    const { reservation_id } = await req.json();

    if (!reservation_id) {
      return new Response(
        JSON.stringify({ error: "reservation_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get reservation
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (resError || !reservation) {
      return new Response(
        JSON.stringify({ error: "Reserva não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment config for this resort/apartment
    const { data: payConfig, error: payError } = await supabase
      .from("resort_payment_config")
      .select("*")
      .eq("resort_id", reservation.resort_id)
      .single();

    if (payError || !payConfig || !payConfig.mp_access_token) {
      return new Response(
        JSON.stringify({ error: "Configuração de Mercado Pago não encontrada para este apartamento" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get resort name
    const { data: resort } = await supabase
      .from("resorts")
      .select("name")
      .eq("id", reservation.resort_id)
      .single();

    const baseUrl = req.headers.get("origin") || "https://terra-nova-prime.lovable.app";

    // Create Mercado Pago preference using the apartment's own access token
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payConfig.mp_access_token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `Reserva ${resort?.name || "Apartamento"} - ${reservation.plan_name}`,
            description: `${reservation.total_nights} noites · ${reservation.plan_sessions}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(reservation.total_price),
          },
        ],
        payer: {
          name: reservation.guest_name || "",
          email: reservation.guest_email || "",
        },
        back_urls: {
          success: `${baseUrl}/reserva/sucesso?id=${reservation_id}`,
          failure: `${baseUrl}/reserva/falha?id=${reservation_id}`,
          pending: `${baseUrl}/reserva/pendente?id=${reservation_id}`,
        },
        auto_return: "approved",
        external_reference: reservation_id,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
      }),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error("MP API Error:", mpError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar preferência no Mercado Pago" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mpData = await mpResponse.json();

    // Save preference id to reservation
    await supabase
      .from("reservations")
      .update({ mp_preference_id: mpData.id })
      .eq("id", reservation_id);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preference_id: mpData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
