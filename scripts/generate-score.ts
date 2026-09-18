// @jasonyu0100
// Offline, demand-led score generation: music beds (MusicGen) and foley cues (Stable Audio Open)
// → pinned assets under assets/generated/<production>/score with a receipt. Prints the Asset
// lines to paste into the story; wiring tableaux/moments to them stays an authoring decision.
// Usage: npm run score -- <productionId|all> [--dry-run]
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { replicateInputDigest, runReplicatePrediction, selectReplicateOutputUrl, type ReplicatePrediction } from '../src/provider/replicate';
import { loadLocalEnvironment, requireSetting } from './config';
import { fileDigest } from './lib/acquisition-kit';

const MUSIC_MODEL = 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb';
const CUE_MODEL = 'stackadoc/stable-audio-open-1.0:9aff84a639f96d0f7e6081cdea002d15133d0043727f849c40abdd166b7c75a8';

type ScoreRequest =
  | { id: string; kind: 'music'; prompt: string; seconds: number; seed: number }
  | { id: string; kind: 'cue'; prompt: string; seconds: number; seed: number };

type ScoreReceipt = { requests: Record<string, { model: string; inputDigest: string; sha256: string; predictionId: string; prompt: string }> };

const manifests: Record<string, ScoreRequest[]> = {
  'privet-drive-boy-who-lived-v1': [
    { id: 'privet-morning-theme', kind: 'music', seconds: 30, seed: 4101, prompt: 'Whimsical light orchestral loop: pizzicato strings, bassoon, glockenspiel, tidy English suburban morning, dry mischievous humour, gentle, no drums, storybook' },
    { id: 'privet-nocturne', kind: 'music', seconds: 30, seed: 4102, prompt: 'Hushed nocturne: celesta, soft low strings, distant harp, quiet suburban street at midnight, mystery and wonder, very slow, no drums, film score' },
    { id: 'doorstep-lullaby', kind: 'music', seconds: 30, seed: 4103, prompt: 'Tender solo piano lullaby with warm sustained strings, bittersweet farewell, a baby left on a doorstep, slow, intimate, no drums, film score' },
    { id: 'cat-transfiguration', kind: 'cue', seconds: 5, seed: 4111, prompt: 'Magical shimmering transformation whoosh, soft sparkle glissando, brief, clean, no music' },
    { id: 'letter-placed', kind: 'cue', seconds: 4, seed: 4112, prompt: 'A folded paper letter tucked gently into wool blankets, close quiet cloth and paper rustle, no music' },
  ],
  'spider-man-memory-between-us-v1': [
    { id: 'between-us-theme', kind: 'music', seconds: 30, seed: 4201, prompt: 'Intimate melancholic piano with soft analog synth pad, rain against a window, slow, restrained, cinematic, no drums' },
    { id: 'stairs-resolve', kind: 'music', seconds: 30, seed: 4202, prompt: 'Quiet hopeful strings and sparse piano, resolve after grief, night city after rain, slow, warm, no drums, film score' },
    { id: 'mask-pull', kind: 'cue', seconds: 3, seed: 4211, prompt: 'A fabric mask pulled off over a head, close soft cloth slide and release, quiet room, no music' },
    { id: 'door-latch', kind: 'cue', seconds: 4, seed: 4212, prompt: 'Apartment door unlocked and opened slowly, wooden door, metal latch, quiet hallway, no music' },
  ],
  'moon-scar-ledger-v2': [
    { id: 'cleft-winter-theme', kind: 'music', seconds: 30, seed: 4301, prompt: 'Sparse guzheng and dizi flute, cold mountain wind, wuxia, contemplative, ancient Chinese, slow, no drums' },
    { id: 'moon-scar-revelation', kind: 'music', seconds: 30, seed: 4302, prompt: 'Ethereal shimmering pad with guqin phrases, moonlight in a stone cellar, revelation and awe, very slow, ancient Chinese, no drums' },
    { id: 'seal-stone', kind: 'cue', seconds: 5, seed: 4311, prompt: 'Heavy stone lid sliding shut and sealing, deep grind and thud, cellar echo, no music' },
  ],
};

const projectRoot = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const target = args.find((argument) => !argument.startsWith('--')) ?? 'all';

function inputFor(request: ScoreRequest): { model: string; input: Record<string, unknown>; extension: 'mp3' | 'wav' } {
  if (request.kind === 'music') {
    return {
      model: MUSIC_MODEL,
      extension: 'mp3',
      input: { prompt: request.prompt, duration: request.seconds, seed: request.seed, model_version: 'stereo-large', output_format: 'mp3', normalization_strategy: 'loudness', classifier_free_guidance: 3, temperature: 1, top_k: 250, top_p: 0 },
    };
  }
  return {
    model: CUE_MODEL,
    extension: 'wav',
    input: { prompt: request.prompt, seconds_total: request.seconds, seconds_start: 0, seed: request.seed, steps: 100, cfg_scale: 6, negative_prompt: 'music, melody, speech, voice' },
  };
}

/**
 * Stable Audio renders a fixed-length buffer padded past the requested cue length; keep only
 * the requested seconds (PCM WAV, any channel count / bit depth) with a short tail fade.
 */
