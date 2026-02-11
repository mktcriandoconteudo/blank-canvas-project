import { Search, Globe, Menu, User, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Resorts
            </span>
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
            <button className="hidden sm:block p-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-2xl px-3 py-2 hover:border-primary/30 transition-all">
              <Menu className="w-4 h-4 text-muted-foreground" />
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
