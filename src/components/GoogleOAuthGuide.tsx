import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Save, Loader2, ChevronDown, ChevronUp, Copy, CheckCircle2 } from "lucide-react";

const CALLBACK_URL = "https://pchxmtkhqgjlevvzgqoi.supabase.co/auth/v1/callback";

const steps = [
  {
    title: "Criar projeto no Google Cloud",
    content: (
      <div className="space-y-1.5">
        <p>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></p>
        <p>Clique em <strong>"Selecionar projeto"</strong> → <strong>"Novo Projeto"</strong></p>
        <p>Dê um nome (ex: "Meu Resort") e clique em <strong>"Criar"</strong></p>
      </div>
    ),
  },
  {
    title: "Configurar Tela de Consentimento",
    content: (
      <div className="space-y-1.5">
        <p>No menu lateral, vá em <strong>APIs e serviços → Tela de consentimento OAuth</strong></p>
        <p>Escolha <strong>"Externo"</strong> e clique em <strong>"Criar"</strong></p>
        <p>Preencha o nome do app e e-mail de suporte</p>
        <p>Em <strong>"Domínios autorizados"</strong>, adicione: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">pchxmtkhqgjlevvzgqoi.supabase.co</code></p>
        <p>Adicione os escopos: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">email</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">profile</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">openid</code></p>
      </div>
    ),
  },
  {
    title: "Criar Credenciais OAuth",
    content: (
      <div className="space-y-1.5">
        <p>Vá em <strong>APIs e serviços → Credenciais</strong></p>
        <p>Clique em <strong>"Criar credenciais" → "ID do cliente OAuth"</strong></p>
        <p>Tipo de aplicativo: <strong>"Aplicativo da Web"</strong></p>
        <p>Em <strong>"Origens JavaScript autorizadas"</strong>, adicione a URL do seu site</p>
        <p>Em <strong>"URIs de redirecionamento autorizados"</strong>, adicione:</p>
        <code className="block bg-muted px-2 py-1.5 rounded text-xs break-all">{CALLBACK_URL}</code>
        <p>Clique em <strong>"Criar"</strong> e copie o <strong>Client ID</strong> e o <strong>Client Secret</strong></p>
      </div>
    ),
  },
  {
    title: "Configurar no Supabase",
    content: (
      <div className="space-y-1.5">
        <p>Acesse o <a href="https://supabase.com/dashboard/project/pchxmtkhqgjlevvzgqoi/auth/providers" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline inline-flex items-center gap-1">Painel do Supabase <ExternalLink className="w-3 h-3" /></a></p>
        <p>Vá em <strong>Authentication → Providers → Google</strong></p>
        <p>Ative o provider e cole o <strong>Client ID</strong> e <strong>Client Secret</strong></p>
        <p>Verifique se a <strong>Callback URL</strong> está correta (mostrada abaixo)</p>
        <p>Salve as alterações</p>
      </div>
    ),
  },
  {
    title: "Configurar URLs no Supabase",
    content: (
      <div className="space-y-1.5">
        <p>Ainda no Supabase, vá em <strong>Authentication → URL Configuration</strong></p>
        <p>Em <strong>"Site URL"</strong>, coloque a URL do seu site publicado</p>
        <p>Em <strong>"Redirect URLs"</strong>, adicione a URL do site também</p>
        <p>Isso garante que o login redirecione corretamente após autenticar</p>
      </div>
    ),
  },
];

const GoogleOAuthGuide = () => {
  const [clientId, setClientId] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["google_client_id", "google_site_url"]);

    if (data) {
      data.forEach((s) => {
        if (s.key === "google_client_id") setClientId(s.value);
        if (s.key === "google_site_url") setSiteUrl(s.value);
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of [
        ["google_client_id", clientId],
        ["google_site_url", siteUrl],
      ]) {
        await supabase.from("site_settings").upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      }
      toast({ title: "Salvo!", description: "Referências do Google OAuth salvas." });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyCallback = () => {
    navigator.clipboard.writeText(CALLBACK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Login com Google — Configuração
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Steps accordion */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Passo a passo</p>
          {steps.map((step, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {step.title}
                </span>
                {expandedStep === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {expandedStep === i && (
                <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed">
                  {step.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Callback URL */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Callback URL (copie para o Google Console)</Label>
          <div className="flex gap-2">
            <Input value={CALLBACK_URL} readOnly className="text-xs bg-muted font-mono" />
            <Button variant="outline" size="sm" onClick={copyCallback} className="shrink-0 gap-1.5">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* Reference fields */}
        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referência (anotações)</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Google Client ID</Label>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Ex: 123456789.apps.googleusercontent.com"
              className="text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL do Site</Label>
            <Input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://meusite.com"
              className="text-xs"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} size="sm" className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar referências
        </Button>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          ⚠️ O Client ID e Secret devem ser configurados diretamente no{" "}
          <a href="https://supabase.com/dashboard/project/pchxmtkhqgjlevvzgqoi/auth/providers" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            painel do Supabase
          </a>{" "}
          para que o login funcione. Os campos acima servem apenas como anotação.
        </p>
      </CardContent>
    </Card>
  );
};

export default GoogleOAuthGuide;
