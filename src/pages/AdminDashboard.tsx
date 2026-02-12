import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Edit2, Save, X, Upload, Building2, Home, UserPlus } from "lucide-react";
import PricingPlansManager from "@/components/PricingPlansManager";
import BlockedDatesManager from "@/components/BlockedDatesManager";
import OptionsManager from "@/components/OptionsManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const AdminDashboard = () => {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [photos, setPhotos] = useState<Record<string, ResortPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newResort, setNewResort] = useState({ name: "", location: "Caldas Novas, GO", description: "", price_per_night: "", beds: "1", max_guests: "2", tag: "", amenities: [] as string[], condo_features: [] as string[], important_info: [] as string[], parent_id: "" });
  const [editForm, setEditForm] = useState<Partial<Resort>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewCondoForm, setShowNewCondoForm] = useState(false);
  const [newCondo, setNewCondo] = useState({ name: "", location: "Caldas Novas, GO", description: "" });
  const [ownerForm, setOwnerForm] = useState({ username: "", password: "", resortId: "" });
  const [creatingOwner, setCreatingOwner] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  // Separate parent condos from child apartments
  const parentCondos = resorts.filter(r => r.parent_id === null);
  const childApartments = (parentId: string) => resorts.filter(r => r.parent_id === parentId);

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
      parent_id: newResort.parent_id || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Resort criado!" });
    setShowNewForm(false);
    setNewResort({ name: "", location: "Caldas Novas, GO", description: "", price_per_night: "", beds: "1", max_guests: "2", tag: "", amenities: [], condo_features: [], important_info: [], parent_id: "" });
    fetchResorts();
  };

  const handleCreateCondo = async () => {
    const { error } = await supabase.from("resorts").insert({
      name: newCondo.name,
      location: newCondo.location,
      description: newCondo.description || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Condomínio criado!" });
    setShowNewCondoForm(false);
    setNewCondo({ name: "", location: "Caldas Novas, GO", description: "" });
    fetchResorts();
  };

  const handleCreateOwner = async (resortId: string) => {
    if (!ownerForm.username || !ownerForm.password) {
      toast({ title: "Preencha username e senha", variant: "destructive" });
      return;
    }
    setCreatingOwner(true);
    const { data, error } = await supabase.functions.invoke("create-owner", {
      body: { username: ownerForm.username, password: ownerForm.password, resort_id: resortId },
    });
    setCreatingOwner(false);
    if (error || data?.error) {
      toast({ title: "Erro", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Dono criado!", description: data?.message });
    setOwnerForm({ username: "", password: "", resortId: "" });
    setOwnerDialogOpen(false);
    fetchResorts();
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("resorts").update(editForm).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Atualizado!" });
    setEditingId(null);
    fetchResorts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const resortPhotos = photos[id] || [];
    for (const photo of resortPhotos) {
      await supabase.storage.from("resort-photos").remove([photo.storage_path]);
    }
    await supabase.from("resorts").delete().eq("id", id);
    toast({ title: "Excluído!" });
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
            toast({ title: `${count} foto(s) enviada(s)!` });
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
    await supabase.from("resort_photos").update({ is_cover: false }).eq("resort_id", photo.resort_id);
    await supabase.from("resort_photos").update({ is_cover: true }).eq("id", photo.id);
    toast({ title: "Capa definida!" });
    fetchPhotos(photo.resort_id);
  };

  // Render the photo section for any resort
  const renderPhotoSection = (resortId: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Image className="w-3 h-3" /> Fotos ({(photos[resortId] || []).length})
        </span>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handlePhotoUpload(resortId, e.target.files)}
          />
          <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Upload className="w-3 h-3" />
            {uploadingFor === resortId ? "Enviando..." : "Upload"}
          </span>
        </label>
      </div>
      {uploadingFor === resortId && (
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
      {(photos[resortId] || []).length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {(photos[resortId] || []).map(photo => (
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
  );

  // Render edit form for a resort
  const renderEditForm = (resort: Resort) => (
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
        {resort.parent_id && (
          <>
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
          </>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Descrição</Label>
        <Textarea rows={3} value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => handleUpdate(resort.id)}>
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );

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

        {/* Novo Condomínio button */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Building2 className="w-5 h-5 text-primary" />
            Condomínios / Resorts
          </h1>
          <Button size="sm" onClick={() => setShowNewCondoForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo Condomínio
          </Button>
        </div>

        {/* New Condo Form */}
        {showNewCondoForm && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Novo Condomínio / Resort</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={newCondo.name} onChange={e => setNewCondo(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Condomínio Lagoa" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Local</Label>
                  <Input value={newCondo.location} onChange={e => setNewCondo(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea rows={3} value={newCondo.description} onChange={e => setNewCondo(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCondo}>Criar Condomínio</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewCondoForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* === CONDOMÍNIOS (Parents) === */}
        {parentCondos.map(condo => {
          const apartments = childApartments(condo.id);
          const coverPhoto = (photos[condo.id] || []).find(p => p.is_cover) || (photos[condo.id] || [])[0];

          return (
            <div key={condo.id} className="space-y-4">
              {/* Condominium Master Card */}
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Condomínio (Card do Explore)
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingId === condo.id ? (
                    renderEditForm(condo)
                  ) : (
                    <div className="flex items-start gap-4">
                      {/* Cover preview */}
                      <div className="w-24 h-32 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                        {coverPhoto ? (
                          <img src={coverPhoto.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Image className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {condo.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{condo.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">{condo.description?.slice(0, 100)}...</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(condo.id); setEditForm(condo); }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Photos for the condo card */}
                  {renderPhotoSection(condo.id)}
                </CardContent>
              </Card>

              {/* === APARTMENTS Section === */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Apartamentos ({apartments.length})
                  </h2>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => { setShowNewForm(true); setNewResort(prev => ({ ...prev, parent_id: condo.id })); }}>
                    <Plus className="w-4 h-4 mr-1" /> Novo Apartamento
                  </Button>
                </div>

                {/* New apartment form */}
                {showNewForm && newResort.parent_id === condo.id && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Novo Apartamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input value={newResort.name} onChange={e => setNewResort(p => ({ ...p, name: e.target.value }))} placeholder="Ex: AP 102" />
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
                        <Textarea rows={3} value={newResort.description} onChange={e => setNewResort(p => ({ ...p, description: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleCreate}>Criar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowNewForm(false)}>Cancelar</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {apartments.length === 0 && !showNewForm && (
                  <p className="text-xs text-muted-foreground py-4 text-center">Nenhum apartamento. Clique em "Novo Apartamento" para adicionar.</p>
                )}

                {apartments.map(apt => (
                  <Card key={apt.id}>
                    <CardContent className="pt-5 space-y-4">
                      {editingId === apt.id ? (
                        renderEditForm(apt)
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{apt.name}</h3>
                            <p className="text-xs text-muted-foreground">{apt.location} · R${apt.price_per_night}/noite</p>
                            <p className="text-xs text-muted-foreground">{apt.beds} quartos · {apt.max_guests} hóspedes</p>
                            {apt.tag && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">{apt.tag}</span>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {/* Create Owner Dialog */}
                            <Dialog open={ownerDialogOpen && ownerForm.resortId === apt.id} onOpenChange={(open) => { setOwnerDialogOpen(open); if (open) setOwnerForm(p => ({ ...p, resortId: apt.id })); }}>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Criar dono">
                                  <UserPlus className="w-4 h-4 text-primary" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="text-sm">Criar Dono - {apt.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Username</Label>
                                    <Input value={ownerForm.username} onChange={e => setOwnerForm(p => ({ ...p, username: e.target.value }))} placeholder="Ex: joao" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Senha</Label>
                                    <Input type="password" value={ownerForm.password} onChange={e => setOwnerForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
                                  </div>
                                  <Button size="sm" onClick={() => handleCreateOwner(apt.id)} disabled={creatingOwner}>
                                    {creatingOwner ? "Criando..." : "Criar Dono"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(apt.id); setEditForm(apt); }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(apt.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {renderPhotoSection(apt.id)}
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
        })}

        {parentCondos.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            Nenhum condomínio cadastrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
