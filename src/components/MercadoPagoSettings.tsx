import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Eye, EyeOff, Save } from "lucide-react";

const KEYS = [
  { key: "mp_access_token", label: "Access Token", placeholder: "APP_USR-..." },
  { key: "mp_public_key", label: "Public Key", placeholder: "APP_USR-..." },
] as const;

const MercadoPagoSettings = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", KEYS.map(k => k.key));

    if (data) {
      const map: Record<string, string> = {};
      data.forEach(d => { map[d.key] = d.value; });
      setValues(map);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();

    for (const k of KEYS) {
      const val = values[k.key]?.trim();
      if (!val) continue;

      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: k.key, value: val, updated_at: now }, { onConflict: "key" });

      if (error) {
        toast({ title: `Erro ao salvar ${k.label}`, description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: "Configurações do Mercado Pago salvas!" });
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Mercado Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {KEYS.map(k => (
          <div key={k.key} className="space-y-1.5">
            <Label htmlFor={k.key} className="text-xs">{k.label}</Label>
            <div className="relative">
              <Input
                id={k.key}
                type={visible[k.key] ? "text" : "password"}
                placeholder={k.placeholder}
                value={values[k.key] || ""}
                onChange={e => setValues(prev => ({ ...prev, [k.key]: e.target.value }))}
                className="pr-9 text-xs"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setVisible(prev => ({ ...prev, [k.key]: !prev[k.key] }))}
              >
                {visible[k.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="w-3 h-3 mr-1" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Obtenha suas credenciais em{" "}
          <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="underline">
            Mercado Pago Developers
          </a>.
        </p>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoSettings;
