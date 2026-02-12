import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Upload, Smartphone, Palette } from "lucide-react";

const LANDING_KEYS = [
  "landing_badge",
  "landing_label",
  "landing_title",
  "landing_subtitle",
  "landing_button_text",
  "landing_button_color",
  "landing_button_text_color",
  "landing_bg_url",
  "landing_logo_url",
  "landing_logo_subtitle",
];

const LandingPageManager = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", LANDING_KEYS);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(d => { map[d.key] = d.value; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const key of LANDING_KEYS) {
      const value = settings[key] ?? "";
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
    toast({ title: "Página inicial salva!" });
    setSaving(false);
  };

  const handleBgUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const file = files[0];
    const ext = file.name.split(".").pop();
    const path = `landing/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file);

    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    const url = urlData.publicUrl;
    update("landing_bg_url", url);
    await saveSettingKey("landing_bg_url", url);
    toast({ title: "Imagem de fundo enviada e salva!" });
    setUploading(false);
  };

  const saveSettingKey = async (key: string, value: string) => {
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
  };

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingLogo(true);
    const file = files[0];
    const ext = file.name.split(".").pop();
    const path = `landing/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    const url = urlData.publicUrl;
    update("landing_logo_url", url);
    await saveSettingKey("landing_logo_url", url);
    toast({ title: "Logomarca enviada e salva!" });
    setUploadingLogo(false);
  };

  const bgPreview = settings.landing_bg_url || "";
  const logoPreview = settings.landing_logo_url || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Smartphone className="w-4 h-4 text-primary" />
          Página Inicial (Landing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Background image */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold flex items-center gap-1.5">
            🖼️ Imagem de fundo
          </Label>
          <div className="flex items-center gap-3">
            {bgPreview && (
              <div className="w-24 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                <img src={bgPreview} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleBgUpload(e.target.files)}
              />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Enviando..." : bgPreview ? "Trocar imagem" : "Enviar imagem"}
              </span>
            </label>
          </div>
          {!bgPreview && (
            <p className="text-[10px] text-muted-foreground">Usando imagem padrão. Envie uma para personalizar.</p>
          )}
        </div>

        {/* Logo upload */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold flex items-center gap-1.5">
            🏷️ Logomarca (centralizada acima dos textos)
          </Label>
          <div className="flex items-center gap-3">
            {logoPreview && (
              <div className="w-20 h-14 rounded-xl overflow-hidden border border-border shrink-0 bg-black/10 flex items-center justify-center p-1">
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleLogoUpload(e.target.files)}
              />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploadingLogo ? "Enviando..." : logoPreview ? "Trocar logo" : "Enviar logo"}
              </span>
            </label>
            {logoPreview && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-destructive h-8"
                onClick={async () => { update("landing_logo_url", ""); await saveSettingKey("landing_logo_url", ""); toast({ title: "Logo removida!" }); }}
              >
                Remover
              </Button>
            )}
          </div>
          <div className="space-y-1 mt-2">
            <Label className="text-[11px] font-semibold">Subtítulo da logomarca</Label>
            <Input
              value={settings.landing_logo_subtitle ?? ""}
              onChange={e => update("landing_logo_subtitle", e.target.value)}
              className="h-9 text-sm rounded-xl"
              placeholder="Ex: J G Locações"
            />
          </div>
        </div>

        {/* Texts */}
        <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-3">
          <p className="text-xs font-bold text-foreground">📝 Textos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Badge de localização</Label>
              <Input
                value={settings.landing_badge ?? ""}
                onChange={e => update("landing_badge", e.target.value)}
                className="h-9 text-sm rounded-xl"
                placeholder="Ex: Caldas Novas, GO"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Label (acima do título)</Label>
              <Input
                value={settings.landing_label ?? ""}
                onChange={e => update("landing_label", e.target.value)}
                className="h-9 text-sm rounded-xl"
                placeholder="Ex: Hotéis & Resorts"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Título principal</Label>
            <Textarea
              value={settings.landing_title ?? ""}
              onChange={e => update("landing_title", e.target.value)}
              className="text-sm rounded-xl min-h-[60px]"
              placeholder="Ex: Encontre a estadia perfeita para você"
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Subtítulo</Label>
            <Textarea
              value={settings.landing_subtitle ?? ""}
              onChange={e => update("landing_subtitle", e.target.value)}
              className="text-sm rounded-xl min-h-[50px]"
              placeholder="Ex: Reserve em segundos..."
              rows={2}
            />
          </div>
        </div>

        {/* Button config */}
        <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-3">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Botão de ação
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Texto do botão</Label>
              <Input
                value={settings.landing_button_text ?? ""}
                onChange={e => update("landing_button_text", e.target.value)}
                className="h-9 text-sm rounded-xl"
                placeholder="Ex: Explorar agora"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Cor do botão</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.landing_button_color || "#ffffff"}
                  onChange={e => update("landing_button_color", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={settings.landing_button_color ?? "#ffffff"}
                  onChange={e => update("landing_button_color", e.target.value)}
                  className="h-9 text-sm rounded-xl flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Cor do texto</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.landing_button_text_color || "#000000"}
                  onChange={e => update("landing_button_text_color", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={settings.landing_button_text_color ?? "#000000"}
                  onChange={e => update("landing_button_text_color", e.target.value)}
                  className="h-9 text-sm rounded-xl flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-muted-foreground">Preview:</span>
            <span
              className="px-5 py-2 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: settings.landing_button_color || "#ffffff",
                color: settings.landing_button_text_color || "#000000",
              }}
            >
              {settings.landing_button_text || "Explorar agora"}
            </span>
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Salvando..." : "Salvar página inicial"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LandingPageManager;
