import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!fullName || !password) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const randomId = crypto.randomUUID().slice(0, 8);
        const generatedEmail = `user-${randomId}@reservas.app`;

        const { error } = await supabase.auth.signUp({
          email: generatedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            email: generatedEmail,
            full_name: fullName.trim(),
            ...(contactEmail.trim() ? { contact_email: contactEmail.trim() } : {}),
          }).eq("user_id", user.id);
        }

        toast({ title: "Conta criada com sucesso!" });
        onOpenChange(false);
        onSuccess?.();
      } else {
        const { data: fnData, error: fnError } = await supabase.functions.invoke("user-login", {
          body: { name: fullName.trim() },
        });

        if (fnError || !fnData?.email) {
          toast({ title: "Nome não encontrado", description: "Esse nome não está cadastrado. Crie uma conta ou tente com outro nome.", variant: "destructive" });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: fnData.email,
          password,
        });
        if (error) {
          toast({ title: "Erro", description: "Senha incorreta", variant: "destructive" });
          setLoading(false);
          return;
        }

        toast({ title: "Login realizado!" });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Nome completo</Label>
            <Input
              value={fullName}
              onChange={e => {
                const capitalized = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                setFullName(capitalized);
              }}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-1">
              <Label className="text-xs">E-mail (opcional)</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading || !fullName || !password}
            className={cn(
              "w-full font-bold text-base py-3 shadow-lg transition-opacity rounded-xl",
              loading || !fullName || !password
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
