// @jasonyu0100
export type Rgb = readonly [number, number, number];

const clamp = (value: number, minimum = 0, maximum = 1): number => Math.max(minimum, Math.min(maximum, value));
const distance = (left: readonly number[], right: readonly number[]): number => Math.hypot(left[0]! - right[0]!, left[1]! - right[1]!, left[2]! - right[2]!);

function normalizedHue(rgb: readonly number[]): number[] {
  const maximum = Math.max(...rgb);
  const minimum = Math.min(...rgb);
  const range = maximum - minimum;
  return range < 1 ? [0, 0, 0] : rgb.map((channel) => (channel - minimum) / range);
}

export function chromaLike(rgb: readonly number[], matte: Rgb): boolean {
  return Math.max(...rgb) - Math.min(...rgb) >= 24 && distance(normalizedHue(rgb), normalizedHue(matte)) < 0.34;
}

export function clearExteriorConnectedChroma(source: Buffer, segmented: Buffer, width: number, height: number, matte: Rgb): { data: Buffer; clearedPixels: number } {
  if (source.length !== segmented.length || source.length !== width * height * 4) throw new Error('Exterior chroma flood requires matching RGBA rasters');
  const output = Buffer.from(segmented);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (segmented[pixel * 4 + 3]! >= 16) continue;
    visited[pixel] = 1;
    queue[tail++] = pixel;
  }
  let clearedPixels = 0;
  while (head < tail) {
    const pixel = queue[head++]!;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    for (const neighbor of [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1]) {
      if (neighbor < 0 || visited[neighbor]) continue;
      const offset = neighbor * 4;
      const transparent = segmented[offset + 3]! < 16;
      if (!transparent && !chromaLike([source[offset]!, source[offset + 1]!, source[offset + 2]!], matte)) continue;
      visited[neighbor] = 1;
      queue[tail++] = neighbor;
      if (!transparent) {
        output.fill(0, offset, offset + 4);
        clearedPixels += 1;
      }
    }
  }
  return { data: output, clearedPixels };
}

function nearTransparency(raw: Buffer, width: number, height: number, x: number, y: number, radius = 2): boolean {
  for (let dy = -radius; dy <= radius; dy += 1) for (let dx = -radius; dx <= radius; dx += 1) {
    const nearX = x + dx;
    const nearY = y + dy;
    if (nearX >= 0 && nearY >= 0 && nearX < width && nearY < height && raw[(nearY * width + nearX) * 4 + 3]! < 16) return true;
  }
  return false;
}

function reconstructPartialAlphaRgb(raw: Buffer, width: number, height: number, radius = 12): Buffer {
  const output = Buffer.from(raw);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * 4;
    const alpha = raw[offset + 3]!;
    if (alpha < 1 || alpha >= 245) continue;
    const samples: number[][] = [];
    for (let ring = 1; ring <= radius && samples.length < 4; ring += 1) for (let nearY = Math.max(0, y - ring); nearY <= Math.min(height - 1, y + ring); nearY += 1) for (let nearX = Math.max(0, x - ring); nearX <= Math.min(width - 1, x + ring); nearX += 1) {
      if (Math.max(Math.abs(nearX - x), Math.abs(nearY - y)) !== ring) continue;
      const nearOffset = (nearY * width + nearX) * 4;
      if (raw[nearOffset + 3]! >= 245) samples.push([raw[nearOffset]!, raw[nearOffset + 1]!, raw[nearOffset + 2]!]);
    }
    if (!samples.length) continue;
    for (let channel = 0; channel < 3; channel += 1) output[offset + channel] = Math.round(samples.reduce((sum, sample) => sum + sample[channel]!, 0) / samples.length);
  }
  return output;
}

function neutralizeBoundary(raw: Buffer, width: number, height: number, matte: Rgb): Buffer {
  const output = Buffer.from(raw);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * 4;
    if (raw[offset + 3]! < 16 || !nearTransparency(raw, width, height, x, y) || !chromaLike([raw[offset]!, raw[offset + 1]!, raw[offset + 2]!], matte)) continue;
    const samples: number[][] = [];
    for (let ring = 1; ring <= 10 && samples.length < 4; ring += 1) for (let nearY = Math.max(0, y - ring); nearY <= Math.min(height - 1, y + ring); nearY += 1) for (let nearX = Math.max(0, x - ring); nearX <= Math.min(width - 1, x + ring); nearX += 1) {
      if (Math.max(Math.abs(nearX - x), Math.abs(nearY - y)) !== ring) continue;
      const nearOffset = (nearY * width + nearX) * 4;
      const rgb = [raw[nearOffset]!, raw[nearOffset + 1]!, raw[nearOffset + 2]!];
      if (raw[nearOffset + 3]! >= Math.max(96, raw[offset + 3]!) && !chromaLike(rgb, matte)) samples.push(rgb);
    }
    if (!samples.length) continue;
    for (let channel = 0; channel < 3; channel += 1) output[offset + channel] = Math.round(samples.reduce((sum, sample) => sum + sample[channel]!, 0) / samples.length);
  }
  return output;
}

