// @jasonyu0100
// Deterministic synthesized ambience and cues for privet-drive-boy-who-lived-v1.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sampleRate = 48_000;
let state = 0x0bad5eed;
const random = (): number => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 0x100000000;
};

function wavBuffer(source: Float64Array): Buffer {
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
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 4, 28);
  header.writeUInt16LE(4, 32);
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

const root = 'assets/generated/privet-drive-boy-who-lived-v1';
const outputs: string[] = [];

// Suburban night: low loopable air bed plus sparse cricket ticks; integer-period harmonics keep the loop seamless.
const nightSeconds = 12;
const nightFrames = sampleRate * nightSeconds;
const night = new Float64Array(nightFrames * 2);
for (let voice = 0; voice < 96; voice += 1) {
  const harmonic = 40 + Math.floor(random() * 700);
  const amplitude = 0.01 / Math.sqrt(harmonic / 40);
  const phaseLeft = random() * Math.PI * 2;
  const phaseRight = phaseLeft + (random() - 0.5) * 1.5;
  for (let frame = 0; frame < nightFrames; frame += 1) {
    const angle = Math.PI * 2 * harmonic * frame / nightFrames;
    night[frame * 2] = night[frame * 2]! + Math.sin(angle + phaseLeft) * amplitude;
    night[frame * 2 + 1] = night[frame * 2 + 1]! + Math.sin(angle + phaseRight) * amplitude;
  }
}
for (let chirp = 0; chirp < 26; chirp += 1) {
  const center = Math.floor(random() * nightFrames);
  const duration = 900 + Math.floor(random() * 700);
  const frequency = 3800 + random() * 900;
  const pan = random();
  for (let offset = 0; offset < duration; offset += 1) {
    const frame = (center + offset) % nightFrames;
    const envelope = Math.sin(Math.PI * offset / duration) ** 2 * (0.5 + 0.5 * Math.sin(Math.PI * 2 * 38 * offset / sampleRate));
    const wave = Math.sin(Math.PI * 2 * frequency * offset / sampleRate) * envelope * 0.02;
    night[frame * 2] = night[frame * 2]! + wave * (1 - pan * 0.5);
    night[frame * 2 + 1] = night[frame * 2 + 1]! + wave * (0.5 + pan * 0.5);
  }
}
outputs.push(await writeWave(`${root}/suburban-night-v1.wav`, night));

// Put-Outer: a metallic click, then a lamp's hum sliding down into silence.
const clickSeconds = 1.6;
const click = new Float64Array(Math.floor(sampleRate * clickSeconds) * 2);
for (let frame = 0; frame < click.length / 2; frame += 1) {
  const time = frame / sampleRate;
  const snap = time < 0.03 ? (random() - 0.5) * Math.exp(-time * 160) : 0;
  const ring = Math.sin(Math.PI * 2 * 2600 * time) * Math.exp(-time * 38) * 0.5;
  const humFade = Math.max(0, 1 - Math.max(0, time - 0.08) / 1.3);
  const hum = (Math.sin(Math.PI * 2 * 100 * time) + 0.4 * Math.sin(Math.PI * 2 * 200 * time)) * humFade ** 2 * 0.35;
  const value = snap + ring + hum;
  click[frame * 2] = value;
  click[frame * 2 + 1] = value * 0.9;
}
outputs.push(await writeWave(`${root}/put-outer-click-v1.wav`, click));

// Motorcycle from the sky: a roar rising in level as it descends, engine cut, one metallic settle.
const bikeSeconds = 4.2;
const bike = new Float64Array(Math.floor(sampleRate * bikeSeconds) * 2);
let phase = 0;
for (let frame = 0; frame < bike.length / 2; frame += 1) {
  const time = frame / sampleRate;
  const approach = Math.min(1, time / 2.6);
  const running = time < 3.4 ? 1 : Math.exp(-(time - 3.4) * 9);
  const rpm = 38 + 22 * approach - (time > 3.1 ? (time - 3.1) * 40 : 0);
  phase += Math.PI * 2 * Math.max(rpm, 6) / sampleRate;
  const pulse = Math.sign(Math.sin(phase)) * 0.6 + Math.sin(phase * 2) * 0.3 + (random() - 0.5) * 0.25;
  const settle = time > 3.5 ? Math.sin(Math.PI * 2 * 1800 * time) * Math.exp(-(time - 3.5) * 22) * 0.4 : 0;
  const value = pulse * approach * running * 0.7 + settle;
  bike[frame * 2] = value * (0.6 + 0.4 * approach);
  bike[frame * 2 + 1] = value;
}
outputs.push(await writeWave(`${root}/motorcycle-descent-v1.wav`, bike));

console.log(outputs.join('\n'));