function trimWav(wav: Buffer, seconds: number): Buffer {
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Cue output is not a RIFF WAVE file');
  let offset = 12;
  let format: { channels: number; sampleRate: number; bitsPerSample: number; blockAlign: number } | undefined;
  while (offset + 8 <= wav.length) {
    const chunkId = wav.toString('ascii', offset, offset + 4);
    const chunkSize = wav.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (chunkId === 'fmt ') {
      const formatTag = wav.readUInt16LE(body);
      if (formatTag !== 1 && formatTag !== 3 && formatTag !== 0xfffe) throw new Error(`Unsupported WAVE format tag ${formatTag}`);
      format = { channels: wav.readUInt16LE(body + 2), sampleRate: wav.readUInt32LE(body + 4), blockAlign: wav.readUInt16LE(body + 12), bitsPerSample: wav.readUInt16LE(body + 14) };
    } else if (chunkId === 'data') {
      if (!format) throw new Error('WAVE data chunk precedes fmt chunk');
      const frames = Math.min(Math.floor(seconds * format.sampleRate), Math.floor(chunkSize / format.blockAlign));
      const data = Buffer.from(wav.subarray(body, body + frames * format.blockAlign));
      const fadeFrames = Math.min(frames, Math.floor(format.sampleRate * 0.25));
      for (let frame = frames - fadeFrames; frame < frames; frame += 1) {
        const gain = (frames - frame) / fadeFrames;
        for (let channel = 0; channel < format.channels; channel += 1) {
          const at = frame * format.blockAlign + channel * (format.bitsPerSample / 8);
          if (format.bitsPerSample === 16) data.writeInt16LE(Math.round(data.readInt16LE(at) * gain), at);
          else if (format.bitsPerSample === 32 && wav.readUInt16LE(offset + 8) === 3) data.writeFloatLE(data.readFloatLE(at) * gain, at);
          else if (format.bitsPerSample === 32) data.writeInt32LE(Math.round(data.readInt32LE(at) * gain), at);
          else if (format.bitsPerSample === 24) {
            const value = Math.round(((data.readIntBE(at, 3) << 8) >> 8) * gain);
            data.writeUIntLE(value & 0xffffff, at, 3);
          }
        }
      }
      const header = Buffer.from(wav.subarray(0, body));
      header.writeUInt32LE(header.length - 8 + data.length, 4);
      header.writeUInt32LE(data.length, offset + 4);
      return Buffer.concat([header, data]);
    }
    offset = body + chunkSize + (chunkSize % 2);
  }
  throw new Error('WAVE file has no data chunk');
}

/** A prediction that finished after the poll budget lapsed is still evidence; reuse it rather than paying twice. */
async function retainedPrediction(resultPath: string, inputDigest: string): Promise<ReplicatePrediction | undefined> {
  if (!existsSync(resultPath)) return undefined;
  const prediction = JSON.parse(await readFile(resultPath, 'utf8')) as ReplicatePrediction;
  if (prediction.status !== 'succeeded' || !prediction.input || replicateInputDigest(prediction.input) !== inputDigest) return undefined;
  return prediction;
}

async function generateFor(productionId: string, requests: ScoreRequest[], token: string | undefined): Promise<void> {
  const assetRoot = `assets/generated/${productionId}/score`;
  const evidenceDirectory = join(projectRoot, 'productions', productionId, 'evidence', 'score');
  const receiptPath = join(projectRoot, 'productions', productionId, 'evidence', 'score.receipt.json');
  await mkdir(join(projectRoot, assetRoot), { recursive: true });
  await mkdir(evidenceDirectory, { recursive: true });
  const receipt: ScoreReceipt = existsSync(receiptPath) ? JSON.parse(await readFile(receiptPath, 'utf8')) as ScoreReceipt : { requests: {} };
  const lines: string[] = [];

  for (const request of requests) {
    const { model, input, extension } = inputFor(request);
    const sourcePath = `${assetRoot}/${request.id}.${extension}`;
    const targetPath = join(projectRoot, sourcePath);
    const inputDigest = replicateInputDigest(input);
    const retained = receipt.requests[request.id];
    let sha256: string;
    if (retained && retained.inputDigest === inputDigest && existsSync(targetPath) && (await fileDigest(targetPath)) === retained.sha256) {
      sha256 = retained.sha256;
    } else if (dryRun) {
      console.log(`  would generate ${request.kind} ${request.id} via ${model}`);
      continue;
    } else {
      if (!token) throw new Error('REPLICATE_API_TOKEN is required to generate score assets');
      const prediction = await retainedPrediction(join(evidenceDirectory, `${request.id}.result.json`), inputDigest)
        ?? await runReplicatePrediction({ token, model, input, evidenceDirectory, evidenceName: request.id });
      const response = await fetch(selectReplicateOutputUrl(prediction.output));
      if (!response.ok) throw new Error(`Download failed for ${request.id}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(targetPath, request.kind === 'cue' ? trimWav(bytes, request.seconds) : bytes);
      sha256 = await fileDigest(targetPath);
      receipt.requests[request.id] = { model, inputDigest, sha256, predictionId: prediction.id, prompt: request.prompt };
      await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
      console.log(`  ${request.id} ← ${model} (${prediction.id})`);
    }
    lines.push(`    { id: '${request.id}', kind: '${request.kind}', sourcePath: \`\${generated}/score/${request.id}.${extension}\`, sha256: '${sha256}' },`);
  }
  if (dryRun) return;
  console.log(`${productionId} asset lines:\n${lines.join('\n')}`);
}

await loadLocalEnvironment(projectRoot);
const token = dryRun ? process.env.REPLICATE_API_TOKEN : requireSetting('REPLICATE_API_TOKEN');
const selected = target === 'all' ? Object.keys(manifests) : [target];
for (const productionId of selected) {
  const requests = manifests[productionId];
  if (!requests) throw new Error(`No score manifest for ${productionId}`);
  console.log(productionId);
  await generateFor(productionId, requests, token);
}
