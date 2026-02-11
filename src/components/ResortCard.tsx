import { Heart, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-3xl aspect-[3/4] mb-4 ring-1 ring-border/30">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-background/40 backdrop-blur-md border border-border/20 transition-all hover:bg-background/70 hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-all ${liked ? "fill-primary text-primary scale-110" : "text-foreground/80"}`}
          />
        </button>
        {tag && (
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-primary/20">
            {tag}
          </span>
        )}

        {/* Bottom info overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-foreground font-bold text-xl">
            R$ {price.toLocaleString("pt-BR")}
            <span className="font-normal text-sm text-muted-foreground"> / noite</span>
          </p>
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight text-foreground truncate">{title}</h3>
          <div className="flex items-center gap-1 shrink-0 bg-secondary/60 px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="text-xs font-bold text-foreground">{rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-sm">{location}</span>
        </div>
        <p className="text-xs text-muted-foreground">{dates}</p>
        <p className="text-foreground font-bold text-lg md:hidden">
          R$ {price.toLocaleString("pt-BR")} <span className="font-normal text-sm text-muted-foreground">/ noite</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ResortCard;
