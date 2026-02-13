import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Search, Copy, CheckCircle2, ExternalLink, Code, FileText, BarChart3, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSEO = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [gaId, setGaId] = useState("");
  const [metaTag, setMetaTag] = useState("");
  const [savingGa, setSavingGa] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const siteUrl = window.location.origin;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["ga_measurement_id", "google_site_verification"]);
      if (data) {
        data.forEach(s => {
          if (s.key === "ga_measurement_id") setGaId(s.value);
          if (s.key === "google_site_verification") setMetaTag(s.value);
        });
      }
      setLoaded(true);
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
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
    setLoading(false);
    toast({ title: "Salvo!", description: "Configuração atualizada com sucesso." });
  };

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemapindex.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${siteUrl}/explore</loc><priority>0.9</priority></url>
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({ title: "Copiado!", description: `${label} copiado para a área de transferência` });
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: "Acesse o Google Search Console",
      description: "O Search Console é a ferramenta gratuita do Google que mostra se o seu site está aparecendo nas buscas. Acesse com sua conta Google.",
      link: "https://search.google.com/search-console/about",
    },
    {
      step: 2,
      title: "Adicione o seu site",
      description: 'Clique em "Adicionar propriedade", escolha "Prefixo do URL" e cole o endereço do seu site abaixo:',
      copyValue: siteUrl,
      copyLabel: "URL do site",
    },
    {
      step: 3,
      title: "Confirme que o site é seu",
      description: 'O Google vai pedir uma confirmação. Escolha "Tag HTML", copie apenas o código que ele mostrar e cole na seção "Meta Tag de Verificação" mais abaixo nesta página.',
    },
    {
      step: 4,
      title: "Diga ao Google quais páginas indexar",
      description: 'Após verificar, vá no menu "Sitemaps" dentro do Search Console. Cole o endereço abaixo e clique em "Enviar". Isso avisa ao Google todas as páginas que existem no seu site para ele indexar.',
      copyValue: `${siteUrl}/sitemap.xml`,
      copyLabel: "URL do Sitemap",
    },
  ];

  const gaAnalyticsUrl = gaId
    ? `https://analytics.google.com/analytics/web/#/p${gaId.replace("G-", "")}/reports/intelligenthome`
    : "https://analytics.google.com/";

  if (!loaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            SEO & Google
          </h1>
        </div>

        {/* Google Analytics - PRIMEIRO */}
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Google Analytics (GA4)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Google Analytics permite rastrear <strong>visitas reais</strong> ao seu site, incluindo:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "👥", text: "Quantidade de visitantes" },
                { icon: "🗺️", text: "De onde vêm (cidade/estado)" },
                { icon: "📱", text: "Dispositivo usado" },
                { icon: "📊", text: "Páginas mais visitadas" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[11px] text-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Step by step */}
            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground">Como configurar:</p>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Acesse o Google Analytics e crie uma conta/propriedade para o seu site.
                  </p>
                  <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline mt-1">
                    <ExternalLink className="w-3 h-3" /> Abrir Google Analytics
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Copie o <strong>ID de Medição</strong> (formato: G-XXXXXXXXXX) das configurações do fluxo de dados.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Cole o ID abaixo e salve. O rastreamento será ativado automaticamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ID de Medição (GA4)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="G-XXXXXXXXXX"
                  className="font-mono text-xs"
                  value={gaId}
                  onChange={e => setGaId(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={savingGa || !gaId}
                  onClick={() => saveSetting("ga_measurement_id", gaId, setSavingGa)}
                >
                  {savingGa ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </div>

            {gaId && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-foreground">Analytics ativo!</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  O rastreamento está funcionando. Para ver os dados completos (visitas, localização geográfica, mapa do Brasil), acesse o painel do Google Analytics:
                </p>
                <div className="flex flex-col gap-1.5">
                  <a href={gaAnalyticsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                    <BarChart3 className="w-3.5 h-3.5" /> Ver Dashboard Completo
                  </a>
                  <a href={`https://analytics.google.com/analytics/web/#/report/visitors-geo/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                    <MapPin className="w-3.5 h-3.5" /> Ver Mapa de Visitantes (Cidades/Estados)
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Console Steps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Cadastrar no Google Search Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {steps.map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                  {s.copyValue && (
                    <button
                      onClick={() => handleCopy(s.copyValue!, s.copyLabel!)}
                      className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-xs font-mono text-foreground hover:bg-muted/80 transition-colors w-full"
                    >
                      <code className="flex-1 text-left truncate">{s.copyValue}</code>
                      {copied === s.copyLabel ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  )}
                  {s.link && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <ExternalLink className="w-3 h-3" /> Abrir Google Search Console
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meta tag verification */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              Meta Tag de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Cole aqui o <strong>content</strong> da meta tag fornecida pelo Google (apenas o valor, sem a tag completa).
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: dG9wIHNlY3JldA..."
                className="font-mono text-xs"
                value={metaTag}
                onChange={e => setMetaTag(e.target.value)}
              />
              <Button
                size="sm"
                disabled={savingMeta || !metaTag}
                onClick={() => saveSetting("google_site_verification", metaTag, setSavingMeta)}
              >
                {savingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Sitemap & Robots.txt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Sitemap explanation */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground">📄 Para que serve o Sitemap?</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pense no sitemap como um <strong>mapa do seu site</strong> para o Google. Ele lista todas as páginas que existem para que o Google consiga encontrar e mostrar seu site nas buscas. <strong>Você não precisa fazer nada com esse código</strong> — ele já está no seu site automaticamente. Basta copiar o endereço do Passo 4 acima e colar no Google Search Console.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Conteúdo do sitemap.xml (apenas referência)</Label>
                <button onClick={() => handleCopy(sitemapXml, "Sitemap")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  {copied === "Sitemap" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-[10px] font-mono text-foreground overflow-auto max-h-32">{sitemapXml}</pre>
            </div>

            {/* Robots.txt explanation */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground">🤖 Para que serve o Robots.txt?</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                O robots.txt é como um <strong>aviso na porta do site</strong> dizendo ao Google: "pode entrar e ver tudo". Sem ele, o Google pode não saber se tem permissão para indexar suas páginas. <strong>Ele já está configurado automaticamente</strong> — não precisa fazer nada. O conteúdo abaixo é apenas para sua referência.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Conteúdo do robots.txt (apenas referência)</Label>
                <button onClick={() => handleCopy(robotsTxt, "Robots")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  {copied === "Robots" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-[10px] font-mono text-foreground overflow-auto max-h-24">{robotsTxt}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSEO;
