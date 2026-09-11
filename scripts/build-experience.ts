import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { compileExperience } from '../src/core/compiler';
import { normalizeFigureBuffer } from '../src/core/figure-normalization';
import { experiences } from '../src/story';

const projectRoot = resolve(import.meta.dirname, '..');
const localEnvPath = join(projectRoot, '.env');
if (!process.env.VN_ASSET_ROOT && existsSync(localEnvPath)) {
  const localEnv = await readFile(localEnvPath, 'utf8');
  const configuredRoot = localEnv
    .split(/\r?\n/)
    .find((line) => line.startsWith('VN_ASSET_ROOT='))
    ?.slice('VN_ASSET_ROOT='.length)
    .trim();
  if (configuredRoot) process.env.VN_ASSET_ROOT = configuredRoot;
}
const assetRoot = process.env.VN_ASSET_ROOT;
if (!assetRoot) throw new Error('VN_ASSET_ROOT must point to the inktide tmp directory');

const outputRoot = join(projectRoot, 'public', 'generated');
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const catalog: { id: string; title: string; subtitle: string; url: string }[] = [];
for (const input of experiences) {
  const experienceRoot = join(outputRoot, input.id);
  const assetOutput = join(experienceRoot, 'assets');
  await mkdir(assetOutput, { recursive: true });
  const compiled = compileExperience(input, { assetUrlBase: `/generated/${input.id}/assets` });
  if (!compiled.ok) throw new Error(`Experience ${input.id} failed compilation:\n${compiled.errors.join('\n')}`);

  const copiedAssets: {
    id: string;
    sourcePath: string;
    sourceSha256: string;
    outputSha256: string;
    target: string;
    preparation: unknown;
  }[] = [];
  for (const asset of compiled.experience.assets) {
    const source = join(assetRoot, asset.sourcePath);
    const bytes = await readFile(source);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== asset.sha256) throw new Error(`Asset digest drift: ${asset.id}\nexpected ${asset.sha256}\nreceived ${digest}`);
    const targetName = `${asset.id}${extname(asset.sourcePath)}`;
    const output = asset.preparation ? await normalizeFigureBuffer(bytes, asset.preparation) : bytes;
    await writeFile(join(assetOutput, targetName), output);
    copiedAssets.push({
      id: asset.id,
      sourcePath: asset.sourcePath,
      sourceSha256: digest,
      outputSha256: createHash('sha256').update(output).digest('hex'),
      target: `assets/${targetName}`,
      preparation: asset.preparation ?? null,
    });
  }

  const experienceJson = `${JSON.stringify(compiled.experience, null, 2)}\n`;
  const experienceDigest = createHash('sha256').update(experienceJson).digest('hex');
  await writeFile(join(experienceRoot, 'experience.json'), experienceJson);
  await writeFile(join(experienceRoot, 'receipt.json'), `${JSON.stringify({
    schemaVersion: 2,
    experienceId: compiled.experience.id,
    experienceSha256: experienceDigest,
    source: compiled.experience.source,
    assets: copiedAssets,
  }, null, 2)}\n`);
  catalog.push({ id: input.id, title: input.title, subtitle: input.subtitle, url: `/generated/${input.id}/experience.json` });
  console.log(`Prepared ${compiled.experience.id} · ${copiedAssets.length} verified assets · ${experienceDigest}`);
}

await writeFile(join(outputRoot, 'catalog.json'), `${JSON.stringify({ schemaVersion: 1, defaultExperienceId: catalog[0]!.id, experiences: catalog }, null, 2)}\n`);
