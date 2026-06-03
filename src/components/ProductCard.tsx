import React from "react";
import { Product, AGE_TAG_LABELS, BRAND_COLORS } from "../types";
import { ShoppingBag, Eye } from "lucide-react";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  ageLabel?: string;
  currencySymbol: string;
  brandColorValue: string;
  onOpenDetails: (product: Product) => void;
  adminMode?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({
  product,
  ageLabel,
  currencySymbol,
  brandColorValue,
  onOpenDetails,
  adminMode = false,
  onEdit,
  onDelete
}: ProductCardProps) {
  const currentBrand = BRAND_COLORS.find(c => c.value === brandColorValue) || BRAND_COLORS[0];

  // Compose all images list
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800");
    }
    return list;
  }, [product.image, product.images]);

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (!isHovered || allImages.length <= 1) {
      setCurrentIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % allImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, allImages]);

  // Map age tag to visual badge colors
  const ageBadgeStyles: Record<string, string> = {
    baby: "bg-sky-50 text-sky-700 border-sky-100",
    toddler: "bg-rose-50 text-rose-700 border-rose-100",
    kid: "bg-amber-50 text-amber-700 border-amber-100"
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-[2rem] border-2 border-transparent hover:border-sky-300 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-[4/4] bg-slate-50 overflow-hidden">
        <img
          src={allImages[currentIdx]}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
        />

        {/* Carousel indicator dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-350 ${
                  idx === currentIdx ? "bg-white scale-110" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-amber-600 border border-amber-100 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
            ✨ Destacado
          </span>
        )}

        {/* Stock banner */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-slate-800 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
              Sin Stock
            </span>
          </div>
        )}

        {/* Hover overlay with Quick-view button */}
        {product.inStock && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button className={`${currentBrand.primary} text-white p-3 rounded-full shadow-lg ${currentBrand.hover} transition-all duration-300 transform scale-90 group-hover:scale-100`}>
              <Eye className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Age badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className={`text-[10px] uppercase tracking-wider font-semibold border ${ageBadgeStyles[product.ageTag] || "bg-slate-50 text-slate-600 border-slate-100"} px-2 py-0.5 rounded-full`}>
            {ageLabel || AGE_TAG_LABELS[product.ageTag] || product.ageTag}
          </span>
          <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-display font-medium text-slate-800 text-base mb-1.5 line-clamp-1 group-hover:text-slate-900 group-hover:underline decoration-1 transition-colors">
          {product.name}
        </h3>

        {/* Product Description snippet */}
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-slate-55 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold mr-0.5">Precio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-slate-800">
                  {currencySymbol === "$" ? "$ " : currencySymbol}{product.price.toLocaleString("es-AR")}
                </span>
                <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider">ARS</span>
              </div>
            </div>

            {!adminMode && (
              <span className={`text-xs font-semibold ${currentBrand.accent} group-hover:translate-x-1 transition-transform flex items-center gap-1`}>
                Ver detalles <ShoppingBag className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {adminMode && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit(product);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>✏️</span> Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(product);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>🗑️</span> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
