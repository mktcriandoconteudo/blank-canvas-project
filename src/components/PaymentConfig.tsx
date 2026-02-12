import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Eye, EyeOff, Save, ChevronDown, ChevronUp, QrCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentConfigProps {
  resortId: string;
}

const PaymentConfig = ({ resortId }: PaymentConfigProps) => {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState({
    payment_method: "manual",
    mp_access_token: "",
    mp_public_key: "",
    pix_key: "",
    pix_name: "",
    pix_bank: "",
    whatsapp: "",
  });

  useEffect(() => {
    fetchConfig();
  }, [resortId]);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("resort_payment_config")
      .select("*")
      .eq("resort_id", resortId)
      .maybeSingle();
    if (data) {
      setConfig({
        payment_method: data.payment_method || "manual",
        mp_access_token: data.mp_access_token || "",
        mp_public_key: data.mp_public_key || "",
        pix_key: data.pix_key || "",
        pix_name: data.pix_name || "",
        pix_bank: data.pix_bank || "",
        whatsapp: data.whatsapp || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("resort_payment_config")
      .upsert(
        { resort_id: resortId, ...config, updated_at: new Date().toISOString() },
        { onConflict: "resort_id" }
      );
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuração de pagamento salva!" });
    }
  };

  const toggleVisible = (key: string) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SecretInput = ({ id, label, placeholder, value, onChange }: { id: string; label: string; placeholder: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[11px]">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible[id] ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-9 text-xs h-8"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => toggleVisible(id)}
        >
          {visible[id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-xs font-medium flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
          Pagamento
          <span className="text-muted-foreground">
            ({config.payment_method === "mercadopago" ? "Mercado Pago" : config.payment_method === "pix" ? "Pix" : "Manual"})
          </span>
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Método de pagamento</Label>
            <Select value={config.payment_method} onValueChange={v => setConfig(p => ({ ...p, payment_method: v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (WhatsApp)</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.payment_method === "mercadopago" && (
            <div className="space-y-2">
              <SecretInput
                id={`mp_access_${resortId}`}
                label="Access Token"
                placeholder="APP_USR-..."
                value={config.mp_access_token}
                onChange={v => setConfig(p => ({ ...p, mp_access_token: v }))}
              />
              <SecretInput
                id={`mp_public_${resortId}`}
                label="Public Key"
                placeholder="APP_USR-..."
                value={config.mp_public_key}
                onChange={v => setConfig(p => ({ ...p, mp_public_key: v }))}
              />
              <p className="text-[10px] text-muted-foreground">
                Obtenha em{" "}
                <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="underline">
                  MP Developers
                </a>
              </p>
            </div>
          )}

          {config.payment_method === "pix" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Chave Pix</Label>
                <Input className="h-8 text-xs" placeholder="CPF, e-mail, telefone ou aleatória" value={config.pix_key} onChange={e => setConfig(p => ({ ...p, pix_key: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Nome do titular</Label>
                <Input className="h-8 text-xs" placeholder="Nome completo" value={config.pix_name} onChange={e => setConfig(p => ({ ...p, pix_name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Banco</Label>
                <Input className="h-8 text-xs" placeholder="Ex: Nubank" value={config.pix_bank} onChange={e => setConfig(p => ({ ...p, pix_bank: e.target.value }))} />
              </div>
            </div>
          )}

          {(config.payment_method === "manual" || config.payment_method === "pix") && (
            <div className="space-y-1">
              <Label className="text-[11px]">WhatsApp</Label>
              <Input className="h-8 text-xs" placeholder="5562999999999" value={config.whatsapp} onChange={e => setConfig(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          )}

          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={saving}>
            <Save className="w-3 h-3 mr-1" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentConfig;
