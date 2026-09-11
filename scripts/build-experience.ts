import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { compileExperience } from '../src/core/compiler';
import { moonScarExperience } from '../src/story/moon-scar';

const projectRoot = resolve(import.meta.dirname, '..');
const assetRoot = process.env.VN_ASSET_ROOT;
if (!assetRoot) throw new Error('VN_ASSET_ROOT must point to the inktide tmp directory');

const outputRoot = join(projectRoot, 'public', 'generated');
const assetOutput = join(outputRoot, 'assets');
await rm(outputRoot, { recursive: true, force: true });
await mkdir(assetOutput, { recursive: true });

const compiled = compileExperience(moonScarExperience);
if (!compiled.ok) throw new Error(`Experience failed compilation:\n${compiled.errors.join('\n')}`);

const copiedAssets: { id: string; sourcePath: string; sha256: string; target: string }[] = [];
for (const asset of compiled.experience.assets) {
  const source = join(assetRoot, asset.sourcePath);
  const bytes = await readFile(source);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== asset.sha256) throw new Error(`Asset digest drift: ${asset.id}\nexpected ${asset.sha256}\nreceived ${digest}`);
  const targetName = `${asset.id}${extname(asset.sourcePath)}`;
  await copyFile(source, join(assetOutput, targetName));
  copiedAssets.push({ id: asset.id, sourcePath: asset.sourcePath, sha256: digest, target: `assets/${targetName}` });
}

const experienceJson = `${JSON.stringify(compiled.experience, null, 2)}\n`;
const experienceDigest = createHash('sha256').update(experienceJson).digest('hex');
await writeFile(join(outputRoot, 'experience.json'), experienceJson);
await writeFile(join(outputRoot, 'receipt.json'), `${JSON.stringify({
  schemaVersion: 1,
  experienceId: compiled.experience.id,
  experienceSha256: experienceDigest,
  source: compiled.experience.source,
  assets: copiedAssets,
}, null, 2)}\n`);

console.log(`Prepared ${compiled.experience.id}`);
console.log(`Experience SHA-256 ${experienceDigest}`);
console.log(`Verified ${copiedAssets.length} assets`);
