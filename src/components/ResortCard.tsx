import { Heart, Share2, Star, MapPin, Bed, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  beds?: number;
  guests?: number;
  slug?: string;
}

const ResortCard = ({ image, title, location, rating, reviews, price, dates, tag, beds = 2, guests = 4 }: ResortCardProps) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group cursor-pointer"
      onClick={() => navigate("/resort/1")}
    >
      <div className="relative overflow-hidden rounded-3xl aspect-[3/4] ring-1 ring-border/20 shadow-lg shadow-primary/5">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Tag */}
        {tag && (
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase shadow-lg">
            {tag}
          </span>
        )}

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10 transition-all hover:bg-card/60 hover:scale-110"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10 transition-all hover:bg-card/60 hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-all ${liked ? "fill-primary text-primary scale-110" : "text-white"}`}
            />
          </button>
        </div>

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            className="text-white font-extrabold text-xl leading-tight mb-1 drop-shadow-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-white/75 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{location}</span>
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              R$ {price.toLocaleString("pt-BR")}
            </span>
            <span className="flex items-center gap-1 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {rating}
            </span>
            <span className="flex items-center gap-1 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              <Bed className="w-3 h-3" />
              {beds} quartos
            </span>
            <span className="flex items-center gap-1 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              <Users className="w-3 h-3" />
              {guests} hósp.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResortCard;
