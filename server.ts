import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "store.json");

// Default initial database in case file is deleted or lost
const DEFAULT_DATA = {
  config: {
    storeName: "Mundo Mimitos",
    storeTagline: "Ropa suave y amorosa para bebés y niños",
    whatsappNumber: "5491123456789",
    welcomeMessage: "¡Hola! Vi la tienda online y me gustaría consultar por los siguientes productos: 💛",
    bannerText: "✨ Envíos a todo el país | Ropa hipoalergénica de algodón 100% suave y amoroso ✨",
    bannerImage: "/src/assets/images/shop_hero_1780268503557.png",
    brandColor: "rose",
    logoUrl: "/src/assets/images/mundo_mimitos_logo_1780272012332.png",
    currencySymbol: "$"
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
      "image": "/src/assets/images/knit_romper_1780268520295.png",
      "images": [
        "/src/assets/images/knit_romper_1780268520295.png",
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
      "image": "/src/assets/images/linen_dress_1780268535594.png",
      "images": [
        "/src/assets/images/linen_dress_1780268535594.png",
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
      "image": "/src/assets/images/corduroy_overall_1780268551618.png",
      "images": [
        "/src/assets/images/corduroy_overall_1780268551618.png",
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

// Help Helper to read JSON
async function readStoreData() {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // If not exists, write defaults and return
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true }).catch(() => {});
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(DEFAULT_DATA, null, 2), "utf-8");
    return DEFAULT_DATA;
  }
}

// Help Helper to write JSON
async function writeStoreData(data: typeof DEFAULT_DATA) {
  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true }).catch(() => {});
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Serve static assets directly so dynamic images load properly in production & dev
  app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));

  // --- API ROUTING ---

  // Get Store details (config + products)
  app.get("/api/store", async (req, res) => {
    try {
      const data = await readStoreData();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "Error al leer los datos de la tienda: " + e.message });
    }
  });

  // Update Store Config
  app.post("/api/store/config", async (req, res) => {
    try {
      const currentData = await readStoreData();
      currentData.config = { ...currentData.config, ...req.body };
      await writeStoreData(currentData);
      res.json({ success: true, config: currentData.config });
    } catch (e: any) {
      res.status(500).json({ error: "Error al actualizar la configuración: " + e.message });
    }
  });

  // Update Products List (Replace all or add)
  app.post("/api/store/products", async (req, res) => {
    try {
      const currentData = await readStoreData();
      if (Array.isArray(req.body)) {
        currentData.products = req.body;
        await writeStoreData(currentData);
        res.json({ success: true, count: currentData.products.length });
      } else {
        res.status(400).json({ error: "El cuerpo de la solicitud debe ser un arreglo de productos." });
      }
    } catch (e: any) {
      res.status(500).json({ error: "Error al actualizar los productos: " + e.message });
    }
  });

  // Reset to default store state
  app.post("/api/store/reset", async (req, res) => {
    try {
      await writeStoreData(DEFAULT_DATA);
      res.json({ success: true, data: DEFAULT_DATA });
    } catch (e: any) {
      res.status(500).json({ error: "Error al reiniciar la tienda: " + e.message });
    }
  });

  // AI Product Description Generator Route
  app.post("/api/gemini/generate-description", async (req, res) => {
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
