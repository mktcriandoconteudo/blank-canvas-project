import Header from "@/components/Header";
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
  },
  {
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    title: "Villa Oceânica Resort & Spa",
    location: "Búzios, RJ",
    rating: 4.8,
    reviews: 218,
    price: 980,
    dates: "5–10 de abr.",
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
  },
  {
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    title: "Costa Verde Eco Resort",
    location: "Itacaré, BA",
    rating: 4.9,
    reviews: 127,
    price: 750,
    dates: "8–13 de abr.",
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
  },
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    title: "Pousada Marina Del Sol",
    location: "Florianópolis, SC",
    rating: 4.8,
    reviews: 198,
    price: 680,
    dates: "22–27 de mar.",
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
  },
  {
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    title: "Ilha Bela Exclusive Resort",
    location: "Ilhabela, SP",
    rating: 4.7,
    reviews: 412,
    price: 1680,
    dates: "10–15 de abr.",
  },
  {
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    title: "Coral Bay Resort & Marina",
    location: "Praia do Forte, BA",
    rating: 5.0,
    reviews: 67,
    price: 2350,
    dates: "18–23 de mai.",
    tag: "Em alta",
  },
  {
    image: "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&q=80",
    title: "Recanto das Águas Termais",
    location: "Caldas Novas, GO",
    rating: 4.5,
    reviews: 534,
    price: 420,
    dates: "25–30 de mar.",
  },
  {
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
    title: "Refúgio Tropical Spa Resort",
    location: "Trancoso, BA",
    rating: 4.9,
    reviews: 176,
    price: 1950,
    dates: "7–12 de jun.",
    tag: "Superhost",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryFilter />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
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
