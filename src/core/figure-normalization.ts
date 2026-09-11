// @jasonyu0100
import sharp from 'sharp';
import type { FigurePreparation } from './contracts';

export type FigurePlacement = {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function resolveFigurePlacement(
  visibleWidth: number,
  visibleHeight: number,
  recipe: FigurePreparation,
): FigurePlacement {
  if (visibleWidth <= 0 || visibleHeight <= 0) throw new Error('Visible figure bounds must be positive');
  const scale = Math.min(recipe.subjectBox.width / visibleWidth, recipe.subjectBox.height / visibleHeight);
  const width = Math.max(1, Math.round(visibleWidth * scale));
  const height = Math.max(1, Math.round(visibleHeight * scale));
  const left = Math.floor((recipe.canvas.width - width) / 2);
  const right = recipe.canvas.width - width - left;
  const bottom = recipe.bottomPadding;
  const top = recipe.canvas.height - height - bottom;
  if (left < 0 || right < 0 || top < 0) throw new Error('Figure preparation does not fit its output canvas');
  return { width, height, top, right, bottom, left };
}

export async function normalizeFigureBuffer(
  source: Buffer,
  recipe: FigurePreparation,
): Promise<Buffer> {
  const preparedSource = recipe.matteCleanup
    ? await cleanMatteBuffer(source, recipe.matteCleanup)
    : source;
  const trimmed = await sharp(preparedSource)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
  const placement = resolveFigurePlacement(trimmed.info.width, trimmed.info.height, recipe);
  const resized = await sharp(trimmed.data)
    .resize({ width: placement.width, height: placement.height, fit: 'fill' })
    .png()
    .toBuffer();
  return sharp(resized)
    .extend({
      top: placement.top,
      right: placement.right,
      bottom: placement.bottom,
      left: placement.left,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function cleanMatteBuffer(
  source: Buffer,
  cleanup: NonNullable<FigurePreparation['matteCleanup']>,
): Promise<Buffer> {
  const raw = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(raw.data);
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index]!;
    const green = pixels[index + 1]!;
    const blue = pixels[index + 2]!;
    const alpha = pixels[index + 3]!;
    if (alpha <= cleanup.alphaFloor) {
      pixels[index + 3] = 0;
      continue;
    }
    if (alpha > cleanup.edgeAlphaCeiling) continue;
    if (cleanup.spill === 'green' && green > red + cleanup.channelMargin && green > blue + cleanup.channelMargin) {
      pixels[index + 1] = Math.max(red, blue);
    } else if (cleanup.spill === 'blue' && blue > red + cleanup.channelMargin && blue > green + cleanup.channelMargin) {
      pixels[index + 2] = Math.max(red, green);
    } else if (cleanup.spill === 'magenta' && red > green + cleanup.channelMargin && blue > green + cleanup.channelMargin) {
      const neutral = green;
      pixels[index] = neutral;
      pixels[index + 2] = neutral;
    }
  }
  return sharp(pixels, { raw: raw.info }).png().toBuffer();
}
