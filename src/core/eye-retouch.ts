// @jasonyu0100
export type IrisRegion = Readonly<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}>;

export type IrisRetouchRecipe = Readonly<{
  regions: readonly IrisRegion[];
  targetRgb: readonly [number, number, number];
  strength: number;
  minimumChroma: number;
}>;

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function retouchIrisPixels(
  rgba: Buffer,
  width: number,
  height: number,
  recipe: IrisRetouchRecipe,
): Buffer {
  const output = Buffer.from(rgba);
  for (const region of recipe.regions) {
    const left = Math.max(0, Math.floor(region.cx - region.rx));
    const right = Math.min(width - 1, Math.ceil(region.cx + region.rx));
    const top = Math.max(0, Math.floor(region.cy - region.ry));
    const bottom = Math.min(height - 1, Math.ceil(region.cy + region.ry));
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const dx = (x - region.cx) / region.rx;
        const dy = (y - region.cy) / region.ry;
        if (dx * dx + dy * dy > 1) continue;
        const offset = (y * width + x) * 4;
        const r = rgba[offset] ?? 0;
        const g = rgba[offset + 1] ?? 0;
        const b = rgba[offset + 2] ?? 0;
        const alpha = rgba[offset + 3] ?? 0;
        const maximum = Math.max(r, g, b);
        const minimum = Math.min(r, g, b);
        const coloredIris = r > g * 1.3 && (r > b * 1.08 || b > g * 1.22) && g < 105 && maximum < 210;
        if (alpha === 0 || maximum - minimum < recipe.minimumChroma || !coloredIris) continue;

        // Keep the drawing's original value and highlights; change only chroma toward a stable iris colour.
        const value = maximum / 255;
        const target = recipe.targetRgb.map((channel) => channel * (0.38 + value * 0.62));
        output[offset] = clampByte(r + (target[0]! - r) * recipe.strength);
        output[offset + 1] = clampByte(g + (target[1]! - g) * recipe.strength);
        output[offset + 2] = clampByte(b + (target[2]! - b) * recipe.strength);
      }
    }
  }
  return output;
}
