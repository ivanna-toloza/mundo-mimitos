// One-off / reusable image optimizer.
// Converts images in src/assets/images to compressed WebP:
//   - product & hero photos: max 1000px wide, quality 80
//   - logos: max 400px wide, quality 85
// Run with: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const IMAGES_DIR = path.resolve('src/assets/images');

// Files matching these substrings are treated as logos (smaller, sharper).
const LOGO_HINTS = ['logo'];

function isLogo(name) {
  return LOGO_HINTS.some(h => name.toLowerCase().includes(h));
}

function kb(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB';
}

const run = async () => {
  const files = await readdir(IMAGES_DIR);
  const sources = files.filter(f => /\.(png|jpe?g)$/i.test(f));

  if (sources.length === 0) {
    console.log('No PNG/JPG images found in', IMAGES_DIR);
    return;
  }

  for (const file of sources) {
    const input = path.join(IMAGES_DIR, file);
    const base = file.replace(/\.(png|jpe?g)$/i, '');
    const output = path.join(IMAGES_DIR, base + '.webp');

    const logo = isLogo(file);
    const maxWidth = logo ? 400 : 1000;
    const quality = logo ? 85 : 80;

    const before = (await stat(input)).size;

    await sharp(input)
      .rotate() // respect EXIF orientation (phone photos)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(output);

    const after = (await stat(output)).size;
    console.log(
      `${file}  ->  ${base}.webp   ${kb(before)} -> ${kb(after)} ` +
      `(${Math.round((1 - after / before) * 100)}% menos)`
    );
  }

  console.log('\nListo. Imágenes WebP generadas en src/assets/images.');
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
