import { Search, Globe, Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Resorts
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center border border-border rounded-full shadow-sm hover:shadow-md transition-shadow">
            <button className="px-5 py-2.5 text-sm font-medium text-foreground border-r border-border">
              Qualquer lugar
            </button>
            <button className="px-5 py-2.5 text-sm font-medium text-foreground border-r border-border">
              Qualquer semana
            </button>
            <button className="px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
              Hóspedes
              <span className="bg-primary text-primary-foreground p-1.5 rounded-full">
                <Search className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Mobile search */}
          <button className="md:hidden flex items-center gap-3 border border-border rounded-full px-4 py-2 shadow-sm">
            <Search className="w-4 h-4 text-foreground" />
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">Para onde?</p>
              <p className="text-[11px] text-muted-foreground">Qualquer lugar · Qualquer semana</p>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button className="hidden lg:block text-sm font-medium text-foreground hover:bg-secondary rounded-full px-4 py-2 transition-colors">
              Anuncie seu espaço
            </button>
            <button className="hidden sm:block p-2 rounded-full hover:bg-secondary transition-colors">
              <Globe className="w-4 h-4 text-foreground" />
            </button>
            <button className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 hover:shadow-md transition-shadow">
              <Menu className="w-4 h-4 text-foreground" />
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
