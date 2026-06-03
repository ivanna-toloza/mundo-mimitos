import { query } from './db';

// Default initial database
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

// Rewrites references to local sample images from .png/.jpeg to the new
// optimized .webp versions. Only touches paths under /src/assets/images so
// external URLs (Unsplash, etc.) are left untouched. Idempotent: safe to run
// on every startup; it only writes rows that actually changed.
function toWebpPath(url: any): any {
  if (typeof url !== 'string') return url;
  if (!url.startsWith('/src/assets/images/')) return url;
  return url.replace(/\.(png|jpe?g)$/i, '.webp');
}

async function migrateLocalImagesToWebp() {
  // Products: image (text) + images (text[])
  const prods = await query('SELECT id, image, images FROM products');
  for (const row of prods.rows) {
    const newImage = toWebpPath(row.image);
    const newImages = Array.isArray(row.images) ? row.images.map(toWebpPath) : row.images;
    const changed =
      newImage !== row.image ||
      JSON.stringify(newImages) !== JSON.stringify(row.images);
    if (changed) {
      await query('UPDATE products SET image = $1, images = $2 WHERE id = $3', [
        newImage,
        newImages,
        row.id,
      ]);
    }
  }

  // Config: logoUrl + bannerImage (stored as JSONB string scalars)
  const cfg = await query(
    "SELECT key, value FROM store_config WHERE key IN ('logoUrl', 'bannerImage')"
  );
  for (const row of cfg.rows) {
    const next = toWebpPath(row.value);
    if (next !== row.value) {
      await query('UPDATE store_config SET value = $1 WHERE key = $2', [
        JSON.stringify(next),
        row.key,
      ]);
    }
  }
}

export async function initializeDatabase() {
  console.log('Initializing database tables...');
  
  try {
    // Create config table
    await query(`
      CREATE TABLE IF NOT EXISTS store_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        age_tag VARCHAR(50),
        price INTEGER NOT NULL,
        sizes TEXT[],
        description TEXT,
        image VARCHAR(500),
        images TEXT[],
        in_stock BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Database tables created');

    // Asegura que la columna image pueda guardar data URLs largos (fotos
    // subidas y comprimidas desde el dispositivo). De VARCHAR(500) -> TEXT.
    await query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'products'
            AND column_name = 'image'
            AND data_type = 'character varying'
        ) THEN
          ALTER TABLE products ALTER COLUMN image TYPE TEXT;
        END IF;
      END $$;
    `);

    // Check if config exists
    const configResult = await query('SELECT COUNT(*) FROM store_config');
    const configCount = parseInt(configResult.rows[0].count, 10);

    // If no config, insert defaults
    if (configCount === 0) {
      console.log('Inserting default configuration...');
      for (const [key, value] of Object.entries(DEFAULT_DATA.config)) {
        await query(
          'INSERT INTO store_config (key, value) VALUES ($1, $2)',
          [key, JSON.stringify(value)]
        );
      }
      console.log('✓ Default configuration inserted');
    }

    // Check if products exist
    const productsResult = await query('SELECT COUNT(*) FROM products');
    const productsCount = parseInt(productsResult.rows[0].count, 10);

    // If no products, insert defaults
    if (productsCount === 0) {
      console.log('Inserting default products...');
      for (const product of DEFAULT_DATA.products) {
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
      console.log('✓ Default products inserted');
    }

    // Self-heal old sample image references to the optimized .webp versions
    await migrateLocalImagesToWebp();
    console.log('✓ Image paths migrated to webp (where applicable)');

    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export { DEFAULT_DATA };
