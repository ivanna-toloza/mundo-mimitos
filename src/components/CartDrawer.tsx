import React, { useState } from "react";
import { CartItem, BRAND_COLORS, StoreConfig } from "../types";
import { X, Plus, Minus, Trash2, ShoppingBag, Send, PhoneCall } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  config: StoreConfig;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartDrawer({
  isOpen,
  cartItems,
  config,
  onClose,
  onUpdateQty,
  onRemoveItem
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [customerAddress, setCustomerAddress] = useState("");

  if (!isOpen) return null;

  const currentBrand = BRAND_COLORS.find(c => c.value === config.brandColor) || BRAND_COLORS[0];
  const totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Format and URL-encode the WhatsApp payload
  const handleWhatsappCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    let itemsText = "";
    cartItems.forEach((item, index) => {
      itemsText += `${index + 1}. *${item.product.name}* \n   • Talle: ${item.size}\n   • Cantidad: ${item.quantity} x ${config.currencySymbol === "$" ? "$ " : config.currencySymbol}${item.product.price.toLocaleString("es-AR")} = *${config.currencySymbol === "$" ? "$ " : config.currencySymbol}${(item.product.price * item.quantity).toLocaleString("es-AR")} ARS*\n\n`;
    });

    const methodLabel = deliveryMethod === "shipping" ? "🚚 Envío a Domicilio" : "🏠 Retiro en Tienda";
    const addressSection = deliveryMethod === "shipping" ? `📍 *Dirección:* ${customerAddress}` : "📍 *Retira por la tienda principal*";

    const fullMessage = `${config.welcomeMessage || "¡Hola! Vi la tienda online y me gustaría consultar por los siguientes productos: 💛"}\n\n🛒 *DETALLE DEL PEDIDO:*\n${itemsText}---\n💰 *TOTAL:* *${config.currencySymbol === "$" ? "$ " : config.currencySymbol}${totalAmount.toLocaleString("es-AR")} ARS*\n\n👤 *DATOS DEL CLIENTE:*\n• *Nombre:* ${customerName || "[Ingresar nombre]"}\n• *Método:* ${methodLabel}\n${addressSection}\n\n_Generado desde la tienda online_ ✨`;

    // Clean phone number (leave only digits)
    const activePhone = config.whatsappNumber.replace(/\D/g, "");

    // Open WhatsApp link in new window
    const targetUrl = `https://api.whatsapp.com/send?phone=${activePhone}&text=${encodeURIComponent(fullMessage)}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Panel */}
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl z-10 animate-slide-in">
        {/* Header Drawer */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-5 h-5 ${currentBrand.accent}`} />
            <h2 className="font-display font-semibold text-lg text-slate-800">
              Carrito de Compras ({cartItems.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <p className="font-display font-medium text-slate-600 text-base">
                Tu carrito está vacío
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                Explorá los productos y elegí tus prendas favoritas para empezar.
              </p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:border-slate-100 transition-colors"
              >
                {/* Product image */}
                <img
                  src={item.product.image || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-none"
                />

                {/* Details layout */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-medium text-slate-800 text-sm line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Talle: <span className="font-bold text-slate-600">{item.size}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1 flex items-baseline gap-1">
                    <span>{config.currencySymbol === "$" ? "$ " : config.currencySymbol}{(item.product.price * item.quantity).toLocaleString("es-AR")}</span>
                    <span className="text-[10px] font-black text-slate-400">ARS</span>
                  </div>

                  {/* Qty and delete */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="hover:bg-white text-slate-500 hover:text-slate-700 p-1 rounded-md transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-slate-800 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="hover:bg-white text-slate-500 hover:text-slate-700 p-1 rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout panel section inside CartDrawer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-t-[32px] space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-slate-800">
              <span>Total del Pedido:</span>
              <span className="font-sans text-lg font-black text-pink-600">{config.currencySymbol === "$" ? "$ " : config.currencySymbol}{totalAmount.toLocaleString("es-AR")} <span className="text-xs text-slate-400 font-bold">ARS</span></span>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleWhatsappCheckout} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden"
                />
              </div>

              {/* Delivery Select option */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Método de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("shipping")}
                    className={`py-1.5 text-xs font-medium rounded-xl border transition-all ${
                      deliveryMethod === "shipping"
                        ? `${currentBrand.primary} border-transparent text-white`
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    🚚 Solicitar Envío
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`py-1.5 text-xs font-medium rounded-xl border transition-all ${
                      deliveryMethod === "pickup"
                        ? `${currentBrand.primary} border-transparent text-white`
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    🏠 Retiro en Tienda
                  </button>
                </div>
              </div>

              {/* Delivery Address Field */}
              {deliveryMethod === "shipping" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Dirección de Envío *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Av. Santa Fe 1234, 4to B"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-hidden"
                  />
                </div>
              )}

              {/* Send Button button */}
              <button
                type="submit"
                className={`w-full py-3 px-5 rounded-2xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${currentBrand.primary} ${currentBrand.hover}`}
              >
                <Send className="w-4 h-4" />
                Enviar Pedido por WhatsApp
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
