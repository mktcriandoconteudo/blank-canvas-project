import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Search, Copy, CheckCircle2, ExternalLink, Code, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminSEO = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const siteUrl = window.location.origin;

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
      description: "Entre no Google Search Console com sua conta Google.",
      link: "https://search.google.com/search-console/about",
    },
    {
      step: 2,
      title: "Adicione a propriedade",
      description: `Clique em "Adicionar propriedade" e selecione "Prefixo do URL". Cole a URL do seu site:`,
      copyValue: siteUrl,
      copyLabel: "URL do site",
    },
    {
      step: 3,
      title: "Verifique a propriedade",
      description: "Escolha o método de verificação por meta tag HTML. Copie a meta tag fornecida pelo Google e cole no campo abaixo.",
    },
    {
      step: 4,
      title: "Envie o Sitemap",
      description: `No Search Console, vá em "Sitemaps" e envie a URL do sitemap:`,
      copyValue: `${siteUrl}/sitemap.xml`,
      copyLabel: "URL do Sitemap",
    },
  ];

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

        {/* Steps */}
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
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir Google Search Console
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
              Cole aqui a meta tag fornecida pelo Google para verificar a propriedade. Ela será adicionada ao cabeçalho do site.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Meta Tag do Google</Label>
              <Input placeholder='<meta name="google-site-verification" content="..." />' className="font-mono text-xs" />
            </div>
            <Button size="sm" className="bg-primary">
              Salvar Meta Tag
            </Button>
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">sitemap.xml</Label>
                <button
                  onClick={() => handleCopy(sitemapXml, "Sitemap")}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  {copied === "Sitemap" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-[10px] font-mono text-foreground overflow-auto max-h-32">
                {sitemapXml}
              </pre>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">robots.txt</Label>
                <button
                  onClick={() => handleCopy(robotsTxt, "Robots")}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  {copied === "Robots" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
              <pre className="bg-muted rounded-lg p-3 text-[10px] font-mono text-foreground overflow-auto max-h-24">
                {robotsTxt}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Google Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Google Analytics (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Para rastrear visitas reais ao site, configure o Google Analytics. Cole o ID de medição abaixo.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">ID de Medição (GA4)</Label>
              <Input placeholder="G-XXXXXXXXXX" className="font-mono text-xs" />
            </div>
            <Button size="sm" className="bg-primary">
              Salvar Analytics
            </Button>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Abrir Google Analytics
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSEO;
