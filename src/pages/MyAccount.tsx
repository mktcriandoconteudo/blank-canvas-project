import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MyAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/explore");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setAvatarUrl(data.avatar_url || "");
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(newUrl);

      // Save to profile
      await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("user_id", user.id);

      toast({ title: "Avatar atualizado! 🎉" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Dados salvos com sucesso! ✅" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/explore")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Minha Conta
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie seus dados e avatar</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">Clique na câmera para trocar seu avatar</p>
            </div>

            {/* Profile fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nome completo</Label>
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">E-mail</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="rounded-xl opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Telefone / Celular</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(62) 99999-9999"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl py-6 text-base font-bold gap-2"
            >
              {saving ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar alterações</>}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyAccount;
