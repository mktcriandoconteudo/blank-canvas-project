import { Menu, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import resort1Image from "@/assets/resort-1.webp";
import HeroBanner from "@/components/HeroBanner";
import ResortCard from "@/components/ResortCard";

const resorts = [
  {
    image: resort1Image,
    title: "Condomínio Enseada",
    location: "Caldas Novas, GO",
    rating: 4.9,
    reviews: 342,
    price: 1250,
    dates: "12–17 de mar.",
    tag: "Superhost",
    beds: 3,
    guests: 6,
    slug: "condomínio-enseada",
  },
];

const Index = () => {
const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return true; // default dark
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header overlaid on banner */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4">
        <button
          onClick={() => setDark(!dark)}
          className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10"
        >
          {dark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
        </button>
        <button className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border/10 rounded-full px-3 py-2">
          <Menu className="w-4 h-4 text-white" />
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
      <HeroBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {resorts.map((resort, i) => (
            <ResortCard key={i} {...resort} />
          ))}
        </div>
      </main>
      <footer className="border-t border-border/50 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © 2026 Resorts · Termos · Privacidade · Mapa do site
        </div>
      </footer>
    </div>
  );
};

export default Index;
