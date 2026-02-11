import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, Globe, Trash2 } from "lucide-react";

const FaviconManager = () => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "favicon_url")
      .maybeSingle();
    if (data?.value) setCurrentUrl(data.value);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `favicon.${ext}`;

    // Remove old file if exists
    await supabase.storage.from("site-assets").remove([path]);

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Upsert setting
    const { error: dbError } = await supabase
      .from("site_settings")
      .upsert({ key: "favicon_url", value: publicUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (dbError) {
      toast({ title: "Erro ao salvar", description: dbError.message, variant: "destructive" });
    } else {
      setCurrentUrl(publicUrl);
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) link.href = publicUrl;
      toast({ title: "Favicon atualizado!" });
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    await supabase.from("site_settings").delete().eq("key", "favicon_url");
    setCurrentUrl(null);
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) link.href = "/favicon.ico";
    toast({ title: "Favicon removido!" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4" /> Favicon do Site
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          {currentUrl ? (
            <img src={currentUrl} alt="Favicon atual" className="w-10 h-10 rounded border border-border object-contain bg-muted p-1" />
          ) : (
            <div className="w-10 h-10 rounded border border-dashed border-border flex items-center justify-center bg-muted">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/png,image/ico,image/svg+xml,image/x-icon,image/jpeg"
                className="hidden"
                onChange={e => handleUpload(e.target.files)}
              />
              <Button size="sm" variant="outline" asChild disabled={uploading}>
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  {uploading ? "Enviando..." : "Upload"}
                </span>
              </Button>
            </label>
            {currentUrl && (
              <Button size="sm" variant="ghost" onClick={handleRemove}>
                <Trash2 className="w-3 h-3 mr-1" /> Remover
              </Button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Envie uma imagem PNG, ICO ou SVG. Recomendado: 32×32px ou 64×64px.</p>
      </CardContent>
    </Card>
  );
};

export default FaviconManager;
