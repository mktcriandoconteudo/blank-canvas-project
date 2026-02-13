import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, UserCheck, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AdultGuest { full_name: string; cpf: string; }
interface ChildGuest { full_name: string; age: string; }
interface ResponsibleInfo { rg: string; cpf: string; civil_status: string; street: string; number: string; cep: string; neighborhood: string; city: string; state: string; }

const civilStatusOptions = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  guestCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  onSaved: () => void;
}

const GuestRegistrationDialog = ({ open, onOpenChange, reservationId, guestCount, guestName, guestPhone, guestEmail, onSaved }: Props) => {
  // CEP auto-fill + phone mask enabled
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [useExisting, setUseExisting] = useState<boolean | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [responsible, setResponsible] = useState<ResponsibleInfo>({ rg: "", cpf: "", civil_status: "", street: "", number: "", cep: "", neighborhood: "", city: "", state: "" });
  const [fetchingCep, setFetchingCep] = useState(false);

  // Check if user has previous reservation data
  useEffect(() => {
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      if (!profile?.full_name) return;
      const { data: prev } = await supabase
        .from("reservations")
        .select("responsible_cpf, responsible_rg, responsible_civil_status, responsible_street, responsible_number, responsible_cep, responsible_neighborhood, responsible_city, responsible_state")
        .eq("guest_name", profile.full_name)
        .not("responsible_cpf", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prev?.responsible_cpf) setHasExistingData(true);
    };
    if (open) checkExisting();
  }, [open]);

  const loadFromLastReservation = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      if (!profile?.full_name) return;
      const { data: prev } = await supabase
        .from("reservations")
        .select("responsible_cpf, responsible_rg, responsible_civil_status, responsible_street, responsible_number, responsible_cep, responsible_neighborhood, responsible_city, responsible_state")
        .eq("guest_name", profile.full_name)
        .not("responsible_cpf", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prev) {
        setResponsible({
          rg: prev.responsible_rg || "",
          cpf: prev.responsible_cpf || "",
          civil_status: prev.responsible_civil_status || "",
          street: prev.responsible_street || "",
          number: prev.responsible_number || "",
          cep: prev.responsible_cep || "",
          neighborhood: prev.responsible_neighborhood || "",
          city: prev.responsible_city || "",
          state: prev.responsible_state || "",
        });
        toast({ title: "Dados preenchidos automaticamente! ✅" });
      }
    } catch { /* ignore */ } finally {
      setLoadingProfile(false);
    }
  };
  const extraGuests = Math.max(0, guestCount - 1); // responsável já é o 1º
  const [numChildren, setNumChildren] = useState(0);
  const numExtraAdults = Math.max(0, extraGuests - numChildren);
  const [adults, setAdults] = useState<AdultGuest[]>(Array.from({ length: Math.max(0, extraGuests) }, () => ({ full_name: "", cpf: "" })));
  const [children, setChildren] = useState<ChildGuest[]>([]);

  // Sync adults/children count
  const updateNumChildren = (n: number) => {
    const maxChildren = extraGuests;
    const clamped = Math.min(n, maxChildren);
    setNumChildren(clamped);
    const na = Math.max(0, extraGuests - clamped);
    setAdults(prev => {
      const arr = [...prev];
      while (arr.length < na) arr.push({ full_name: "", cpf: "" });
      return arr.slice(0, na);
    });
    setChildren(prev => {
      const arr = [...prev];
      while (arr.length < clamped) arr.push({ full_name: "", age: "" });
      return arr.slice(0, clamped);
    });
  };

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    return v;
  };

  const formatCep = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    return v;
  };

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setResponsible(p => ({
          ...p,
          street: data.logradouro || p.street,
          neighborhood: data.bairro || p.neighborhood,
          city: data.localidade || p.city,
          state: data.uf || p.state,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setFetchingCep(false);
    }
  }, []);

  const handleSave = async () => {
    if (!responsible.cpf || !responsible.rg) {
      toast({ title: "Preencha os dados do responsável (RG e CPF)", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await supabase.from("reservations").update({
        responsible_rg: responsible.rg,
        responsible_cpf: responsible.cpf,
        responsible_civil_status: responsible.civil_status,
        responsible_street: responsible.street,
        responsible_number: responsible.number,
        responsible_cep: responsible.cep,
        responsible_neighborhood: responsible.neighborhood,
        responsible_city: responsible.city,
        responsible_state: responsible.state,
      } as any).eq("id", reservationId);

      const adultRows = adults.filter(a => a.full_name.trim()).map(a => ({
        reservation_id: reservationId,
        guest_type: "adult" as const,
        full_name: a.full_name,
        cpf: a.cpf || null,
        age: null,
      }));
      const childRows = children.filter(c => c.full_name.trim()).map(c => ({
        reservation_id: reservationId,
        guest_type: "child" as const,
        full_name: c.full_name,
        cpf: null,
        age: parseInt(c.age) || null,
      }));

      const allGuests = [...adultRows, ...childRows];
      if (allGuests.length > 0) {
        // Delete existing guests first then re-insert
        await supabase.from("reservation_guests").delete().eq("reservation_id", reservationId);
        const { error } = await supabase.from("reservation_guests").insert(allGuests);
        if (error) throw error;
      }

      toast({ title: "Dados salvos com sucesso! 🎉" });
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Users className="w-5 h-5" /> Cadastro de Hóspedes
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Escolha: usar conta existente ou preencher */}
          {hasExistingData && useExisting === null && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground text-center">Como deseja preencher os dados do responsável?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setUseExisting(true); loadFromLastReservation(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <UserCheck className="w-6 h-6 text-primary" />
                  <span className="text-sm font-bold text-primary">Usar minha conta</span>
                  <span className="text-[10px] text-muted-foreground">Preencher automaticamente</span>
                </button>
                <button
                  onClick={() => setUseExisting(false)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <PenLine className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Preencher manualmente</span>
                  <span className="text-[10px] text-muted-foreground">Digitar os dados</span>
                </button>
              </div>
            </div>
          )}

          {loadingProfile && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Carregando seus dados...</span>
            </div>
          )}

          {/* Responsável - mostra quando não tem dados existentes OU já escolheu */}
          {(!hasExistingData || useExisting !== null) && !loadingProfile && (
          <>
          {/* Responsável */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              😎 Responsável pela reserva
              {useExisting === true && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Auto-preenchido</span>
              )}
            </p>
            <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border">
              <div className="space-y-1">
                <Label className="text-xs">Nome completo</Label>
                <Input value={guestName} disabled className="opacity-60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">RG</Label>
                  <Input value={responsible.rg} onChange={e => setResponsible(p => ({ ...p, rg: e.target.value }))} placeholder="00.000.000-0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CPF</Label>
                  <Input value={responsible.cpf} onChange={e => setResponsible(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Estado civil</Label>
                  <select
                    value={responsible.civil_status}
                    onChange={e => setResponsible(p => ({ ...p, civil_status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecione</option>
                    {civilStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Celular</Label>
                  <Input value={guestPhone} disabled className="opacity-60" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">E-mail</Label>
                <Input value={guestEmail} disabled className="opacity-60" />
              </div>

              {/* CEP first - auto-fill address */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">CEP</Label>
                  <div className="relative">
                    <Input
                      value={responsible.cep}
                      onChange={e => {
                        const formatted = formatCep(e.target.value);
                        setResponsible(p => ({ ...p, cep: formatted }));
                        if (formatted.replace(/\D/g, "").length === 8) {
                          fetchAddressByCep(formatted);
                        }
                      }}
                      placeholder="00000-000"
                    />
                    {fetchingCep && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bairro</Label>
                  <Input value={responsible.neighborhood} onChange={e => setResponsible(p => ({ ...p, neighborhood: e.target.value }))} placeholder="Preenchido pelo CEP" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cidade</Label>
                  <Input value={responsible.city} onChange={e => setResponsible(p => ({ ...p, city: e.target.value }))} placeholder="Preenchido pelo CEP" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Rua / Av</Label>
                  <Input value={responsible.street} onChange={e => setResponsible(p => ({ ...p, street: e.target.value }))} placeholder="Preenchido pelo CEP" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nº</Label>
                  <Input value={responsible.number} onChange={e => setResponsible(p => ({ ...p, number: e.target.value }))} placeholder="123" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">UF</Label>
                  <Input value={responsible.state} onChange={e => setResponsible(p => ({ ...p, state: e.target.value }))} placeholder="UF" maxLength={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Crianças selector - só aparece se 2+ hóspedes (tem acompanhantes) */}
          {extraGuests > 0 && (
          <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-2">
            <Label className="text-xs font-semibold">Dos {extraGuests} acompanhante{extraGuests > 1 ? "s" : ""}, quantas crianças?</Label>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(extraGuests + 1, 7) }, (_, i) => i).map(n => (
                <button
                  key={n}
                  onClick={() => updateNumChildren(n)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-bold transition-colors",
                    numChildren === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          )}

          {numExtraAdults > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">🧑 Outros adultos</p>
            {adults.slice(0, numExtraAdults).map((adult, i) => (
              <div key={i} className="bg-muted/30 rounded-2xl p-3 border border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Adulto {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Nome completo</Label>
                    <Input
                      value={adult.full_name}
                      onChange={e => { const v = e.target.value; setAdults(p => { const u = [...p]; u[i] = { ...u[i], full_name: v }; return u; }); }}
                      placeholder="Nome"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">CPF</Label>
                    <Input
                      value={adult.cpf}
                      onChange={e => { const v = e.target.value; setAdults(p => { const u = [...p]; u[i] = { ...u[i], cpf: v }; return u; }); }}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Crianças */}
          {numChildren > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">🧚 Nome e idade das crianças</p>
              {children.map((child, i) => (
                <div key={i} className="bg-muted/30 rounded-2xl p-3 border border-border space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Criança {i + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[11px]">Nome completo</Label>
                      <Input
                        value={child.full_name}
                        onChange={e => { const v = e.target.value; setChildren(p => { const u = [...p]; u[i] = { ...u[i], full_name: v }; return u; }); }}
                        placeholder="Nome da criança"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Idade</Label>
                      <Input
                        type="number"
                        value={child.age}
                        onChange={e => { const v = e.target.value; setChildren(p => { const u = [...p]; u[i] = { ...u[i], age: v }; return u; }); }}
                        placeholder="Ex: 5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          </>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !responsible.cpf}
            className={cn(
              "w-full font-bold text-base py-3.5 shadow-lg transition-opacity rounded-2xl",
              saving || !responsible.cpf
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            {saving ? "Salvando..." : "Salvar Dados dos Hóspedes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestRegistrationDialog;
