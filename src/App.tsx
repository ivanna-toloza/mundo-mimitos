import React, { useState, useEffect, useRef } from "react";
import { StoreConfig, Product, CartItem, AgeCategory, BRAND_COLORS, CATEGORIES, AGE_TAG_LABELS, STANDARD_SIZES } from "./types";
import { ProductCard } from "./components/ProductCard";
import { ProductModal } from "./components/ProductModal";
import { CartDrawer } from "./components/CartDrawer";
import { AdminPanel } from "./components/AdminPanel";
import { ShoppingBag, Settings, Sparkles, BookOpen, Heart, Eye, ArrowRight, Shield, PhoneCall, AlertCircle, Trash2, Plus, X, Check, Image as ImageIcon, Save, Undo } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Store Config & Products arrays loaded from backend list
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Navigation and Filter variables
  const [adminMode, setAdminMode] = useState(false);
  const [activeAge, setActiveAge] = useState<AgeCategory>("all");
  const [activeCategory, setActiveCategory] = useState("Todo el Catálogo");
  const [searchQuery, setSearchQuery] = useState("");

  // Shopping Cart & Detail Overlay States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- LOCAL FORM STATES FOR INLINE EDITOR MODALS ---
  const [isEditGeneralOpen, setIsEditGeneralOpen] = useState(false);
  const [productModalForm, setProductModalForm] = useState<Partial<Product> | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [storeNameState, setStoreNameState] = useState("");
  const [storeTaglineState, setStoreTaglineState] = useState("");
  const [whatsappNumberState, setWhatsappNumberState] = useState("");
  const [welcomeMessageState, setWelcomeMessageState] = useState("");
  const [brandColorState, setBrandColorState] = useState("");
  const [bannerTextState, setBannerTextState] = useState("");
  const [bannerImageState, setBannerImageState] = useState("");
  const [logoUrlState, setLogoUrlState] = useState("");
  const [currencySymbolState, setCurrencySymbolState] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", text: "" });

  // Admin auth
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ADMIN_PASSWORD = "mimitos2025";

  const showNotification = (type: string, text: string) => {
    setNotification({ show: true, type, text });
    setTimeout(() => {
      setNotification({ show: false, type: "", text: "" });
    }, 4000);
  };

  // Load store details
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/store");
      if (!res.ok) throw new Error("Error de conexión al cargar el catálogo.");
      const data = await res.json();
      setConfig(data.config);
      setProducts(data.products);

      // Prepopulate individual form fields
      if (data.config) {
        setStoreNameState(data.config.storeName || "");
        setStoreTaglineState(data.config.storeTagline || "");
        setWhatsappNumberState(data.config.whatsappNumber || "");
        setWelcomeMessageState(data.config.welcomeMessage || "");
        setBrandColorState(data.config.brandColor || "");
        setBannerTextState(data.config.bannerText || "");
        setBannerImageState(data.config.bannerImage || "");
        setLogoUrlState(data.config.logoUrl || "");
        setCurrencySymbolState(data.config.currencySymbol || "$");
      }
    } catch (err: any) {
      console.error(err);
      setError("No pudimos conectar con la base de datos de la tienda online. Por favor recarga o asegúrate de iniciar el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("mm_admin") === "true") setAdminMode(true);
  }, []);

  useEffect(() => {
    fetchStoreData();
    // Load local storage cart
    const savedCart = localStorage.getItem("pequenos_rayos_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update backend config saving
  const handleSaveConfig = async (newConfig: StoreConfig) => {
    setError("");
    const res = await fetch("/api/store/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig)
    });
    if (!res.ok) throw new Error("No se pudo guardar la configuración.");
    const data = await res.json();
    if (data.success) {
      setConfig(newConfig);
    }
  };

  // Update backend products saving
  const handleSaveProducts = async (newProducts: Product[]) => {
    setError("");
    const res = await fetch("/api/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProducts)
    });
    if (!res.ok) throw new Error("No se pudieron guardar los productos.");
    const data = await res.json();
    if (data.success) {
      setProducts(newProducts);
    }
  };

  // Reset entire catalog to server defaults
  const handleResetStore = async () => {
    setError("");
    const res = await fetch("/api/store/reset", {
      method: "POST"
    });
    if (!res.ok) throw new Error("No se pudo reiniciar la base de datos.");
    const data = await res.json();
    if (data.success) {
      setConfig(data.data.config);
      setProducts(data.data.products);

      // Prepopulate form fields after restore
      const cfg = data.data.config;
      if (cfg) {
        setStoreNameState(cfg.storeName || "");
        setStoreTaglineState(cfg.storeTagline || "");
        setWhatsappNumberState(cfg.whatsappNumber || "");
        setWelcomeMessageState(cfg.welcomeMessage || "");
        setBrandColorState(cfg.brandColor || "");
        setBannerTextState(cfg.bannerText || "");
        setBannerImageState(cfg.bannerImage || "");
        setLogoUrlState(cfg.logoUrl || "");
        setCurrencySymbolState(cfg.currencySymbol || "$");
      }
    }
  };

  // --- FRONTEND HANDLERS FOR INLINE EDIT ACTIONS ---
  const handleStartAddProduct = () => {
    setProductModalForm({
      id: "p_" + Date.now(),
      name: "",
      category: "Babys",
      ageTag: "baby",
      price: 0,
      sizes: ["RN", "1M", "3M", "6M"],
      description: "",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
      images: [],
      inStock: true,
      isFeatured: false
    });
    setIsAddingProduct(true);
  };

  const handleStartEditProduct = (product: Product) => {
    setProductModalForm({ ...product });
    setIsAddingProduct(false);
  };

  const handleDeleteProductAction = async (product: Product) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la prenda "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const nextProducts = products.filter(p => p.id !== product.id);
      await handleSaveProducts(nextProducts);
      showNotification("success", "Prenda eliminada con éxito");
    } catch (e: any) {
      showNotification("error", "Error al eliminar prenda: " + e.message);
    }
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModalForm || !productModalForm.name || !productModalForm.price || productModalForm.price <= 0) {
      showNotification("error", "Por favor, completa el nombre y un precio válido.");
      return;
    }
    setSaveLoading(true);
    try {
      let nextProducts: Product[];
      if (isAddingProduct) {
        nextProducts = [productModalForm as Product, ...products];
      } else {
        nextProducts = products.map(p => p.id === productModalForm.id ? (productModalForm as Product) : p);
      }
      await handleSaveProducts(nextProducts);
      setProductModalForm(null);
      showNotification("success", `¡Prenda ${isAddingProduct ? "creada" : "guardada"} exitosamente!`);
    } catch (err: any) {
      showNotification("error", "Error al guardar prensa: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!productModalForm || !productModalForm.name || !productModalForm.category) {
      showNotification("error", "Completa primero el nombre y categoría de la prenda.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productModalForm.name,
          category: productModalForm.category,
          ageTag: productModalForm.ageTag
        })
      });
      const data = await response.json();
      if (response.ok && data.description) {
        setProductModalForm({ ...productModalForm, description: data.description });
        showNotification("success", "¡Descripción mágica de IA generada!");
      } else {
        throw new Error(data.error || "Error de red con Gemini.");
      }
    } catch (err: any) {
      showNotification("error", "Incapaz de generar descripción: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const updatedConfig: StoreConfig = {
        storeName: storeNameState,
        storeTagline: storeTaglineState,
        whatsappNumber: whatsappNumberState,
        welcomeMessage: welcomeMessageState,
        brandColor: brandColorState,
        bannerText: bannerTextState,
        bannerImage: bannerImageState,
        logoUrl: logoUrlState,
        currencySymbol: currencySymbolState
      };
      await handleSaveConfig(updatedConfig);
      setIsEditGeneralOpen(false);
      showNotification("success", "¡Cambios de diseño generales guardados!");
    } catch (err: any) {
      showNotification("error", "Error al guardar el diseño: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetStoreAction = async () => {
    if (!window.confirm("¿Seguro que deseas volver al catálogo de prueba original y borrar cambios?")) return;
    try {
      await handleResetStore();
      showNotification("success", "Catálogo original restaurado");
    } catch (e: any) {
      showNotification("error", "Error al restaurar: " + e.message);
    }
  };

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      if (adminMode) {
        setAdminMode(false);
        sessionStorage.removeItem("mm_admin");
      } else {
        setShowPasswordModal(true);
      }
    } else {
      logoClickTimerRef.current = setTimeout(() => { logoClickCountRef.current = 0; }, 2000);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminMode(true);
      sessionStorage.setItem("mm_admin", "true");
      setShowPasswordModal(false);
      setAdminPassword("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showNotification("error", "Contraseña incorrecta");
      setAdminPassword("");
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string) => {
    const cartItemId = `${product.id}_${size}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      let nextCart;
      if (existing) {
        nextCart = prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        nextCart = [...prev, { id: cartItemId, product, size, quantity: 1 }];
      }
      localStorage.setItem("pequenos_rayos_cart", JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart(prev => {
      const nextCart = prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      localStorage.setItem("pequenos_rayos_cart", JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => {
      const nextCart = prev.filter(item => item.id !== id);
      localStorage.setItem("pequenos_rayos_cart", JSON.stringify(nextCart));
      return nextCart;
    });
  };

  // Rendering parameters
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-rose-500 rounded-full animate-spin" />
          <h2 className="font-display font-medium text-slate-800 text-lg">Cargando Tienda de Ropa Online</h2>
          <p className="text-slate-400 text-xs">Preparando tejidos y mamelucos suaves...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 max-w-md shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-display font-semibold text-xl text-slate-800">¡Ups! Algo salió mal</h2>
          <p className="text-slate-500 text-sm">{error || "No fue posible recuperar la configuración."}</p>
          <button
            onClick={fetchStoreData}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  // Find style elements
  const currentBrand = BRAND_COLORS.find(c => c.value === config.brandColor) || BRAND_COLORS[0];
  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter Catalog Products
  const filteredProducts = products.filter(p => {
    const ageMatches = activeAge === "all" || p.ageTag === activeAge;
    const categoryMatches = activeCategory === "Todo el Catálogo" || activeCategory === "Todos" || p.category === activeCategory;
    const searchMatches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return ageMatches && categoryMatches && searchMatches;
  });

  const featuredProducts = products.filter(p => p.isFeatured && p.inStock);

  const renderColorfulName = (name: string) => {
    // Colors taken directly from the Mundo Mimitos logo: pink, sage green, lavender, orange
    const textColors = [
      "text-[#E8658A]",
      "text-[#8BAF6A]",
      "text-[#C5A8D9]",
      "text-[#F0A030]",
    ];
    let colorIndex = 0;
    return name.split("").map((char, index) => {
      if (char === " ") {
        return <span key={index} className="inline-block">&nbsp;</span>;
      }
      const colorClass = textColors[colorIndex % textColors.length];
      colorIndex++;
      return (
        <span key={index} className={`${colorClass} inline-block transition-transform hover:scale-110 duration-150`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className={`min-h-screen bg-sky-50 flex flex-col transition-colors duration-300`}>
      {/* 1. Anuncio Banner Superior */}
      {config.bannerText && (
        <div className={`${currentBrand.primary} text-white text-[11px] md:text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-xs flex items-center justify-center gap-1.5 transition-colors duration-300 relative`}>
          <span>{config.bannerText}</span>
          {adminMode && (
            <button
              onClick={() => setIsEditGeneralOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 hover:bg-white text-[9px] font-black px-2 py-0.5 rounded-md hover:scale-105 transition-all cursor-pointer shadow-xs"
            >
              ✏️ Editar Anuncio
            </button>
          )}
        </div>
      )}

      {/* 2. Top Header Navigation */}
      <header className="bg-sky-50/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 border-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className={`flex items-center gap-3.5 min-w-0 relative p-1 rounded-2xl transition-all ${adminMode ? "border-2 border-dashed border-pink-400 bg-pink-100/10" : ""}`}>
            {adminMode && (
              <button
                onClick={() => setIsEditGeneralOpen(true)}
                className="absolute -top-3 -right-3 bg-pink-500 hover:bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md transition-all active:scale-90 cursor-pointer flex items-center gap-1 z-10"
                title="Editar Nombre, Logo y WhatsApp"
              >
                ✏️ Editar Marca
              </button>
            )}
            <img
              src={config?.logoUrl || "/src/assets/images/mundo_mimitos_logo_nuevo.jpeg"}
              alt="Logo Mundo Mimitos"
              referrerPolicy="no-referrer"
              onClick={handleLogoClick}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full border-4 border-pink-100 shadow-md cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 bg-white p-0 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display font-black text-lg md:text-2xl leading-none tracking-tight truncate flex items-center">
                {renderColorfulName(config?.storeName || "Mundo Mimitos")}
              </h1>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold mt-1.5 truncate hidden sm:block">
                {config?.storeTagline || "Ropa suave y amorosa para bebés y niños"}
              </p>
            </div>
          </div>

          {/* Quick search bar client view */}
          {!adminMode && (
            <div className="hidden md:flex max-w-sm w-full relative">
              <input
                type="text"
                placeholder="Buscar mamelucos, vestidos, conjuntos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-5-0 hover:bg-slate-100/75 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-hidden transition-all duration-200"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
            </div>
          )}

          {/* Controls Panel (Cart drawer and Administrar Switcher) */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Admin Exit Button — only visible when logged in as admin */}
            {adminMode && (
              <button
                onClick={() => {
                  setAdminMode(false);
                  sessionStorage.removeItem("mm_admin");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-2xl transition-all active:scale-95 border cursor-pointer bg-slate-900 border-slate-900 text-white shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Catálogo</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            {!adminMode && (
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 rounded-2xl transition-all border border-slate-155 active:scale-95 bg-white shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer`}
              >
                <div className="relative">
                  <ShoppingBag className={`w-5 h-5 text-slate-700`} />
                  {totalCartQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalCartQty}
                    </span>
                  )}
                </div>
                {totalCartQty > 0 && (
                  <span className="text-xs font-bold text-slate-700 font-sans hidden sm:block">
                    {config.currencySymbol === "$" ? "$ " : config.currencySymbol}{cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toLocaleString("es-AR")} ARS
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        {/* Invisible smooth fade-out gradient overlay to blend into body */}
        <div className="h-4 w-full bg-gradient-to-b from-sky-50/80 to-transparent pointer-events-none absolute top-full left-0 right-0 z-20" />
      </header>

      {/* 3. Main Frame */}
      <main className="flex-1 pb-16">
        {/* Persistent Admin Banner on Active Editor View */}
        {adminMode && (
          <div className="bg-slate-900 text-white py-3.5 px-4 shadow-xl sticky top-[72px] md:top-[90px] border-b border-white/10 z-30">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold tracking-wide">
                  ✨ <span className="text-pink-300">MODO EDITOR COMBINADO</span> • Hacé clic directamente sobre los títulos, banners o prendas para editarlos.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setIsEditGeneralOpen(true)}
                  className="bg-sky-500 hover:bg-sky-600 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  ⚙️ Configuración Global
                </button>
                <button
                  onClick={handleStartAddProduct}
                  className="bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  ➕ Agregar Prenda
                </button>
                <button
                  onClick={handleResetStoreAction}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-705 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 transition-all active:scale-95 cursor-pointer"
                >
                  🔄 Reiniciar Catálogo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Store & Editing Layout Grid */}
        <div className="space-y-12">
          
          {/* 3a. Hero Canvas Option with Direct Admin Controls */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 animate-fade-in relative">
            <div className={`relative min-h-[340px] md:min-h-[420px] rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-yellow-250 via-orange-100 to-orange-200 border-4 border-dashed border-white/40 shadow-xs flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 group transition-all duration-300 ${adminMode ? "border-pink-400/80 bg-pink-100/10" : ""}`}>
              {/* Banner backdrop image */}
              <img
                src={config.bannerImage || "/src/assets/images/shop_hero_1780268503557.png"}
                alt="kids apparel catalog"
                className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay filter brightness-105"
                referrerPolicy="no-referrer"
              />

              {/* Ambient light glow container */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-100/70 via-transparent to-transparent pointer-events-none" />

              {/* Left Side: Content display */}
              <div className="relative max-w-xl text-slate-800 space-y-3.5 md:space-y-5 z-10 flex-1">
                <span className="inline-block bg-white text-orange-600 px-4 py-1  rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest w-fit shadow-xs">
                  💫 Colección Especial
                </span>
                <h2 className="font-display font-black text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight md:mt-1 text-slate-800">
                  Suavidad única para abrazar su crecimiento
                </h2>
                <p className="text-slate-600 text-xs md:text-base font-semibold leading-relaxed max-w-md">
                  Prendas de calidad premium pensadas para la comodidad diaria. Máxima respirabilidad y mimos para su piel delicada.
                </p>
              </div>

              {/* Right Side: Big High-Res Logo Center Highlight */}
              <div className="relative shrink-0 z-10 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-pink-250/30 rounded-full blur-3xl transform scale-125" />
                <img
                  src={config?.logoUrl || "/src/assets/images/mundo_mimitos_logo_nuevo.jpeg"}
                  alt="Logo Mundo Mimitos Grande"
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 object-cover rounded-full border-[6px] border-white shadow-2xl transition-all duration-300 hover:scale-105 bg-white p-0 relative"
                />
                <div className="absolute -bottom-3 bg-white text-pink-600 px-4 py-1 rounded-full text-[10px] md:text-xs font-black shadow-md border-2 border-pink-100 uppercase tracking-wider">
                  ✨ Tienda Oficial
                </div>
              </div>

              {adminMode && (
                <div className="absolute top-6 right-6 z-10 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsEditGeneralOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 border border-slate-200"
                  >
                    🖼️ Cambiar Imagen Fondo
                  </button>
                  <button
                    onClick={() => setIsEditGeneralOpen(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    ✏️ Editar Textos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3b. Age Filter Rails & Categories Panel */}
          <section className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-6 bg-white rounded-[2.5rem] p-6 md:p-8 border-2 border-yellow-250 shadow-xs">
              <div>
                <h3 className="font-display font-black text-lg md:text-xl text-slate-800 flex items-center gap-2">
                  👶 ¿Para qué edad buscás ropa?
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Filtros prácticos ordenados por el crecimiento de tu pequeño</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {[
                  { value: "Todo el Catálogo", label: "Todo el Catálogo", desc: "Ver todo", emoji: "👚" },
                  { value: "Babys", label: "Babys", desc: "0 a 24 meses", emoji: "🍼" },
                  { value: "Niños", label: "Niños", desc: "Varones", emoji: "🧸" },
                  { value: "Niñas", label: "Niñas", desc: "Nenas", emoji: "👗" },
                  { value: "Kids", label: "Kids", desc: "6 a 12 años", emoji: "🎒" },
                  { value: "Teens", label: "Teens", desc: "Más de 12 años", emoji: "🛹" }
                ].map(tab => {
                  const isSelected = activeCategory === tab.value;
                  const displayEmoji = tab.emoji;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => {
                        setActiveCategory(tab.value);
                        setActiveAge("all");
                      }}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all active:scale-[0.97] cursor-pointer flex flex-col items-center text-center gap-2.5 min-w-0 ${
                        isSelected
                          ? `${currentBrand.primary} border-transparent text-white shadow-md font-bold scale-[1.02]`
                          : "bg-slate-50 border-slate-100 hover:bg-slate-150/50 text-slate-800 hover:text-slate-900 shadow-xs"
                      }`}
                    >
                      <span className="text-2xl bg-white p-1.5 px-3 rounded-xl shadow-xs shrink-0 flex items-center justify-center">{displayEmoji}</span>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h4 className="font-display font-extrabold text-xs sm:text-sm leading-tight break-words">{tab.label}</h4>
                        <p className={`text-[9px] sm:text-[10px] mt-1 leading-tight font-medium ${isSelected ? "text-white/80" : "text-slate-400"}`}>{tab.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3c. Featured Section (Optional highlight) */}
          {featuredProducts.length > 0 && activeAge === "all" && (activeCategory === "Todo el Catálogo" || activeCategory === "Todos") && (
            <section className="bg-gradient-to-t from-slate-100/50 via-slate-50/30 to-transparent py-8 border-y border-slate-100/20">
              <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] tracking-widest font-bold uppercase ${currentBrand.accent}`}>Los Favoritos de Mamás</span>
                    <h3 className="font-display font-semibold text-lg md:text-xl text-slate-800 mt-0.5">💖 Productos Destacados</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {featuredProducts.slice(0, 3).map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currencySymbol={config.currencySymbol}
                      brandColorValue={config.brandColor}
                      onOpenDetails={setSelectedProduct}
                      adminMode={adminMode}
                      onEdit={handleStartEditProduct}
                      onDelete={handleDeleteProductAction}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 3d. Cloth Type Categories & Grid List */}
          <section className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="space-y-6">
              {/* Tool bar showing current filter count */}
              <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border-2 border-yellow-250 shadow-xs flex-wrap md:flex-nowrap gap-4">
                <div className="text-xs md:text-sm text-slate-650 font-bold">
                  Mostrando <span className="font-extrabold text-pink-500">{filteredProducts.length}</span> prendas en <span className="text-slate-800">{activeCategory}</span>
                </div>

                <div className="flex items-center gap-2">
                   {/* Mobile search bar if on small screen */}
                   <input
                    type="text"
                    placeholder="🔍 Buscar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-55 hover:bg-slate-100 border border-slate-205 focus:border-slate-300 focus:bg-white rounded-xl px-2.5 py-1 text-[11px] focus:outline-hidden md:hidden w-32"
                  />
                </div>
              </div>

              {/* Full-width Products Grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Inline "Add New Product" card block */}
                {adminMode && (
                  <div
                    onClick={handleStartAddProduct}
                    className="bg-white/40 hover:bg-white/80 border-4 border-dashed border-emerald-300 hover:border-emerald-500 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] min-h-[350px] shadow-xs group"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl font-black group-hover:scale-110 transition-transform shadow-xs">
                      ➕
                    </div>
                    <div>
                      <h4 className="font-display font-black text-slate-800 text-base">Crear Nueva Prenda</h4>
                      <p className="text-slate-400 text-[11px] mt-1.5 max-w-[190px] leading-relaxed font-semibold">
                        Hacé clic acá para crear una prenda en tu catálogo asistido por la IA.
                      </p>
                    </div>
                  </div>
                )}

                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currencySymbol={config.currencySymbol}
                    brandColorValue={config.brandColor}
                    onOpenDetails={setSelectedProduct}
                    adminMode={adminMode}
                    onEdit={handleStartEditProduct}
                    onDelete={handleDeleteProductAction}
                  />
                ))}

                {/* Customer Benefits Badge card inside grid */}
                <div className="bg-pink-50 rounded-[2.5rem] p-6 border-2 border-pink-200 text-xs flex flex-col justify-between shadow-xs">
                  <div>
                    <h5 className="font-display font-black text-pink-700 mb-2 flex items-center gap-1.5 text-xs">
                      🔒 Compra Cómoda y Segura
                    </h5>
                    <p className="text-slate-650 leading-relaxed font-semibold mb-3">
                      Elegí tus prendas preferidas de nuestro catálogo y hacé el pedido por WhatsApp. Acordás el talle, colores y método de envío directo con nosotros.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-black text-pink-800 uppercase tracking-wider text-[10px]">
                    <span>✓ 100% Algodón Peinado</span>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-slate-300 text-2xl">🧸</div>
                  <h4 className="font-display font-semibold text-slate-700 text-base">La percha está vacía</h4>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">
                    No encontramos prendas de bebés o chicos para tu selección de filtros actual de "{activeCategory}".
                  </p>
                  <button
                    onClick={() => {
                      setActiveAge("all");
                      setActiveCategory("Todo el Catálogo");
                      setSearchQuery("");
                    }}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-all`}
                  >
                    Limpiar Todos los Filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-100 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img
              src={config?.logoUrl || "/src/assets/images/mundo_mimitos_logo_nuevo.jpeg"}
              alt="Logo Mundo Mimitos"
              referrerPolicy="no-referrer"
              className="w-20 h-20 object-cover rounded-full border border-pink-100 shadow-sm p-0 bg-white"
            />
            <div>
              <h4 className="font-display font-extrabold text-slate-800 text-base">{config?.storeName || "Mundo Mimitos"}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm font-semibold">{config?.storeTagline || "Ropa suave y amorosa para bebés y niños"}</p>
            </div>
          </div>
          <div className="text-slate-400 text-[11px] md:text-xs font-bold leading-relaxed">
            <div>© {new Date().getFullYear()} {config?.storeName || "Mundo Mimitos"}.</div>
            <div className="text-[10px] text-slate-350 font-semibold mt-0.5">Catálogo de Ropa Infantil de Alta Calidad Peinada.</div>
            <div className="text-xs text-slate-500 font-semibold mt-1.5">
              Diseñado por{" "}
              <a
                href="https://igs-solucionesweb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 font-bold underline underline-offset-2 transition-colors"
              >
                IGS Soluciones Web
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Drawers / Modals Overlays */}
      <ProductModal
        product={selectedProduct}
        currencySymbol={config.currencySymbol}
        brandColorValue={config.brandColor}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cart}
        config={config}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* 5a. General Settings Modal */}
      {isEditGeneralOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl relative border-4 border-dashed border-pink-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditGeneralOpen(false)}
              className="absolute top-5 right-5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">
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
                  value={storeNameState}
                  onChange={e => setStoreNameState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  required
                  value={storeTaglineState}
                  onChange={e => setStoreTaglineState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
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
                    value={whatsappNumberState}
                    onChange={e => setWhatsappNumberState(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                    Símbolo de Moneda
                  </label>
                  <input
                    type="text"
                    required
                    value={currencySymbolState}
                    onChange={e => setCurrencySymbolState(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Texto en el Banner Superior
                </label>
                <input
                  type="text"
                  value={bannerTextState}
                  onChange={e => setBannerTextState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  URL del Logo (*Imagen de la Marca)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/logo.png"
                  value={logoUrlState}
                  onChange={e => setLogoUrlState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  URL de Imagen de Fondo de Banner/Hero
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/banner.png"
                  value={bannerImageState}
                  onChange={e => setBannerImageState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Mensaje de Entrada (WhatsApp)
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessageState}
                  onChange={e => setWelcomeMessageState(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden font-semibold text-slate-700 leading-relaxed"
                />
              </div>

              {/* Colors picker selection */}
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Color de Identidad de Marca
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {BRAND_COLORS.map(colorOpt => {
                    const isSelected = brandColorState === colorOpt.value;
                    return (
                      <button
                        key={colorOpt.value}
                        type="button"
                        onClick={() => setBrandColorState(colorOpt.value)}
                        className={`py-2 px-1 text-[11px] font-bold rounded-xl border flex flex-col items-center gap-1 transition-all text-slate-650 hover:text-slate-800 cursor-pointer ${
                          isSelected
                            ? "border-slate-950 bg-slate-900 text-white shadow-xs"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${colorOpt.primary}`} />
                        <span>{colorOpt.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className={`w-full py-3 rounded-2xl text-xs font-black text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2 ${currentBrand.primary} ${currentBrand.hover}`}
              >
                <Save className="w-4 h-4" />
                {saveLoading ? "Guardando..." : "Guardar Ajustes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5b. Add/Edit Product Modal */}
      {productModalForm !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 md:p-8 shadow-2xl relative border-4 border-dashed border-emerald-250 animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductModalForm(null)}
              className="absolute top-5 right-5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">
              {isAddingProduct ? "➕ Agregar Prenda al Catálogo" : "✏️ Editar Detalles de la Prenda"}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Nombre de la Prenda *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Vestidito Mimitos Rosa"
                      value={productModalForm.name || ""}
                      onChange={e => setProductModalForm({ ...productModalForm, name: e.target.value })}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Categoría
                      </label>
                      <select
                        value={productModalForm.category || "Babys"}
                        onChange={e => setProductModalForm({ ...productModalForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-150 focus:border-slate-300 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
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
                        value={productModalForm.ageTag || "baby"}
                        onChange={e => {
                          const val = e.target.value as any;
                          setProductModalForm({
                            ...productModalForm,
                            ageTag: val,
                            sizes: STANDARD_SIZES[val] || []
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-150 focus:border-slate-300 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
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
                        Precio ({currencySymbolState}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={productModalForm.price || 0}
                        onChange={e => setProductModalForm({ ...productModalForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex flex-col justify-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-750 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productModalForm.inStock ?? true}
                          onChange={e => setProductModalForm({ ...productModalForm, inStock: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 rounded focus:ring-0 cursor-pointer"
                        />
                        <span>¿Disponible en Stock?</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      URL de la Foto Principal
                    </label>
                    <input
                      type="url"
                      required
                      value={productModalForm.image || ""}
                      onChange={e => setProductModalForm({ ...productModalForm, image: e.target.value })}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-750 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Descripción de la Prenda
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      required
                      placeholder="Describí los detalles, suavidad, material..."
                      value={productModalForm.description || ""}
                      onChange={e => setProductModalForm({ ...productModalForm, description: e.target.value })}
                      className="w-full flex-1 bg-slate-50 focus:bg-white border border-slate-150 focus:border-slate-300 rounded-xl p-3 text-xs focus:outline-hidden font-semibold text-slate-700 leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                      Talles Disponibles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_SIZES[productModalForm.ageTag as 'baby' | 'toddler' | 'kid']?.map(size => {
                        const isSelected = productModalForm.sizes?.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              const curr = productModalForm.sizes || [];
                              const next = curr.includes(size) ? curr.filter(s => s !== size) : [...curr, size];
                              setProductModalForm({ ...productModalForm, sizes: next });
                            }}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-slate-900 border-slate-950 text-white"
                                : "bg-slate-55 border-slate-150 hover:bg-slate-100"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-755 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productModalForm.isFeatured ?? false}
                        onChange={e => setProductModalForm({ ...productModalForm, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="text-pink-650 font-black">💫 Destacar en Portada (Sección Favoritos)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalForm(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Guardando..." : "Guardar Prenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5c. Admin Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-black text-xl text-slate-800">Acceso Administrador</h3>
              <p className="text-slate-400 text-xs mt-1.5">Ingresá tu contraseña para continuar</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400 transition-colors"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setAdminPassword(""); }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5d. Toast Notification Alert */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl z-55 text-xs sm:text-sm font-semibold max-w-sm flex items-center gap-2 border animate-fade-in ${
          notification.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          <div className="w-2 md:w-4 h-2 md:h-2.5 rounded-full bg-current animate-ping shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}
    </div>
  );
}
