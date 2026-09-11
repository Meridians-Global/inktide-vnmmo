// @jasonyu0100
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function loadLocalEnvironment(projectRoot: string): Promise<void> {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) return;

  for (const rawLine of (await readFile(envPath, 'utf8')).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = rawValue.match(/^(['"])(.*)\1$/)?.[2] ?? rawValue;
    if (!process.env[key]) process.env[key] = value;
  }
}

export function requireSetting(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; set it in the environment or the repository-local .env`);
  return value;
}
