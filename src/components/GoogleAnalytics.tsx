import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const GoogleAnalytics = () => {
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGaId = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ga_measurement_id")
        .maybeSingle();
      if (data?.value) setGaId(data.value);
    };
    fetchGaId();
  }, []);

  useEffect(() => {
    if (!gaId) return;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) return;

    // Load gtag.js
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement("script");
    inlineScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inlineScript);

    return () => {
      script.remove();
      inlineScript.remove();
    };
  }, [gaId]);

  return null;
};

export default GoogleAnalytics;
