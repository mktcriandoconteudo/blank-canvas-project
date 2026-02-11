import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ResortCard from "@/components/ResortCard";

const resorts = [
  {
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    title: "Resort Paradiso Tropical",
    location: "Porto de Galinhas, PE",
    rating: 4.9,
    reviews: 342,
    price: 1250,
    dates: "12–17 de mar.",
    tag: "Superhost",
    beds: 3,
    guests: 6,
  },
  {
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    title: "Villa Oceânica Resort & Spa",
    location: "Búzios, RJ",
    rating: 4.8,
    reviews: 218,
    price: 980,
    dates: "5–10 de abr.",
    beds: 2,
    guests: 4,
  },
  {
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    title: "Bangalô Sunset Premium",
    location: "Jericoacoara, CE",
    rating: 5.0,
    reviews: 156,
    price: 1890,
    dates: "20–25 de mar.",
    tag: "Novo",
    beds: 2,
    guests: 3,
  },
  {
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    title: "Aqua Resort All-Inclusive",
    location: "Maragogi, AL",
    rating: 4.7,
    reviews: 489,
    price: 2100,
    dates: "1–6 de mai.",
    tag: "Em alta",
    beds: 3,
    guests: 5,
  },
  {
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    title: "Costa Verde Eco Resort",
    location: "Itacaré, BA",
    rating: 4.9,
    reviews: 127,
    price: 750,
    dates: "8–13 de abr.",
    beds: 1,
    guests: 2,
  },
  {
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    title: "Grand Palace Beach Resort",
    location: "Arraial d'Ajuda, BA",
    rating: 4.6,
    reviews: 305,
    price: 1450,
    dates: "15–20 de mai.",
    tag: "Superhost",
    beds: 4,
    guests: 8,
  },
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    title: "Pousada Marina Del Sol",
    location: "Florianópolis, SC",
    rating: 4.8,
    reviews: 198,
    price: 680,
    dates: "22–27 de mar.",
    beds: 2,
    guests: 4,
  },
  {
    image: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80",
    title: "Serra Azul Mountain Lodge",
    location: "Monte Verde, MG",
    rating: 4.9,
    reviews: 89,
    price: 520,
    dates: "3–8 de jun.",
    tag: "Novo",
    beds: 1,
    guests: 2,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
