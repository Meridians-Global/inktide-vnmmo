// @jasonyu0100
import { appendFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

export type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: unknown;
  error?: unknown;
  input?: Record<string, unknown>;
  urls?: { get?: string; web?: string };
};

const terminal = new Set(['succeeded', 'failed', 'canceled']);

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

export function replicateInputDigest(input: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(canonical(input))).digest('hex');
}

export function selectReplicateOutputUrl(output: unknown): string {
  if (typeof output === 'string' && output.startsWith('https://')) return output;
  if (Array.isArray(output)) {
    const selected = output.find((item) => typeof item === 'string' && item.startsWith('https://'));
    if (typeof selected === 'string') return selected;
  }
  throw new Error('Replicate returned no HTTPS file output');
}

export async function runReplicatePrediction(options: {
  token: string;
  model: string;
  input: Record<string, unknown>;
  evidenceDirectory: string;
  evidenceName: string;
}): Promise<ReplicatePrediction> {
  const versioned = /^([a-z0-9-]+\/[a-z0-9.-]+):([a-f0-9]{64})$/.exec(options.model);
  if (!versioned && !/^[a-z0-9-]+\/[a-z0-9.-]+$/.test(options.model)) throw new Error(`Invalid Replicate model ${options.model}`);
  const create = await fetch(versioned ? 'https://api.replicate.com/v1/predictions' : `https://api.replicate.com/v1/models/${options.model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.token}`,
      'Content-Type': 'application/json',
      'Cancel-After': '5m',
    },
    body: JSON.stringify(versioned ? { version: versioned[2], input: options.input } : { input: options.input }),
  });
  if (!create.ok) throw new Error(`Replicate create failed for ${options.model}: HTTP ${create.status} ${await create.text()}`);
  let prediction = await create.json() as ReplicatePrediction;
  const eventsPath = join(options.evidenceDirectory, `${options.evidenceName}.events.ndjson`);
  await appendFile(eventsPath, `${JSON.stringify(prediction)}\n`);
  for (let attempt = 0; !terminal.has(prediction.status) && attempt < 300; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const response = await fetch(prediction.urls?.get ?? `https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${options.token}` },
    });
    if (!response.ok) throw new Error(`Replicate poll failed for ${prediction.id}: HTTP ${response.status}`);
    prediction = await response.json() as ReplicatePrediction;
    await appendFile(eventsPath, `${JSON.stringify(prediction)}\n`);
  }
  await writeFile(join(options.evidenceDirectory, `${options.evidenceName}.result.json`), `${JSON.stringify(prediction, null, 2)}\n`);
  if (prediction.status !== 'succeeded') throw new Error(`Replicate prediction ${prediction.id} ${prediction.status}: ${String(prediction.error ?? '')}`);
  return prediction;
}

export async function recoverReplicatePrediction(options: {
  token: string;
  predictionId: string;
  evidenceDirectory: string;
  evidenceName: string;
}): Promise<ReplicatePrediction> {
  const response = await fetch(`https://api.replicate.com/v1/predictions/${options.predictionId}`, {
    headers: { Authorization: `Bearer ${options.token}` },
  });
  if (!response.ok) throw new Error(`Replicate recovery failed for ${options.predictionId}: HTTP ${response.status}`);
  const prediction = await response.json() as ReplicatePrediction;
  await appendFile(join(options.evidenceDirectory, `${options.evidenceName}.events.ndjson`), `${JSON.stringify(prediction)}\n`);
  await writeFile(join(options.evidenceDirectory, `${options.evidenceName}.result.json`), `${JSON.stringify(prediction, null, 2)}\n`);
  if (prediction.status !== 'succeeded') throw new Error(`Replicate prediction ${prediction.id} is ${prediction.status}`);
  return prediction;
}
