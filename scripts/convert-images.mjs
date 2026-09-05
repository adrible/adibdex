import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = new URL('../assets/backgrounds/', import.meta.url);
const destination = new URL('../public/backgrounds/', import.meta.url);
for (const name of await readdir(source)) {
  if (!name.toLowerCase().endsWith('.png')) continue;
  await sharp(fileURLToPath(new URL(name, source)))
    .webp({ quality: 80 })
    .toFile(fileURLToPath(new URL(name.replace(/\.png$/i, '.webp'), destination)));
  console.log(`Converted ${name}`);
}
