import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SOCIAL_KEYS = [
  { key: "social_instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/seuusuario" },
  { key: "social_facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/suapagina" },
  { key: "social_youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@seucanal" },
];

const FooterSettingsManager = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", SOCIAL_KEYS.map((s) => s.key));

      const map: Record<string, string> = {};
      data?.forEach((row) => (map[row.key] = row.value));
      setValues(map);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of SOCIAL_KEYS) {
        const value = values[key] || "";
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          await supabase.from("site_settings").update({ value }).eq("key", key);
        } else {
          await supabase.from("site_settings").insert({ key, value });
        }
      }
      toast.success("Links de redes sociais salvos!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Redes Sociais do Rodapé
      </h2>
      <div className="space-y-3">
        {SOCIAL_KEYS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Label>
            <Input
              value={values[key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="text-sm"
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
        Salvar Redes Sociais
      </Button>
    </div>
  );
};

export default FooterSettingsManager;
