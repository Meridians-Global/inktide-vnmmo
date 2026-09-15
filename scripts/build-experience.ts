import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { compileExperience } from '../src/core/compiler';
import { normalizeFigureBuffer } from '../src/core/figure-normalization';
import { auditExperience, summarizeProductionPortfolio, type ProductionPortfolioInput } from '../src/core/production-audit';
import { experiences } from '../src/story';
import { productionTargetFor } from '../src/story/production-targets';
import { loadLocalEnvironment } from './config';

const projectRoot = resolve(import.meta.dirname, '..');
await loadLocalEnvironment(projectRoot);
const assetRoot = resolve(projectRoot, process.env.VN_ASSET_ROOT?.trim() || '.');

const outputRoot = join(projectRoot, 'public', 'generated');
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const catalog: { id: string; title: string; subtitle: string; url: string }[] = [];
const portfolioInputs: ProductionPortfolioInput[] = [];
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
  const target = productionTargetFor(input.id);
  const productionAudit = auditExperience(input, target);
  const productionAuditJson = `${JSON.stringify(productionAudit, null, 2)}\n`;
  const productionAuditSha256 = createHash('sha256').update(productionAuditJson).digest('hex');
  await writeFile(join(experienceRoot, 'experience.json'), experienceJson);
  await writeFile(join(experienceRoot, 'production-audit.json'), productionAuditJson);
  const receiptJson = `${JSON.stringify({
    schemaVersion: 3,
    experienceId: compiled.experience.id,
    experienceSha256: experienceDigest,
    productionAuditSha256,
    source: compiled.experience.source,
    assets: copiedAssets,
  }, null, 2)}\n`;
  await writeFile(join(experienceRoot, 'receipt.json'), receiptJson);
  portfolioInputs.push({
    audit: productionAudit,
    target,
    experienceSha256: experienceDigest,
    productionAuditSha256,
    receiptSha256: createHash('sha256').update(receiptJson).digest('hex'),
  });
  catalog.push({ id: input.id, title: input.title, subtitle: input.subtitle, url: `/generated/${input.id}/experience.json` });
  console.log(`Prepared ${compiled.experience.id} · ${copiedAssets.length} verified assets · ${experienceDigest} · audit ${productionAuditSha256}`);
}

await writeFile(join(outputRoot, 'catalog.json'), `${JSON.stringify({ schemaVersion: 1, defaultExperienceId: catalog[0]!.id, experiences: catalog }, null, 2)}\n`);
const productionReport = summarizeProductionPortfolio(portfolioInputs);
const productionReportJson = `${JSON.stringify(productionReport, null, 2)}\n`;
await writeFile(join(outputRoot, 'production-report.json'), productionReportJson);
console.log(`Production portfolio · ${productionReport.status} · ${createHash('sha256').update(productionReportJson).digest('hex')}`);
if (productionReport.nextRepair) console.log(`Next repair · ${productionReport.nextRepair.experienceId} · ${productionReport.nextRepair.id}`);
