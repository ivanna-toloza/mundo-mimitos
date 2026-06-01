import React, { useState, useEffect } from "react";
import { Product, BRAND_COLORS, CartItem } from "../types";
import { X, Check, ShoppingBag, Truck, ShieldCheck, Heart } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  currencySymbol: string;
  brandColorValue: string;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export function ProductModal({
  product,
  currencySymbol,
  brandColorValue,
  onClose,
  onAddToCart
}: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedMessage, setAddedMessage] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Compose all images list
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product?.image) list.push(product.image);
    if (product?.images && Array.isArray(product.images)) {
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
  }, [product?.image, product?.images]);

  // Reset selected size and active image when product changes
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize("");
    }
    setActiveImgIdx(0);
    setAddedMessage(false);
  }, [product]);

  if (!product) return null;

  const currentBrand = BRAND_COLORS.find(c => c.value === brandColorValue) || BRAND_COLORS[0];

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product, selectedSize);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px] animate-fade-in">
        {/* Close Button button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-slate-100 text-slate-700 p-2 rounded-full shadow-md hover:shadow-lg transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left column: Image presentation */}
        <div className="relative w-full md:w-1/2 h-[45%] md:h-auto min-h-[300px] md:min-h-[450px] bg-slate-50 flex-none flex flex-col justify-between">
          <div className="relative flex-1 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={allImages[activeImgIdx]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-300"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-white text-slate-800 text-sm font-semibold px-5 py-2 rounded-full shadow-md">
                  Sin Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails list selector */}
          {allImages.length > 1 && (
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none justify-center">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-11 h-11 rounded-xl overflow-hidden border-2 flex-none transition-all ${
                    idx === activeImgIdx ? "border-pink-300 scale-105 shadow-xs" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Content information */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-[60%] md:h-auto">
          <div>
            {/* Category tag */}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {product.category}
            </span>

            {/* Title */}
            <h2 className="font-display font-semibold text-slate-800 text-xl md:text-2xl mt-3 mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="text-2xl font-extrabold text-slate-850 mb-4 font-sans flex items-center gap-1.5 flex-wrap">
              <span>{currencySymbol === "$" ? "$ " : currencySymbol}{product.price.toLocaleString("es-AR")}</span>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">ARS (Pesos Argentinos)</span>
            </div>

            {/* Description */}
            <div className="text-slate-600 text-sm leading-relaxed mb-6">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Sizes section inside Product modal */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Seleccionar Talle:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] py-1.5 px-3 text-xs md:text-sm font-medium rounded-xl border transition-all duration-200 ${
                        selectedSize === size
                          ? `${currentBrand.primary} border-transparent text-white shadow-md active:scale-95`
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Bottom highlights */}
            <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck className={`w-4 h-4 ${currentBrand.accent}`} />
                <span>Envíos a todo el país o retiro en local</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className={`w-4 h-4 ${currentBrand.accent}`} />
                <span>Algodón premium y costuras antialérgicas</span>
              </div>
            </div>

            {/* Actions button */}
            {product.inStock ? (
              <button
                onClick={handleAdd}
                className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 focus:ring-4 ${currentBrand.primary} ${currentBrand.hover} ${currentBrand.focus}`}
              >
                {addedMessage ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    ¡Prenda Añadida!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Añadir al Carrito
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-slate-400 bg-slate-100 cursor-not-allowed flex items-center justify-center gap-2"
              >
                Sin Stock Disponible
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
