// Compresión de imágenes en el navegador (ideal para subir fotos desde el celular).
// Redimensiona la foto y la convierte a WebP, devolviendo un data URL listo para
// guardar en la base de datos y usar directamente en <img src>.

export interface CompressOptions {
  /** Lado máximo (ancho o alto) en píxeles. Por defecto 1000. */
  maxSize?: number;
  /** Calidad del WebP/JPEG, de 0 a 1. Por defecto 0.8. */
  quality?: number;
}

interface DrawableSource {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close?: () => void;
}

// Carga el archivo respetando la orientación EXIF (importante para fotos de celular,
// que muchas veces vienen rotadas). Usa createImageBitmap cuando está disponible.
async function loadDrawable(file: File): Promise<DrawableSource> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        close: () => bitmap.close(),
      };
    } catch {
      // Si falla, caemos al método con HTMLImageElement.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen."));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      close: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo procesar la imagen."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Comprime una imagen a WebP y devuelve un data URL.
 * @throws si el archivo no es una imagen o no puede procesarse.
 */
export async function compressImageFile(file: File, opts: CompressOptions = {}): Promise<string> {
  const { maxSize = 1000, quality = 0.8 } = opts;

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen.");
  }

  const source = await loadDrawable(file);
  try {
    const ratio = Math.min(maxSize / source.width, maxSize / source.height, 1);
    const width = Math.max(1, Math.round(source.width * ratio));
    const height = Math.max(1, Math.round(source.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no permite procesar la imagen.");

    // Fondo blanco por si la imagen original tiene transparencia (WebP/JPEG).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    source.draw(ctx, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (blob) return await blobToDataURL(blob);

    // Algunos navegadores no codifican WebP: usamos JPEG como respaldo.
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    source.close?.();
  }
}

/** Tamaño aproximado en KB de un data URL base64. */
export function dataUrlSizeKB(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.round((base64.length * 3) / 4 / 1024);
}
