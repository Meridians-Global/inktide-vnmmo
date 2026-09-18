// Brand icon set from the shared base mark (public/brand-mark.png). The mark is
// trimmed to its opaque bounds and scaled to fill each frame (≈4% margin) so it stays
// legible at favicon sizes. Emits: favicon.ico (16/32/48), favicon.png (64),
// icon-192.png, icon-512.png, apple-touch-icon.png (180, opaque tile), and
// icon-maskable-512.png (safe-zone padding). Re-run with `npm run icons`.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';

export type IconSetOptions = {
  source: string;
  outDir: string;
  tile: string;
  prefix?: string;
};

const MARGIN = 0.04;
const MASKABLE_MARGIN = 0.2;

async function trimmedMark(source: string): Promise<Buffer> {
  return sharp(source).ensureAlpha().trim({ threshold: 8 }).png().toBuffer();
}

async function markOn(
  mark: Buffer,
  size: number,
  margin: number,
  background: string | { r: number; g: number; b: number; alpha: number },
  radius = 0
): Promise<Buffer> {
  const inner = Math.round(size * (1 - margin * 2));
  const glyph = await sharp(mark)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: 'lanczos3'
    })
    .png()
    .toBuffer();
  const layers: OverlayOptions[] = [];
  if (radius > 0) {
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/></svg>`
    );
    layers.push({ input: mask });
  }
  layers.push({ input: glyph, gravity: 'centre' });
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: radius > 0 ? { r: 0, g: 0, b: 0, alpha: 0 } : background
    }
  })
    .composite(layers)
    .png()
    .toBuffer();
}

function icoFromPngs(pngs: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = header.length + dir.length;
  pngs.forEach((png, i) => {
    const o = i * 16;
    dir.writeUInt8(png.size >= 256 ? 0 : png.size, o);
    dir.writeUInt8(png.size >= 256 ? 0 : png.size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(png.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

export async function makeIconSet(options: IconSetOptions): Promise<string[]> {
  const { source, outDir, tile } = options;
  const prefix = options.prefix ?? '';
  await mkdir(outDir, { recursive: true });
  const mark = await trimmedMark(source);
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const written: string[] = [];
  const emit = async (name: string, data: Buffer) => {
    const path = join(outDir, `${prefix}${name}`);
    await writeFile(path, data);
    written.push(path);
  };

  const icoSizes = [16, 32, 48];
  const icoPngs = [];
  for (const size of icoSizes) {
    icoPngs.push({ size, data: await markOn(mark, size, MARGIN, transparent) });
  }
  await emit('favicon.ico', icoFromPngs(icoPngs));
  await emit('favicon.png', await markOn(mark, 64, MARGIN, transparent));
  await emit('icon-192.png', await markOn(mark, 192, MARGIN, transparent));
  await emit('icon-512.png', await markOn(mark, 512, MARGIN, transparent));
  await emit('icon-1024.png', await markOn(mark, 1024, MARGIN, transparent));
  await emit('apple-touch-icon.png', await markOn(mark, 180, 0.08, tile));
  await emit('icon-maskable-512.png', await markOn(mark, 512, MASKABLE_MARGIN, tile));
  return written;
}

const invokedDirectly = process.argv[1]?.endsWith('make-icons.ts');
if (invokedDirectly) {
  const root = process.cwd();
  const written = await makeIconSet({
    source: join(root, 'public/brand-mark.png'),
    outDir: join(root, 'public'),
    tile: '#080b11'
  });
  for (const path of written) console.log(`[icons] wrote ${path}`);
}
