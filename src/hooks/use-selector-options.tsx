import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SelectorOption {
  id: string;
  category: string;
  key: string;
  label: string;
  icon_name: string;
  display_order: number;
}

export function useSelectorOptions(category: string) {
  const [options, setOptions] = useState<SelectorOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOptions = async () => {
    const { data } = await supabase
      .from("selector_options")
      .select("*")
      .eq("category", category)
      .order("display_order");
    if (data) setOptions(data as SelectorOption[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOptions();
  }, [category]);

  const addOption = async (opt: { key: string; label: string; icon_name: string }) => {
    const maxOrder = options.length > 0 ? Math.max(...options.map(o => o.display_order)) : 0;
    const { error } = await supabase.from("selector_options").insert({
      category,
      key: opt.key,
      label: opt.label,
      icon_name: opt.icon_name,
      display_order: maxOrder + 1,
    });
    if (!error) await fetchOptions();
    return error;
  };

  const updateOption = async (id: string, updates: { label?: string; icon_name?: string }) => {
    const { error } = await supabase.from("selector_options").update(updates).eq("id", id);
    if (!error) await fetchOptions();
    return error;
  };

  const deleteOption = async (id: string) => {
    const { error } = await supabase.from("selector_options").delete().eq("id", id);
    if (!error) await fetchOptions();
    return error;
  };

  return { options, loading, fetchOptions, addOption, updateOption, deleteOption };
}