/** Removes segmentation debris while preserving every meaningful disconnected part of the subject. */
export function clearSmallAlphaIslands(raw: Buffer, width: number, height: number, relativeFloor = 0.005): { data: Buffer; clearedPixels: number } {
  if (raw.length !== width * height * 4) throw new Error('Alpha island cleanup requires one RGBA raster');
  if (relativeFloor < 0 || relativeFloor > 1) throw new Error('Alpha island cleanup requires a relative floor between zero and one');
  const visited = new Uint8Array(width * height);
  const components: number[][] = [];
  let largest = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (visited[pixel] || raw[pixel * 4 + 3]! < 16) continue;
    const component: number[] = [];
    const queue = [pixel];
    visited[pixel] = 1;
    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head]!;
      component.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      for (const neighbor of [x > 0 ? current - 1 : -1, x + 1 < width ? current + 1 : -1, y > 0 ? current - width : -1, y + 1 < height ? current + width : -1]) {
        if (neighbor < 0 || visited[neighbor] || raw[neighbor * 4 + 3]! < 16) continue;
        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }
    components.push(component);
    largest = Math.max(largest, component.length);
  }
  const output = Buffer.from(raw);
  const minimum = largest * relativeFloor;
  let clearedPixels = 0;
  for (const component of components) {
    if (component.length >= minimum) continue;
    for (const pixel of component) output.fill(0, pixel * 4, pixel * 4 + 4);
    clearedPixels += component.length;
  }
  return { data: output, clearedPixels };
}

export function inspectChromaMatte(raw: Buffer, width: number, height: number, matte: Rgb): { visiblePixels: number; boundaryPixels: number; residualBoundaryFraction: number; transparentRgbPixels: number } {
  let visiblePixels = 0;
  let boundaryPixels = 0;
  let residual = 0;
  let transparentRgbPixels = 0;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * 4;
    if (raw[offset + 3]! < 16) {
      if (raw[offset]! || raw[offset + 1]! || raw[offset + 2]!) transparentRgbPixels += 1;
      continue;
    }
    visiblePixels += 1;
    if (!nearTransparency(raw, width, height, x, y)) continue;
    boundaryPixels += 1;
    if (chromaLike([raw[offset]!, raw[offset + 1]!, raw[offset + 2]!], matte)) residual += 1;
  }
  return { visiblePixels, boundaryPixels, residualBoundaryFraction: boundaryPixels ? residual / boundaryPixels : 0, transparentRgbPixels };
}

/** Deterministic chroma extraction ported from the legacy SFX Lab preparation contract. */
export function keyChromaMatte(raw: Buffer, width: number, height: number, matte: Rgb, options: { tolerance: number; softness: number }): { data: Buffer; inspection: ReturnType<typeof inspectChromaMatte> } {
  if (raw.length !== width * height * 4) throw new Error('Chroma key requires one RGBA raster');
  if (options.tolerance < 0 || options.softness <= 0) throw new Error('Chroma key requires non-negative tolerance and positive softness');
  const keyed = Buffer.from(raw);
  for (let offset = 0; offset < keyed.length; offset += 4) {
    const rgb = [keyed[offset]!, keyed[offset + 1]!, keyed[offset + 2]!];
    const coverage = chromaLike(rgb, matte) ? 0 : clamp((distance(rgb, matte) - options.tolerance) / options.softness);
    const alpha = Math.round(keyed[offset + 3]! * coverage);
    keyed[offset + 3] = alpha;
    if (!alpha) keyed.fill(0, offset, offset + 4);
  }
  let cleaned = reconstructPartialAlphaRgb(keyed, width, height);
  for (let pass = 0; pass < 3; pass += 1) cleaned = neutralizeBoundary(cleaned, width, height, matte);
  for (let offset = 0; offset < cleaned.length; offset += 4) if (!cleaned[offset + 3]) cleaned.fill(0, offset, offset + 4);
  return { data: cleaned, inspection: inspectChromaMatte(cleaned, width, height, matte) };
}

/** Combines semantic segmentation with an exterior chroma garbage matte and boundary RGB repair. */
export function refineSegmentedChromaMatte(source: Buffer, segmented: Buffer, width: number, height: number, matte: Rgb): { data: Buffer; clearedPixels: number; inspection: ReturnType<typeof inspectChromaMatte> } {
  const flooded = clearExteriorConnectedChroma(source, segmented, width, height, matte);
  const islands = clearSmallAlphaIslands(flooded.data, width, height);
  let cleaned = reconstructPartialAlphaRgb(islands.data, width, height);
  for (let pass = 0; pass < 3; pass += 1) cleaned = neutralizeBoundary(cleaned, width, height, matte);
  for (let offset = 0; offset < cleaned.length; offset += 4) {
    if (cleaned[offset + 3]! < 16) cleaned.fill(0, offset, offset + 4);
  }
  return { data: cleaned, clearedPixels: flooded.clearedPixels + islands.clearedPixels, inspection: inspectChromaMatte(cleaned, width, height, matte) };
}
