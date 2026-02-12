import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Eye, EyeOff, Save, QrCode, MessageCircle, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentConfigProps {
  resortId: string;
}

const PaymentConfig = ({ resortId }: PaymentConfigProps) => {
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
    pix_discount_percent: 0,
    checkin_time: "14:00",
    checkout_time: "10:00",
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
        pix_discount_percent: data.pix_discount_percent || 0,
        checkin_time: (data as any).checkin_time || "14:00",
        checkout_time: (data as any).checkout_time || "10:00",
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

  const methods = [
    { value: "manual", label: "WhatsApp", icon: MessageCircle, color: "hsl(142, 70%, 45%)" },
    { value: "pix", label: "Pix", icon: QrCode, color: "hsl(174, 70%, 40%)" },
    { value: "mercadopago", label: "Mercado Pago", icon: CreditCard, color: "hsl(210, 80%, 55%)" },
  ];

  const SecretInput = ({ id, label, placeholder, value, onChange }: { id: string; label: string; placeholder: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible[id] ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-9 text-sm"
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => toggleVisible(id)}
        >
          {visible[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <CreditCard className="w-4 h-4 text-primary" />
          Configuração de Pagamento
        </h3>
      </div>

      {/* Payment method tabs */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {methods.map(m => {
            const Icon = m.icon;
            const active = config.payment_method === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setConfig(p => ({ ...p, payment_method: m.value }))}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium",
                  active
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <Icon className="w-5 h-5" style={active ? { color: m.color } : undefined} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Mercado Pago fields */}
        {config.payment_method === "mercadopago" && (
          <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-foreground">Credenciais do Mercado Pago</span>
            </div>
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
            <p className="text-[11px] text-muted-foreground">
              Obtenha suas credenciais em{" "}
              <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                MP Developers
              </a>
            </p>
          </div>
        )}

        {/* Pix fields */}
        {config.payment_method === "pix" && (
          <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-semibold text-foreground">Dados do Pix</span>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Chave Pix</Label>
              <Input className="text-sm" placeholder="CPF, e-mail, telefone ou aleatória" value={config.pix_key} onChange={e => setConfig(p => ({ ...p, pix_key: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Nome do titular</Label>
              <Input className="text-sm" placeholder="Nome completo" value={config.pix_name} onChange={e => setConfig(p => ({ ...p, pix_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Banco</Label>
              <Input className="text-sm" placeholder="Ex: Nubank" value={config.pix_bank} onChange={e => setConfig(p => ({ ...p, pix_bank: e.target.value }))} />
            </div>
          </div>
        )}

        {/* WhatsApp - shown for manual and pix */}
        {(config.payment_method === "manual" || config.payment_method === "pix") && (
          <div className="space-y-1">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-green-500" />
              WhatsApp para contato
            </Label>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center h-9 px-2.5 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground select-none">+55</span>
              <Input
                className="text-sm rounded-l-none"
                placeholder="(31) 97352-1501"
                inputMode="numeric"
                value={(() => {
                  const d = config.whatsapp.replace(/^55/, "").replace(/\D/g, "").slice(0, 11);
                  if (d.length <= 2) return d.length ? `(${d}` : "";
                  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
                  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
                })()}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setConfig(p => ({ ...p, whatsapp: `55${digits}` }));
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">O código +55 (Brasil) já está incluído</p>
          </div>
        )}

        {/* Pix discount */}
        <div className="space-y-1">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            🏷️ Desconto Pix à vista (%)
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            className="text-sm"
            placeholder="Ex: 10"
            value={config.pix_discount_percent || ""}
            onChange={e => setConfig(p => ({ ...p, pix_discount_percent: Number(e.target.value) }))}
          />
          <p className="text-[11px] text-muted-foreground">Percentual de desconto exibido para pagamento à vista via Pix</p>
        </div>

        {/* Check-in / Check-out times */}
        <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border">
          <span className="text-xs font-semibold text-foreground">⏰ Horários</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Check-in</Label>
              <Input
                type="time"
                className="text-sm"
                value={config.checkin_time}
                onChange={e => setConfig(p => ({ ...p, checkin_time: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Check-out</Label>
              <Input
                type="time"
                className="text-sm"
                value={config.checkout_time}
                onChange={e => setConfig(p => ({ ...p, checkout_time: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar configuração de pagamento"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentConfig;
