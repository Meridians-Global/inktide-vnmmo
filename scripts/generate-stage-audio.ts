// @jasonyu0100
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sampleRate = 48_000;
const seconds = 12;
const frames = sampleRate * seconds;
const channels = 2;
const samples = new Float64Array(frames * channels);
let state = 0x1616cafe;
const random = (): number => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 0x100000000;
};

function wavBuffer(source: Float64Array, channelCount = 2): Buffer {
  let peak = 0;
  for (const sample of source) peak = Math.max(peak, Math.abs(sample));
  const gain = 0.22 / Math.max(peak, 0.001);
  const pcm = Buffer.alloc(source.length * 2);
  for (let index = 0; index < source.length; index += 1) {
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, source[index]! * gain)) * 32767), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channelCount, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channelCount * 2, 28);
  header.writeUInt16LE(channelCount * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function writeWave(relativePath: string, source: Float64Array): Promise<string> {
  const output = resolve(import.meta.dirname, `../${relativePath}`);
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, wavBuffer(source));
  return output;
}

// Integer-period harmonics make the ambience loop without a restart seam.
for (let voice = 0; voice < 128; voice += 1) {
  const harmonic = 72 + Math.floor(random() * 1450);
  const amplitude = 0.012 / Math.sqrt(harmonic / 72);
  const phaseLeft = random() * Math.PI * 2;
  const phaseRight = phaseLeft + (random() - 0.5) * 1.7;
  for (let frame = 0; frame < frames; frame += 1) {
    const angle = Math.PI * 2 * harmonic * frame / frames;
    samples[frame * 2] = samples[frame * 2]! + Math.sin(angle + phaseLeft) * amplitude;
    samples[frame * 2 + 1] = samples[frame * 2 + 1]! + Math.sin(angle + phaseRight) * amplitude;
  }
}

// Quiet periodic droplets sit behind dialogue; wrapping preserves the loop.
for (let drop = 0; drop < 34; drop += 1) {
  const center = Math.floor(random() * frames);
  const duration = 480 + Math.floor(random() * 1300);
  const frequency = 1100 + random() * 2300;
  const pan = random();
  const level = 0.018 + random() * 0.025;
  for (let offset = 0; offset < duration; offset += 1) {
    const frame = (center + offset) % frames;
    const envelope = Math.sin(Math.PI * offset / duration) ** 2;
    const wave = Math.sin(Math.PI * 2 * frequency * offset / sampleRate) * envelope * level;
    samples[frame * 2] = samples[frame * 2]! + wave * (1 - pan * 0.42);
    samples[frame * 2 + 1] = samples[frame * 2 + 1]! + wave * (0.58 + pan * 0.42);
  }
}

const outputs = [await writeWave('assets/generated/spider-man-memory-between-us-v1/rain-at-window-v1.wav', samples)];

const sirenSeconds = 3.8;
const siren = new Float64Array(Math.floor(sampleRate * sirenSeconds) * 2);
for (let frame = 0; frame < siren.length / 2; frame += 1) {
  const time = frame / sampleRate;
  const fade = Math.sin(Math.PI * time / sirenSeconds) ** 1.8;
  const frequency = 470 + 65 * Math.sin(Math.PI * 2 * time / 2.7);
  const distant = Math.sin(Math.PI * 2 * frequency * time) * fade * (0.62 + 0.38 * Math.sin(Math.PI * 2 * 1.7 * time));
  siren[frame * 2] = distant * 0.72;
  siren[frame * 2 + 1] = distant;
}
outputs.push(await writeWave('assets/generated/spider-man-memory-between-us-v1/distant-siren-v1.wav', siren));

const resonanceSeconds = 3.2;
const resonance = new Float64Array(Math.floor(sampleRate * resonanceSeconds) * 2);
const partials = [196, 294, 392, 588, 784];
for (let frame = 0; frame < resonance.length / 2; frame += 1) {
  const time = frame / sampleRate;
  const onset = Math.min(1, time / 0.045);
  const decay = Math.exp(-time * 1.12) * onset;
  let value = 0;
  for (let index = 0; index < partials.length; index += 1) {
    value += Math.sin(Math.PI * 2 * partials[index]! * time + index * 0.73) * decay / (index + 1);
  }
  const shimmer = 0.72 + 0.28 * Math.sin(Math.PI * 2 * 4.2 * time);
  resonance[frame * 2] = value * shimmer;
  resonance[frame * 2 + 1] = value * (1.44 - shimmer);
}
outputs.push(await writeWave('assets/generated/moon-scar-ledger-v2/moon-resonance-v1.wav', resonance));

console.log(outputs.join('\n'));
