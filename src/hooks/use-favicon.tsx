import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFavicon = () => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavicon = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "favicon_url")
        .maybeSingle();

      if (data?.value) {
        setFaviconUrl(data.value);
        const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.value;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = data.value;
          document.head.appendChild(newLink);
        }
      }
    };

    fetchFavicon();
  }, []);

  return faviconUrl;
};
