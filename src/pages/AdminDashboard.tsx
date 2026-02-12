import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, LogOut, Image, Edit2, Save, X, Upload, ExternalLink } from "lucide-react";
import AmenitySelector from "@/components/AmenitySelector";
import CondoFeatureSelector from "@/components/CondoFeatureSelector";
import ImportantInfoSelector from "@/components/ImportantInfoSelector";
import FaviconManager from "@/components/FaviconManager";

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
}

interface ResortPhoto {
  id: string;
  resort_id: string;
  url: string;
  storage_path: string;
  display_order: number;
  is_cover: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [photos, setPhotos] = useState<Record<string, ResortPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newResort, setNewResort] = useState({ name: "", location: "Caldas Novas, GO", description: "", price_per_night: "", beds: "1", max_guests: "2", tag: "", amenities: [] as string[], condo_features: [] as string[], important_info: [] as string[] });
  const [editForm, setEditForm] = useState<Partial<Resort>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchResorts = async () => {
    const { data } = await supabase.from("resorts").select("*").order("created_at", { ascending: false });
    if (data) setResorts(data as Resort[]);
    setLoading(false);
  };

  const fetchPhotos = async (resortId: string) => {
    const { data } = await supabase.from("resort_photos").select("*").eq("resort_id", resortId).order("display_order");
    if (data) setPhotos(prev => ({ ...prev, [resortId]: data as ResortPhoto[] }));
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  useEffect(() => {
    resorts.forEach(r => fetchPhotos(r.id));
  }, [resorts.length]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleCreate = async () => {
    const { error } = await supabase.from("resorts").insert({
      name: newResort.name,
      location: newResort.location,
      description: newResort.description || null,
      price_per_night: newResort.price_per_night ? parseFloat(newResort.price_per_night) : null,
      beds: parseInt(newResort.beds),
      max_guests: parseInt(newResort.max_guests),
      tag: newResort.tag || null,
      amenities: newResort.amenities,
      condo_features: newResort.condo_features,
      important_info: newResort.important_info,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Resort criado!" });
    setShowNewForm(false);
    setNewResort({ name: "", location: "Caldas Novas, GO", description: "", price_per_night: "", beds: "1", max_guests: "2", tag: "", amenities: [], condo_features: [], important_info: [] });
    fetchResorts();
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("resorts").update(editForm).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Resort atualizado!" });
    setEditingId(null);
    fetchResorts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este resort?")) return;
    // Delete photos from storage first
    const resortPhotos = photos[id] || [];
    for (const photo of resortPhotos) {
      await supabase.storage.from("resort-photos").remove([photo.storage_path]);
    }
    await supabase.from("resorts").delete().eq("id", id);
    toast({ title: "Resort excluído!" });
    fetchResorts();
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

    // Use XMLHttpRequest for progress tracking
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const count = data?.photos?.length || 0;
            toast({ title: `${count} foto(s) enviada(s) com sucesso!` });
          } catch {
            toast({ title: "Fotos enviadas!" });
          }
        } else {
          toast({ title: "Erro no upload", description: "Falha ao enviar fotos", variant: "destructive" });
        }
        resolve();
      });
      xhr.addEventListener('error', () => {
        toast({ title: "Erro no upload", description: "Falha na conexão", variant: "destructive" });
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
    // Remove cover from all photos of this resort
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">
        <h1 className="text-base sm:text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Admin — Resorts
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate("/explore")}>
            <ExternalLink className="w-4 h-4 mr-1" /> Ver Site
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Favicon manager */}
        <FaviconManager />

        {/* New resort form */}
        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Novo Resort</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={newResort.name} onChange={e => setNewResort(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Local</Label>
                  <Input value={newResort.location} onChange={e => setNewResort(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Preço/noite (R$)</Label>
                  <Input type="number" value={newResort.price_per_night} onChange={e => setNewResort(p => ({ ...p, price_per_night: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tag</Label>
                  <Input value={newResort.tag} onChange={e => setNewResort(p => ({ ...p, tag: e.target.value }))} placeholder="Ex: Superhost" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quartos</Label>
                  <Input type="number" value={newResort.beds} onChange={e => setNewResort(p => ({ ...p, beds: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hóspedes</Label>
                  <Input type="number" value={newResort.max_guests} onChange={e => setNewResort(p => ({ ...p, max_guests: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea rows={4} value={newResort.description} onChange={e => setNewResort(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o resort, instalações, diferenciais..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Comodidades</Label>
                <AmenitySelector selected={newResort.amenities} onChange={amenities => setNewResort(p => ({ ...p, amenities }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">O que o lugar oferece</Label>
                <CondoFeatureSelector selected={newResort.condo_features} onChange={condo_features => setNewResort(p => ({ ...p, condo_features }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Informações Importantes</Label>
                <ImportantInfoSelector selected={newResort.important_info} onChange={important_info => setNewResort(p => ({ ...p, important_info }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>Criar</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {resorts.length === 0 && !showNewForm && (
          <div className="text-center text-muted-foreground py-20">
            Nenhum resort cadastrado. Clique em "Novo Resort" para começar.
          </div>
        )}

        {/* Resort list */}
        {resorts.map(resort => (
          <Card key={resort.id}>
            <CardContent className="pt-6 space-y-4">
              {editingId === resort.id ? (
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
                      <Input type="number" value={editForm.price_per_night ?? ""} onChange={e => setEditForm(p => ({ ...p, price_per_night: parseFloat(e.target.value) }))} />
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
                    <Textarea rows={4} value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o resort, instalações, diferenciais..." />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Comodidades</Label>
                    <AmenitySelector selected={editForm.amenities ?? []} onChange={amenities => setEditForm(p => ({ ...p, amenities }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">O que o lugar oferece</Label>
                    <CondoFeatureSelector selected={editForm.condo_features ?? []} onChange={condo_features => setEditForm(p => ({ ...p, condo_features }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Informações Importantes</Label>
                    <ImportantInfoSelector selected={editForm.important_info ?? []} onChange={important_info => setEditForm(p => ({ ...p, important_info }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(resort.id)}><Save className="w-3 h-3 mr-1" /> Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3 h-3 mr-1" /> Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{resort.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{resort.location} · R${resort.price_per_night}/noite</p>
                    <p className="text-xs text-muted-foreground">{resort.beds} quartos · {resort.max_guests} hóspedes</p>
                    {resort.tag && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">{resort.tag}</span>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(resort.id); setEditForm(resort); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(resort.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Photos section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Image className="w-3 h-3" /> Fotos ({(photos[resort.id] || []).length})
                  </span>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handlePhotoUpload(resort.id, e.target.files)}
                    />
                    <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Upload className="w-3 h-3" />
                      {uploadingFor === resort.id ? "Enviando..." : "Upload"}
                    </span>
                  </label>
                </div>
                {/* Progress bar */}
                {uploadingFor === resort.id && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">{uploadProgress}% enviado</p>
                  </div>
                )}
                {(photos[resort.id] || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {(photos[resort.id] || []).map(photo => (
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
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;
