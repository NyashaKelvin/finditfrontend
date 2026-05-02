import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const ItemCard = ({ item }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const displayImage = item.thumbnail || item.image;

  return (
    <Link 
      to={`/items/${item.id}`} 
      className="glass-card overflow-hidden group block hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {displayImage ? (
          <>
            {/* Main high-res image */}
            <img
              src={item.image}
              alt={item.title}
              className={`h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${
                isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
              }`}
              onLoad={() => setIsLoaded(true)}
            />
            {/* Lower-res thumbnail placeholder */}
            {!isLoaded && item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={`${item.title} thumbnail`}
                className="absolute inset-0 h-full w-full object-cover blur-md scale-105"
              />
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
            No Image
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm ${
            item.status === "LOST" ? "bg-red-500 text-white" : 
            item.status === "CLAIMED" ? "bg-blue-500 text-white" :
            "bg-emerald-500 text-white"
          }`}>
            {item.status}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">{item.category}</span>
          <span className="text-[10px] text-muted-foreground">{new Date(item.date_spotted).toLocaleDateString()}</span>
        </div>
        <h3 className="text-lg font-bold mb-3 truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="text-primary/70 w-3 h-3" /> 
          <span className="truncate">{item.location}</span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
