import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save, X, Upload, ImageIcon, GripVertical, Eye, EyeOff } from "lucide-react";

interface HeroSlide {
  id: string;
  image_url: string;
  storage_path: string | null;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
}

const HeroBannerManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", subtitle: "" });
  const [uploading, setUploading] = useState(false);
  const [mainTitle, setMainTitle] = useState("");
  const [mainSubtitle, setMainSubtitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .order("display_order");
    if (data) setSlides(data as HeroSlide[]);
  };

  const fetchMainTitle = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero_main_title", "hero_main_subtitle"]);
    if (data) {
      const titleRow = data.find(d => d.key === "hero_main_title");
      const subtitleRow = data.find(d => d.key === "hero_main_subtitle");
      if (titleRow) setMainTitle(titleRow.value);
      if (subtitleRow) setMainSubtitle(subtitleRow.value);
    }
  };

  useEffect(() => {
    fetchSlides();
    fetchMainTitle();
  }, []);

  const handleSaveMainTitle = async () => {
    setSavingTitle(true);
    const upserts = [
      { key: "hero_main_title", value: mainTitle },
      { key: "hero_main_subtitle", value: mainSubtitle },
    ];
    for (const item of upserts) {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", item.key)
        .maybeSingle();
      if (existing) {
        await supabase.from("site_settings").update({ value: item.value }).eq("key", item.key);
      } else {
        await supabase.from("site_settings").insert(item);
      }
    }
    toast({ title: "Título principal salvo!" });
    setSavingTitle(false);
  };

  const handleUploadSlide = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, file);

      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);

      const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) : 0;

      await supabase.from("hero_slides").insert({
        image_url: urlData.publicUrl,
        storage_path: path,
        title: "",
        subtitle: "",
        display_order: maxOrder + 1,
        is_active: true,
      });
    }

    toast({ title: "Imagem(ns) adicionada(s)!" });
    setUploading(false);
    fetchSlides();
  };

  const handleUpdateSlide = async (id: string) => {
    await supabase.from("hero_slides").update({
      title: editForm.title,
      subtitle: editForm.subtitle,
    }).eq("id", id);
    toast({ title: "Slide atualizado!" });
    setEditingId(null);
    fetchSlides();
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await supabase.from("hero_slides").update({ is_active: !slide.is_active }).eq("id", slide.id);
    fetchSlides();
  };

  const handleDeleteSlide = async (slide: HeroSlide) => {
    if (!confirm("Excluir este slide?")) return;
    if (slide.storage_path) {
      await supabase.storage.from("site-assets").remove([slide.storage_path]);
    }
    await supabase.from("hero_slides").delete().eq("id", slide.id);
    toast({ title: "Slide excluído!" });
    fetchSlides();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <ImageIcon className="w-4 h-4 text-primary" />
          Banner Rotativo (Explore)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main title editor */}
        <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-3">
          <p className="text-xs font-bold text-foreground">📌 Título Principal (acima do banner)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Título</Label>
              <Input
                value={mainTitle}
                onChange={e => setMainTitle(e.target.value)}
                placeholder="Ex: Descubra Caldas Novas"
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Subtítulo</Label>
              <Input
                value={mainSubtitle}
                onChange={e => setMainSubtitle(e.target.value)}
                placeholder="Ex: As melhores hospedagens"
                className="h-9 text-sm rounded-xl"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold"
            onClick={handleSaveMainTitle}
            disabled={savingTitle}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {savingTitle ? "Salvando..." : "Salvar título"}
          </Button>
        </div>

        {/* Upload new slides */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">
            Slides ({slides.length})
          </h4>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleUploadSlide(e.target.files)}
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Enviando..." : "Adicionar imagens"}
            </span>
          </label>
        </div>

        {/* Slides list */}
        {slides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum slide cadastrado</p>
            <p className="text-[10px]">Adicione imagens para o banner rotativo</p>
          </div>
        )}

        <div className="grid gap-3">
          {slides.map(slide => (
            <div
              key={slide.id}
              className={`relative flex gap-3 p-3 rounded-xl border transition-all ${
                slide.is_active
                  ? "bg-card border-border"
                  : "bg-muted/30 border-border/50 opacity-60"
              }`}
            >
              {/* Image preview */}
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              {editingId === slide.id ? (
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Título</Label>
                    <Input
                      value={editForm.title}
                      onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                      className="h-8 text-xs rounded-lg"
                      placeholder="Título do slide"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Subtítulo</Label>
                    <Input
                      value={editForm.subtitle}
                      onChange={e => setEditForm(p => ({ ...p, subtitle: e.target.value }))}
                      className="h-8 text-xs rounded-lg"
                      placeholder="Subtítulo do slide"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-[11px] rounded-lg bg-primary text-primary-foreground" onClick={() => handleUpdateSlide(slide.id)}>
                      <Save className="w-3 h-3 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {slide.title || <span className="text-muted-foreground italic">Sem título</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {slide.subtitle || <span className="italic">Sem subtítulo</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Ordem: {slide.display_order} · {slide.is_active ? "Ativo" : "Inativo"}
                  </p>
                </div>
              )}

              {/* Actions */}
              {editingId !== slide.id && (
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg hover:bg-primary/10"
                    onClick={() => {
                      setEditingId(slide.id);
                      setEditForm({ title: slide.title, subtitle: slide.subtitle });
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => handleToggleActive(slide)}
                  >
                    {slide.is_active ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg hover:bg-destructive/10"
                    onClick={() => handleDeleteSlide(slide)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroBannerManager;
