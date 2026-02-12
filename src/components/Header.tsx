import { Search, Globe, Menu, User, Sparkles, Moon, Sun, LogOut, CalendarCheck, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSubtitle, setLogoSubtitle] = useState("J G Locações");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["landing_logo_url", "landing_logo_subtitle"]);
      if (data) {
        data.forEach(d => {
          if (d.key === "landing_logo_url") setLogoUrl(d.value);
          if (d.key === "landing_logo_subtitle") setLogoSubtitle(d.value);
        });
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setIsAdmin(!!data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/explore")}>
              {logoUrl ? (
                <div className="flex flex-col items-center">
                  <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
                  {logoSubtitle && (
                    <span className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {logoSubtitle}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-foreground hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Resorts
                  </span>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-secondary/60 border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <button className="px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                Qualquer lugar
              </button>
              <div className="w-px h-6 bg-border/50" />
              <button className="px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                Qualquer semana
              </button>
              <div className="w-px h-6 bg-border/50" />
              <button className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-3 hover:bg-muted/50 transition-colors">
                Hóspedes
                <span className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-2 rounded-xl shadow-md shadow-primary/30">
                  <Search className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            {/* Mobile search */}
            <button className="md:hidden flex items-center gap-3 bg-secondary/60 border border-border/50 rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">Para onde?</p>
                <p className="text-[11px] text-muted-foreground">Qualquer lugar · Qualquer semana</p>
              </div>
            </button>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="hidden lg:block text-sm font-medium text-foreground hover:bg-secondary rounded-2xl px-4 py-2.5 transition-colors">
                Anuncie seu espaço
              </button>
              <button
                onClick={() => setDark(!dark)}
                className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
              >
                {dark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button className="hidden sm:block p-2.5 rounded-xl hover:bg-secondary transition-colors">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-2xl px-3 py-2 hover:border-primary/30 transition-all">
                      <Menu className="w-4 h-4 text-muted-foreground" />
                      {userAvatar ? (
                        <img src={userAvatar} alt="" className="w-7 h-7 rounded-xl object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-[11px] font-bold text-primary-foreground">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/minhas-reservas")} className="cursor-pointer gap-2">
                      <CalendarCheck className="w-4 h-4" /> Minhas Reservas
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer gap-2">
                        <ShieldCheck className="w-4 h-4" /> Painel Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-2xl px-3 py-2 hover:border-primary/30 transition-all"
                >
                  <Menu className="w-4 h-4 text-muted-foreground" />
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Header;
