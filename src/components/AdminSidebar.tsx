import { Building2, Settings, ExternalLink, LogOut, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Resorts", url: "/admin", icon: Building2 },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

interface AdminSidebarContentProps {
  onNavigate?: () => void;
}

export function AdminSidebarContent({ onNavigate }: AdminSidebarContentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
    onNavigate?.();
  };

  const goTo = (url: string) => {
    navigate(url);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2.5 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Menu</p>
        {mainItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url === "/admin" && location.pathname === "/admin");
          const active = item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url);
          return (
            <button
              key={item.title}
              onClick={() => goTo(item.url)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 space-y-1 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs gap-2"
          onClick={() => goTo("/explore")}
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          Ver Site
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs gap-2 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sair
        </Button>
      </div>
    </div>
  );
}
