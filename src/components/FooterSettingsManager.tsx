import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Save, Loader2, Phone, Mail, MapPin, Building2, Type, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SETTINGS = [
  { key: "footer_company_name", label: "Nome da Empresa", icon: Type, placeholder: "Caldas Resorts", type: "input" },
  { key: "footer_company_subtitle", label: "Subtítulo", icon: Type, placeholder: "J G Locações", type: "input" },
  { key: "footer_description", label: "Descrição da Empresa", icon: FileText, placeholder: "Sua experiência perfeita...", type: "textarea" },
  { key: "footer_about", label: "Texto Sobre Nós", icon: FileText, placeholder: "Somos especializados em...", type: "textarea" },
  { key: "footer_phone", label: "Telefone", icon: Phone, placeholder: "(62) 99999-9999", type: "input" },
  { key: "footer_email", label: "E-mail", icon: Mail, placeholder: "contato@caldasresorts.com", type: "input" },
  { key: "footer_address", label: "Endereço", icon: MapPin, placeholder: "Caldas Novas - GO, Brasil", type: "input" },
  { key: "footer_cnpj", label: "CNPJ", icon: Building2, placeholder: "00.000.000/0001-00", type: "input" },
  { key: "footer_copyright", label: "Texto de Copyright", icon: Type, placeholder: "Caldas Resorts — J G Locações", type: "input" },
  { key: "footer_tagline", label: "Tagline (rodapé)", icon: Type, placeholder: "Feito com ❤️ em Caldas Novas", type: "input" },
  { key: "social_instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/seuusuario", type: "input" },
  { key: "social_facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/suapagina", type: "input" },
  { key: "social_youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@seucanal", type: "input" },
];

const ALL_KEYS = SETTINGS.map((s) => s.key);

const FooterSettingsManager = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ALL_KEYS);
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
      for (const { key } of SETTINGS) {
        const value = values[key] || "";
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          await supabase.from("site_settings").update({ value }).eq("key", key);
        } else if (value) {
          await supabase.from("site_settings").insert({ key, value });
        }
      }
      toast.success("Configurações do rodapé salvas!");
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
        Rodapé do Site
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SETTINGS.map(({ key, label, icon: Icon, placeholder, type }) => (
          <div key={key} className={`space-y-1 ${type === "textarea" ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Label>
            {type === "textarea" ? (
              <Textarea
                value={values[key] || ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="text-sm min-h-[60px]"
                rows={2}
              />
            ) : (
              <Input
                value={values[key] || ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
        Salvar Rodapé
      </Button>
    </div>
  );
};

export default FooterSettingsManager;
