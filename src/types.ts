export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  whatsappNumber: string;
  welcomeMessage: string;
  bannerText: string;
  bannerImage: string;
  brandColor: string; // 'rose' | 'babyBlue' | 'emerald' | 'amber' | 'lavender' | 'slate'
  logoUrl: string;
  currencySymbol: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  ageTag: 'baby' | 'toddler' | 'kid'; // baby=0-2, toddler=2-5, kid=6+
  price: number;
  sizes: string[];
  description: string;
  image: string;
  images?: string[];
  inStock: boolean;
  isFeatured: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (productId + "_" + selectedSize)
  product: Product;
  size: string;
  quantity: number;
}

export type AgeCategory = 'all' | 'baby' | 'toddler' | 'kid';

export const BRAND_COLORS = [
  { name: 'Vibrant Pink / Coral', value: 'rose', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-300', primary: 'bg-pink-500', hover: 'hover:bg-pink-600', accent: 'text-pink-500', focus: 'focus:ring-pink-500' },
  { name: 'Celeste Cielo / Sky', value: 'babyBlue', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-300', primary: 'bg-sky-500', hover: 'hover:bg-sky-600', accent: 'text-sky-500', focus: 'focus:ring-sky-500' },
  { name: 'Naranja Alegría / Sun', value: 'amber', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-300', primary: 'bg-orange-500', hover: 'hover:bg-orange-600', accent: 'text-orange-500', focus: 'focus:ring-orange-500' },
  { name: 'Verde Menta / Mint', value: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-300', primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600', accent: 'text-emerald-500', focus: 'focus:ring-emerald-500' },
  { name: 'Morado Chicle', value: 'lavender', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-300', primary: 'bg-violet-500', hover: 'hover:bg-violet-600', accent: 'text-violet-500', focus: 'focus:ring-violet-500' },
  { name: 'Gris Grafito', value: 'slate', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300', primary: 'bg-slate-700', hover: 'hover:bg-slate-800', accent: 'text-slate-700', focus: 'focus:ring-slate-700' }
];

export const CATEGORIES = [
  "Todo el Catálogo",
  "Babys",
  "Niños",
  "Niñas",
  "Kids",
  "Teens"
];

export const AGE_TAG_LABELS: Record<string, string> = {
  baby: "Bebés (0-2 años)",
  toddler: "Niños Pequeños (2-5 años)",
  kid: "Chicos (6+ años)"
};

export const STANDARD_SIZES: Record<string, string[]> = {
  baby: ["RN", "1M", "3M", "6M", "12M", "18M"],
  toddler: ["18M", "2A", "3A", "4A", "5A"],
  kid: ["4A", "6A", "8A", "10A", "12A"]
};
