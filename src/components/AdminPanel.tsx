import React, { useState } from "react";
import { Product, StoreConfig, BRAND_COLORS, CATEGORIES, AGE_TAG_LABELS, STANDARD_SIZES } from "../types";
import { Sparkles, Save, Plus, Trash2, Edit, Undo, HelpCircle, Eye, RefreshCw, X, Check, Image as ImageIcon } from "lucide-react";

interface AdminPanelProps {
  config: StoreConfig;
  products: Product[];
  onSaveConfig: (newConfig: StoreConfig) => Promise<void>;
  onSaveProducts: (newProducts: Product[]) => Promise<void>;
  onResetStore: () => Promise<void>;
}

export function AdminPanel({
  config,
  products,
  onSaveConfig,
  onSaveProducts,
  onResetStore
}: AdminPanelProps) {
  // Store config states
  const [storeName, setStoreName] = useState(config.storeName);
  const [storeTagline, setStoreTagline] = useState(config.storeTagline);
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [welcomeMessage, setWelcomeMessage] = useState(config.welcomeMessage);
  const [brandColor, setBrandColor] = useState(config.brandColor);
  const [bannerText, setBannerText] = useState(config.bannerText);
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol);

  // Editing lists and active edits
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // AI loading and notifications
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const currentBrand = BRAND_COLORS.find(c => c.value === brandColor) || BRAND_COLORS[0];

  // Utility to show messages
  const notify = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: "", text: "" });
    }, 4500);
  };

  // Save Store Configuration
  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await onSaveConfig({
        storeName,
        storeTagline,
        whatsappNumber,
        welcomeMessage,
        brandColor,
        bannerText,
        bannerImage: config.bannerImage,
        logoUrl: config.logoUrl,
        currencySymbol
      });
      notify("success", "¡Configuración de la tienda guardada con éxito!");
    } catch (e: any) {
      notify("error", e.message || "Error al guardar la configuración");
    } finally {
      setSaveLoading(false);
    }
  };

  // Reset Product Form
  const handleStartAdd = () => {
    setEditingProduct({
      id: "p_" + Date.now(),
      name: "",
      category: "Babys",
      ageTag: "baby",
      price: 0,
      sizes: ["RN", "3M", "6M"],
      description: "",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
      images: [],
      inStock: true,
      isFeatured: false
    });
    setIsAddingNew(true);
  };

  // Edit Product Select
  const handleStartEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsAddingNew(false);
  };

  // Handle sizes tags toggling
  const handleToggleSize = (size: string) => {
    if (!editingProduct) return;
    const currentSizes = editingProduct.sizes || [];
    let nextSizes = [];
    if (currentSizes.includes(size)) {
      nextSizes = currentSizes.filter(s => s !== size);
    } else {
      nextSizes = [...currentSizes, size];
    }
    setEditingProduct({ ...editingProduct, sizes: nextSizes });
  };

  // AI Description Generator trigger
  const handleGenerateAiDescription = async () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.category) {
      notify("error", "Por favor ingresa primero el nombre y la categoría para inspirar a la IA.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          category: editingProduct.category,
          ageTag: editingProduct.ageTag
        })
      });
      const data = await response.json();
      if (response.ok && data.description) {
        setEditingProduct({ ...editingProduct, description: data.description });
        notify("success", "¡Estrategia de descripción tierna generada con éxito!");
      } else {
        throw new Error(data.error || "Error al contactar al servidor Gemini.");
      }
    } catch (err: any) {
      notify("error", "La IA no se pudo iniciar: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Save product details to the general arrays
  const handleSaveProductDetail = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price || editingProduct.price <= 0) {
      notify("error", "Completa el nombre y un precio válido superior a 0.");
      return;
    }

    setSaveLoading(true);
    try {
      let nextProducts: Product[];
      if (isAddingNew) {
        nextProducts = [editingProduct as Product, ...products];
      } else {
        nextProducts = products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p);
      }
      await onSaveProducts(nextProducts);
      notify("success", `¡Producto ${isAddingNew ? "creado" : "editado"} exitosamente!`);
      setEditingProduct(null);
    } catch (e: any) {
      notify("error", e.message || "Error al guardar el producto");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta prenda? Esta acción no se puede deshacer.")) return;
    setSaveLoading(true);
    try {
      const nextProducts = products.filter(p => p.id !== productId);
      await onSaveProducts(nextProducts);
      notify("success", "Prenda eliminada con éxito.");
    } catch (e: any) {
      notify("error", "Error al eliminar la prenda: " + e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle database dynamic reset
  const handleResetStoreSubmit = async () => {
    if (!window.confirm("¿Estás absolutamente seguro de que querés borrar todas tus ediciones y volver al catálogo demo original?")) return;
    setResetLoading(true);
    try {
      await onResetStore();
      notify("success", "¡Tienda restaurada satisfactoriamente!");
      // Reload states locally too
      setStoreName(config.storeName);
      setStoreTagline(config.storeTagline);
      setWhatsappNumber(config.whatsappNumber);
      setWelcomeMessage(config.welcomeMessage);
      setBrandColor(config.brandColor);
      setBannerText(config.bannerText);
      setCurrencySymbol(config.currencySymbol);
    } catch (e: any) {
      notify("error", "Error de restauración: " + e.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Auto load size suggestions based on age selection
  const handleAgeChangeAndAutoSizes = (age: 'baby' | 'toddler' | 'kid') => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      ageTag: age,
      sizes: STANDARD_SIZES[age] || []
    });
  };

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto px-4 md:px-6">
      {/* Status banner */}
      {statusMessage.text && (
        <div className={`fixed top-6 right-6 p-4 rounded-2xl shadow-xl z-50 text-xs md:text-sm font-semibold max-w-sm flex items-center gap-2 border animate-fade-in ${
          statusMessage.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Hero settings info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-6 md:p-8">
        <div>
          <h2 className="font-display font-semibold text-2xl text-slate-800">
            🔧 Panel de Control y Edición
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl">
            Modificá el nombre de tu tienda online, colores de marca, teléfono de WhatsApp o agregá y editá prendas en tiempo real con inteligencia artificial.
          </p>
        </div>

        <button
          onClick={handleResetStoreSubmit}
          disabled={resetLoading}
          className="flex items-center gap-1.5 self-start md:self-center text-xs bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all font-medium"
        >
          <Undo className="w-3.5 h-3.5" />
          {resetLoading ? "Restaurando..." : "Reiniciar Tienda Demo"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left columns: Settings form */}
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs lg:col-span-1 space-y-6">
          <h3 className="font-display font-semibold text-lg text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            🎨 Ajustes de Diseño y Marca
          </h3>

          <form onSubmit={handleSaveConfigSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                required
                value={storeTagline}
                onChange={e => setStoreTagline(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 5491123456789"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  required
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Texto en el Banner Superior
              </label>
              <input
                type="text"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Mensaje de Entrada (WhatsApp)
              </label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2 text-xs md:text-sm focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Colors picker selection */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                Color de Identidad
              </span>
              <div className="grid grid-cols-3 gap-2">
                {BRAND_COLORS.map(colorOpt => {
                  const isSelected = brandColor === colorOpt.value;
                  return (
                    <button
                      key={colorOpt.value}
                      type="button"
                      onClick={() => setBrandColor(colorOpt.value)}
                      className={`py-2 px-1 text-[11px] font-medium rounded-xl border flex flex-col items-center gap-1.5 transition-all text-slate-600 hover:text-slate-800 ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${colorOpt.primary}`} />
                      <span>{colorOpt.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className={`w-full py-3 rounded-2xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${currentBrand.primary} ${currentBrand.hover}`}
            >
              <Save className="w-4 h-4" />
              {saveLoading ? "Guardando..." : "Guardar Ajustes"}
            </button>
          </form>
        </section>

        {/* Right columns: Products list & Active product manager */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Edit Panel overlay or box if editing */}
          {editingProduct ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-md animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-text-50 pb-3">
                <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2">
                  {isAddingNew ? <Plus className="w-5 h-5 text-emerald-500" /> : <Edit className="w-5 h-5 text-amber-500" />}
                  {isAddingNew ? "Agregar Nueva Prenda" : `Editar Prenda: ${editingProduct.name}`}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="hover:bg-slate-100 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Form layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Conjunto de Hilo de Menta"
                      value={editingProduct.name || ""}
                      onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Categoría
                      </label>
                      <select
                        value={editingProduct.category || "Babys"}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-slate-300 rounded-xl px-2 py-2.5 text-xs md:text-sm focus:outline-hidden"
                      >
                        {CATEGORIES.slice(1).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Rango de Edad
                      </label>
                      <select
                        value={editingProduct.ageTag || "baby"}
                        onChange={e => handleAgeChangeAndAutoSizes(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-slate-300 rounded-xl px-2 py-2.5 text-xs md:text-sm focus:outline-hidden"
                      >
                        <option value="baby">Bebés (0-2 años)</option>
                        <option value="toddler">Niños Chicos (2-5 años)</option>
                        <option value="kid">Niños Grandes (6+ años)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Precio ({currencySymbol}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="flex flex-col justify-end pb-1 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingProduct.inStock ?? true}
                          onChange={e => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                          className="w-4 h-4 accent-slate-900 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">En Stock</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingProduct.isFeatured ?? false}
                          onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                          className="w-4 h-4 accent-slate-900 rounded"
                        />
                        <span className="text-xs font-semibold text-slate-700">Prenda Destacada</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Enlace de la Imagen (URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingProduct.image || ""}
                      onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-hidden font-mono"
                    />

                    {/* Cute preset selector icons */}
                    <div className="mt-2.5">
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                        O usa una imagen preestablecida:
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: "/src/assets/images/knit_romper_1780268520295.webp" })}
                          className="border border-slate-100 hover:border-slate-300 rounded-lg overflow-hidden w-11 h-11 relative"
                          title="Mameluco Tejido"
                        >
                          <img src="/src/assets/images/knit_romper_1780268520295.webp" alt="preset" className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: "/src/assets/images/linen_dress_1780268535594.webp" })}
                          className="border border-slate-100 hover:border-slate-300 rounded-lg overflow-hidden w-11 h-11 relative"
                          title="Vestido Lino"
                        >
                          <img src="/src/assets/images/linen_dress_1780268535594.webp" alt="preset" className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: "/src/assets/images/corduroy_overall_1780268551618.webp" })}
                          className="border border-slate-100 hover:border-slate-300 rounded-lg overflow-hidden w-11 h-11 relative"
                          title="Jardinero Mostaza"
                        >
                          <img src="/src/assets/images/corduroy_overall_1780268551618.webp" alt="preset" className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800" })}
                          className="border border-slate-100 hover:border-slate-300 rounded-lg overflow-hidden w-11 h-11 flex items-center justify-center bg-slate-50"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Additional Images textarea for hover cycling */}
                    <div className="mt-4">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Imágenes adicionales para carrusel en Hover (una URL por línea)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                        value={(editingProduct.images || []).join("\n")}
                        onChange={e => {
                          const urls = e.target.value.split("\n").map(u => u.trim()).filter(Boolean);
                          setEditingProduct({ ...editingProduct, images: urls });
                        }}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-mono leading-relaxed"
                      />
                      <span className="block text-[9px] text-slate-400 mt-1">
                        Al pasar el cursor sobre la prenda en la tienda, las imágenes cambiarán automáticamente cada 1 segundo.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side form */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Descripción del Producto *
                      </label>

                      {/* Gemini Assistant assistant button */}
                      <button
                        type="button"
                        onClick={handleGenerateAiDescription}
                        disabled={aiLoading}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 border transition-all ${
                          aiLoading
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:shadow-xs active:scale-95"
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                        {aiLoading ? "Escribiendo..." : "Generar con IA ✨"}
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      required
                      placeholder="Explica qué cómodo y lindo es el material..."
                      value={editingProduct.description || ""}
                      onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl px-3.5 py-2 text-xs md:text-sm focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                      Talles Habilitados:
                    </label>
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {STANDARD_SIZES[editingProduct.ageTag || "baby"]?.map(size => {
                        const isChecked = editingProduct.sizes?.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSize(size)}
                            className={`min-w-[42px] py-1 px-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              isChecked
                                ? `${currentBrand.primary} border-transparent text-white shadow-xs`
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Guardar Producto buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductDetail}
                  disabled={saveLoading}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 ${currentBrand.primary} ${currentBrand.hover}`}
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Procesando..." : "Guardar Producto"}
                </button>
              </div>
            </div>
          ) : (
            // Search toolbar + list
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-display font-semibold text-lg text-slate-800">
                  👕 Listado de Prendas ({products.length})
                </h3>

                <button
                  onClick={handleStartAdd}
                  className={`flex items-center gap-1 text-xs text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all ${currentBrand.primary} ${currentBrand.hover}`}
                >
                  <Plus className="w-4 h-4" />
                  Agregar Nueva Prenda
                </button>
              </div>

              {/* Search filter input */}
              <input
                type="text"
                placeholder="🔍 Filtrar prendas del administrador..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden"
              />

              {/* Grid or Table layout for manager */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-none"
                        />
                        <div>
                          <h4 className="font-display font-semibold text-slate-800 text-sm">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
                            <span>{p.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-500 uppercase">{p.ageTag}</span>
                            <span>•</span>
                            <span>Talles: [{p.sizes.join(", ")}]</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div className="text-right">
                          <div className="font-bold text-slate-700 text-sm font-sans">
                            {currencySymbol === "$" ? "$ " : currencySymbol}{p.price.toLocaleString("es-AR")} ARS
                          </div>
                          <span className={`text-[9px] font-bold uppercase ${p.inStock ? "text-emerald-500" : "text-rose-500"}`}>
                            {p.inStock ? "Stock" : "Agotado"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-2 rounded-xl transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {products.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No has agregado ninguna prenda todavía. Haz clic en "Agregar Nueva Prenda" arriba.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
