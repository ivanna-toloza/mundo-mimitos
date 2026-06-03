export interface CategoryDef {
  value: string;
  label: string;
  desc: string;
  emoji: string;
}

export interface AgeGroupDef {
  key: string;
  label: string;
  sizes: string[];
}

export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  whatsappNumber: string;
  welcomeMessage: string;
  bannerText: string;
  bannerImage: string;
  brandColor: string;
  logoUrl: string;
  currencySymbol: string;
  categories?: CategoryDef[];
  ageGroups?: AgeGroupDef[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  ageTag: string;
  price: number;
  sizes: string[];
  description: string;
  image: string;
  images: string[];
  inStock: boolean;
  isFeatured: boolean;
}

export interface StoreData {
  config: StoreConfig;
  products: Product[];
}
