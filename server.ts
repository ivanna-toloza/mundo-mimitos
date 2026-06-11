import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { query } from "./src/database/db";
import { initializeDatabase } from "./src/database/init";
import type { StoreConfig, Product, StoreData } from "./src/database/types";

// Default initial database in case database is empty
const DEFAULT_DATA = {
  config: {
    storeName: "Mundo Mimitos",
    storeTagline: "Ropa suave y amorosa para bebés y niños",
    whatsappNumber: "5491123456789",
    welcomeMessage: "¡Hola! Vi la tienda online y me gustaría consultar por los siguientes productos: 💛",
    bannerText: "✨ Envíos a todo el país | Ropa hipoalergénica de algodón 100% suave y amoroso ✨",
    bannerImage: "/src/assets/images/shop_hero_1780268503557.webp",
    brandColor: "rose",
    logoUrl: "/src/assets/images/mundo_mimitos_logo_nuevo.webp",
    currencySymbol: "$",
    categories: [
      { value: "Babys", label: "Babys", desc: "0 a 24 meses", emoji: "🍼" },
      { value: "Niños", label: "Niños", desc: "Varones", emoji: "🧸" },
      { value: "Niñas", label: "Niñas", desc: "Nenas", emoji: "👗" },
      { value: "Kids", label: "Kids", desc: "6 a 12 años", emoji: "🎒" },
      { value: "Teens", label: "Teens", desc: "Más de 12 años", emoji: "🛹" }
    ],
    ageGroups: [
      { key: "baby", label: "Bebés (0-2 años)", sizes: ["RN", "1M", "3M", "6M", "12M", "18M"] },
      { key: "toddler", label: "Niños Pequeños (2-5 años)", sizes: ["18M", "2A", "3A", "4A", "5A"] },
      { key: "kid", label: "Chicos (6+ años)", sizes: ["4A", "6A", "8A", "10A", "12A"] }
    ]
  },
  products: [
    {
      "id": "p1",
      "name": "Mameluco de Punto Premium",
      "category": "Babys",
      "ageTag": "baby",
      "price": 18500,
      "sizes": ["RN", "3M", "6M", "12M"],
      "description": "Exquisito mameluco tejido en algodón súper peinado. Hipoalergénico, sutilmente abrigado y ultra suave para las pieles más tiernas de tus bebés. Cuenta con broches de madera natural.",
      "image": "/src/assets/images/knit_romper_1780268520295.webp",
      "images": [
        "/src/assets/images/knit_romper_1780268520295.webp",
        "https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": true
    },
    {
      "id": "p2",
      "name": "Vestido de Lino Floreado Rústico",
      "category": "Niñas",
      "ageTag": "toddler",
      "price": 24000,
      "sizes": ["12M", "18M", "2A", "3A"],
      "description": "Elegante vestido de lino con mangas de volados y estampado botánico de flores silvestres en tonos rosados empolvados. Fresco, cómodo y diseñado para dar libertad de movimiento al andar.",
      "image": "/src/assets/images/linen_dress_1780268535594.webp",
      "images": [
        "/src/assets/images/linen_dress_1780268535594.webp",
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": true
    },
    {
      "id": "p3",
      "name": "Jardinero Corderoy Mostaza Unisex",
      "category": "Niños",
      "ageTag": "kid",
      "price": 28900,
      "sizes": ["2A", "3A", "4A", "6A"],
      "description": "Jardinero de corderoy de algodón súper suave de color mostaza otoñal. Tiradores regulables con hebillas metálicas clásicas. Ideal para combinar con básicos de manga larga y usar todo el año.",
      "image": "/src/assets/images/corduroy_overall_1780268551618.webp",
      "images": [
        "/src/assets/images/corduroy_overall_1780268551618.webp",
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": true
    },
    {
      "id": "p4",
      "name": "Pijama Algodón Estampado Dino",
      "category": "Kids",
      "ageTag": "toddler",
      "price": 16900,
      "sizes": ["12M", "18M", "2A", "4A"],
      "description": "Conjunto de remera y pantalón de pijama fabricado en interlock de puro algodón peinado. Divertidas ilustraciones de dinosaurios amigables hechas con tintas al agua no tóxicas, perfecto para dulces sueños sin irritaciones.",
      "image": "https://images.unsplash.com/photo-1622290291165-d341f1938b86?auto=format&fit=crop&q=80&w=800",
      "images": [
        "https://images.unsplash.com/photo-1622290291165-d341f1938b86?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": false
    },
    {
      "id": "p5",
      "name": "Body Básico Interlock Crudo",
      "category": "Babys",
      "ageTag": "baby",
      "price": 8500,
      "sizes": ["RN", "1M", "3M", "6M", "12M"],
      "description": "Body de mangas largas clásico cruzado tipo americano en los hombros para facilitar el cambio del pañal. Hecho de puro algodón interlock sin tintura, ideal de nacimiento.",
      "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
      "images": [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1533512900305-66ce928cadc2?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": false
    },
    {
      "id": "p6",
      "name": "Sweater Calado Hilo Algodón",
      "category": "Teens",
      "ageTag": "kid",
      "price": 22500,
      "sizes": ["4A", "6A", "8A"],
      "description": "Sweater tejido con calados artesanales de diseño nórdico. Súper canchero y abrigado para complementar jeans o calzas en paseos de tarde de otoño.",
      "image": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800",
      "images": [
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1471286174775-bdf4d1b57f14?auto=format&fit=crop&q=80&w=800"
      ],
      "inStock": true,
      "isFeatured": false
    }
  ]
};

// Helper to read store data from PostgreSQL
async function readStoreData(): Promise<StoreData> {
  try {
    // Get config
    const configResult = await query('SELECT key, value FROM store_config ORDER BY key');
    const config: any = {};
    for (const row of configResult.rows) {
      config[row.key] = row.value;
    }

    // Get products
    const productsResult = await query('SELECT * FROM products ORDER BY id');
    const products: Product[] = productsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      ageTag: row.age_tag,
      price: row.price,
      sizes: row.sizes || [],
      description: row.description,
      image: row.image,
      images: row.images || [],
      inStock: row.in_stock,
      isFeatured: row.is_featured
    }));

    return { config, products };
  } catch (error) {
    console.error('Error reading store data:', error);
    throw error;
  }
}

// Helper to update config in PostgreSQL
async function updateStoreConfig(config: Partial<StoreConfig>) {
  try {
    for (const [key, value] of Object.entries(config)) {
      await query(
        'INSERT INTO store_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
        [key, JSON.stringify(value)]
      );
    }
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

// Helper to replace all products in PostgreSQL
async function replaceProducts(products: Product[]) {
  try {
    // Delete all existing products
    await query('DELETE FROM products');
    
    // Insert new products
    for (const product of products) {
      await query(
        `INSERT INTO products (id, name, category, age_tag, price, sizes, description, image, images, in_stock, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          product.id,
          product.name,
          product.category,
          product.ageTag,
          product.price,
          product.sizes,
          product.description,
          product.image,
          product.images,
          product.inStock,
          product.isFeatured
        ]
      );
    }
  } catch (error) {
    console.error('Error replacing products:', error);
    throw error;
  }
}

// Helper to reset to default data
async function resetStoreData() {
  try {
    await replaceProducts(DEFAULT_DATA.products);
    await query('DELETE FROM store_config');
    await updateStoreConfig(DEFAULT_DATA.config);
  } catch (error) {
    console.error('Error resetting store data:', error);
    throw error;
  }
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// --- AUTENTICACIÓN DE ADMINISTRADOR (lado servidor) ---
// La contraseña vive en el servidor (variable de entorno ADMIN_PASSWORD).
// Al iniciar sesión se entrega un token firmado con HMAC-SHA256 que el cliente
// envía en cada operación de escritura. El secreto se deriva de la contraseña
// si no se define ADMIN_SECRET, así funciona sin configuración extra.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ema2026";
const ADMIN_SECRET =
  process.env.ADMIN_SECRET ||
  crypto.createHash("sha256").update("mundo-mimitos::" + ADMIN_PASSWORD).digest("hex");
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function passwordMatches(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const a = Buffer.from(input);
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createToken(): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = String(expiresAt);
  const sig = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = decoded.split(".");
    if (!payload || !sig) return false;
    const expected = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const expiresAt = parseInt(payload, 10);
    return Number.isFinite(expiresAt) && Date.now() < expiresAt;
  } catch {
    return false;
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "No autorizado. Iniciá sesión como administrador." });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize database
  await initializeDatabase();

  app.use(express.json({ limit: '50mb' }));

  // Serve static assets directly so dynamic images load properly in production & dev
  app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));

  // --- API ROUTING ---

  // Login de administrador: valida la contraseña y entrega un token firmado
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body || {};
    if (!passwordMatches(password)) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    res.json({ success: true, token: createToken(), expiresIn: TOKEN_TTL_MS });
  });

  // Verifica que un token siga siendo válido (para restaurar la sesión)
  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    res.json({ success: true });
  });

  // Get Store details (config + products)
  app.get("/api/store", async (req, res) => {
    try {
      // Nunca cachear el catálogo: tras guardar, la recarga debe traer datos frescos
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      const data = await readStoreData();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "Error al leer los datos de la tienda: " + e.message });
    }
  });

  // Update Store Config
  app.post("/api/store/config", requireAdmin, async (req, res) => {
    try {
      await updateStoreConfig(req.body);
      const data = await readStoreData();
      res.json({ success: true, config: data.config });
    } catch (e: any) {
      res.status(500).json({ error: "Error al actualizar la configuración: " + e.message });
    }
  });

  // Update Products List (Replace all or add)
  app.post("/api/store/products", requireAdmin, async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        await replaceProducts(req.body);
        res.json({ success: true, count: req.body.length });
      } else {
        res.status(400).json({ error: "El cuerpo de la solicitud debe ser un arreglo de productos." });
      }
    } catch (e: any) {
      res.status(500).json({ error: "Error al actualizar los productos: " + e.message });
    }
  });

  // Reset to default store state
  app.post("/api/store/reset", requireAdmin, async (req, res) => {
    try {
      await resetStoreData();
      res.json({ success: true, data: DEFAULT_DATA });
    } catch (e: any) {
      res.status(500).json({ error: "Error al reiniciar la tienda: " + e.message });
    }
  });

  // AI Product Description Generator Route
  app.post("/api/gemini/generate-description", requireAdmin, async (req, res) => {
    const { name, category, ageTag, keywords } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "El nombre y la categoría son obligatorios." });
    }

    try {
      const ai = getGeminiClient();
      const ageText = ageTag === 'baby' ? 'bebés (0 a 2 años)' : ageTag === 'toddler' ? 'niños pequeños (2 a 5 años)' : 'niños grandes (6 o más años)';
      const keywordPrompt = keywords ? `Incluye de manera natural estas palabras clave: ${keywords}.` : '';

      const prompt = `Actúa como un redactor experto en marketing de moda infantil para una tienda de ropa fina para bebés y chicos llamada "Pequeños Rayos".
Escribe una descripción encantadora, dulce y persuasiva en español para el siguiente producto:
- Nombre: ${name}
- Categoría: ${category}
- Público objetivo: ${ageText}
${keywordPrompt}

La descripción debe ser breve (entre 2 y 4 oraciones), emotiva, destacar la suavidad y el confort excepcionales para la piel, el diseño tierno/canchero y la practicidad para los padres. Usa un tono cálido y amoroso. No incluyas precios, talles o viñetas de lista. Solo devuelve la descripción textual final.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim() || "Una hermosa prenda confeccionada con el mayor amor y suavidad para tu pequeño.";
      res.json({ description: text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "No es posible utilizar la IA actualmente: " + e.message });
    }
  });

  // Vite development server / static static build handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
