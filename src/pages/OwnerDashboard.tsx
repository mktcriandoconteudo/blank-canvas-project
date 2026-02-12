import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Edit2, Save, X, Image, Upload, Trash2, Home } from "lucide-react";
import PricingPlansManager from "@/components/PricingPlansManager";
import BlockedDatesManager from "@/components/BlockedDatesManager";
import OptionsManager from "@/components/OptionsManager";

interface Resort {
  id: string;
  name: string;
  location: string;
  description: string | null;
  price_per_night: number | null;
  beds: number;
  max_guests: number;
  tag: string | null;
  is_active: boolean;
  amenities: string[];
  condo_features: string[];
  important_info: string[];
  parent_id: string | null;
}

interface ResortPhoto {
  id: string;
  resort_id: string;
  url: string;
  storage_path: string;
  display_order: number;
  is_cover: boolean;
}

const formatCurrencyInput = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  const cents = parseInt(numbers || "0", 10);
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const parseCurrencyInput = (formatted: string): number => {
  const numbers = formatted.replace(/\D/g, "");
  return parseInt(numbers || "0", 10) / 100;
};
const numberToCurrencyDisplay = (value: number | null): string => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const OwnerDashboard = () => {
  const [apartments, setApartments] = useState<Resort[]>([]);
  const [photos, setPhotos] = useState<Record<string, ResortPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resort>>({});
  const [editPriceDisplay, setEditPriceDisplay] = useState("");
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchMyApartments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("resorts")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setApartments(data as Resort[]);
    setLoading(false);
  };

  const fetchPhotos = async (resortId: string) => {
    const { data } = await supabase.from("resort_photos").select("*").eq("resort_id", resortId).order("display_order");
    if (data) setPhotos(prev => ({ ...prev, [resortId]: data as ResortPhoto[] }));
  };

  useEffect(() => { fetchMyApartments(); }, []);
  useEffect(() => { apartments.forEach(a => fetchPhotos(a.id)); }, [apartments.length]);

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("resorts").update(editForm).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Atualizado!" });
    setEditingId(null);
    fetchMyApartments();
  };

  const handlePhotoUpload = async (resortId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingFor(resortId);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resort_id', resortId);
    for (const file of Array.from(files)) {
      formData.append('files', file);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast({ title: "Fotos enviadas!" });
        } else {
          toast({ title: "Erro no upload", variant: "destructive" });
        }
        resolve();
      });
      xhr.addEventListener('error', () => {
        toast({ title: "Erro na conexão", variant: "destructive" });
        resolve();
      });

      const url = `https://pchxmtkhqgjlevvzgqoi.supabase.co/functions/v1/upload-photos`;
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjaHhtdGtocWdqbGV2dnpncW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzQ5MDgsImV4cCI6MjA4NjQxMDkwOH0.y1fq9t747FZIApHgDpE9PNHZLQTVDuPi4ICBnpPXv9M');
      xhr.send(formData);
    });

    setUploadingFor(null);
    setUploadProgress(0);
    fetchPhotos(resortId);
  };

  const handleDeletePhoto = async (photo: ResortPhoto) => {
    await supabase.storage.from("resort-photos").remove([photo.storage_path]);
    await supabase.from("resort_photos").delete().eq("id", photo.id);
    toast({ title: "Foto removida!" });
    fetchPhotos(photo.resort_id);
  };

  const handleSetCover = async (photo: ResortPhoto) => {
    await supabase.from("resort_photos").update({ is_cover: false }).eq("resort_id", photo.resort_id);
    await supabase.from("resort_photos").update({ is_cover: true }).eq("id", photo.id);
    toast({ title: "Capa definida!" });
    fetchPhotos(photo.resort_id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        <h1 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Home className="w-5 h-5 text-primary" />
          Meus Apartamentos
        </h1>

        {apartments.length === 0 && (
          <p className="text-center text-muted-foreground py-20">Nenhum apartamento vinculado à sua conta.</p>
        )}

        {apartments.map(apt => (
          <Card key={apt.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {apt.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingId === apt.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input value={editForm.name ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Local</Label>
                      <Input value={editForm.location ?? ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço/noite</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                        <Input
                          value={editPriceDisplay}
                          onChange={e => {
                            const formatted = formatCurrencyInput(e.target.value);
                            setEditPriceDisplay(formatted);
                            setEditForm(p => ({ ...p, price_per_night: parseCurrencyInput(formatted) }));
                          }}
                          className="pl-10"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tag</Label>
                      <Input value={editForm.tag ?? ""} onChange={e => setEditForm(p => ({ ...p, tag: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quartos</Label>
                      <Input type="number" value={editForm.beds ?? 1} onChange={e => setEditForm(p => ({ ...p, beds: parseInt(e.target.value) }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hóspedes</Label>
                      <Input type="number" value={editForm.max_guests ?? 2} onChange={e => setEditForm(p => ({ ...p, max_guests: parseInt(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea rows={3} value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => handleUpdate(apt.id)}>
                      <Save className="w-4 h-4 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{apt.location} · R${apt.price_per_night}/noite</p>
                    <p className="text-xs text-muted-foreground">{apt.beds} quartos · {apt.max_guests} hóspedes</p>
                    {apt.tag && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">{apt.tag}</span>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(apt.id); setEditForm(apt); setEditPriceDisplay(numberToCurrencyDisplay(apt.price_per_night)); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Image className="w-3 h-3" /> Fotos ({(photos[apt.id] || []).length})
                  </span>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(apt.id, e.target.files)} />
                    <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Upload className="w-3 h-3" />
                      {uploadingFor === apt.id ? "Enviando..." : "Upload"}
                    </span>
                  </label>
                </div>
                {uploadingFor === apt.id && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">{uploadProgress}% enviado</p>
                  </div>
                )}
                {(photos[apt.id] || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {(photos[apt.id] || []).map(photo => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        {photo.is_cover && (
                          <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Capa</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {!photo.is_cover && (
                            <button onClick={() => handleSetCover(photo)} className="text-[10px] text-white bg-white/20 px-2 py-1 rounded">Capa</button>
                          )}
                          <button onClick={() => handleDeletePhoto(photo)} className="text-[10px] text-white bg-destructive/80 px-2 py-1 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <PricingPlansManager resortId={apt.id} />
              <BlockedDatesManager resortId={apt.id} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <OptionsManager category="amenity" title="Comodidades" resortId={apt.id} />
                <OptionsManager category="condo_feature" title="O que o lugar oferece" resortId={apt.id} />
                <OptionsManager category="important_info" title="Informações Importantes" resortId={apt.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
