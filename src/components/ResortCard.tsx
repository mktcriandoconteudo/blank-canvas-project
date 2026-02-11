import { Heart, Star, MapPin } from "lucide-react";
import { useState } from "react";

interface ResortCardProps {
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  dates: string;
  tag?: string;
}

const ResortCard = ({ image, title, location, rating, reviews, price, dates, tag }: ResortCardProps) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-3">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-card/70 backdrop-blur-sm transition-all hover:bg-card/90"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${liked ? "fill-primary text-primary" : "text-foreground"}`}
          />
        </button>
        {tag && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide uppercase">
            {tag}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight text-foreground truncate">{title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-foreground text-foreground" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm">{location}</span>
        </div>
        <p className="text-sm text-muted-foreground">{dates}</p>
        <p className="text-foreground font-semibold">
          R$ {price.toLocaleString("pt-BR")} <span className="font-normal text-muted-foreground">/ noite</span>
        </p>
      </div>
    </div>
  );
};

export default ResortCard;
