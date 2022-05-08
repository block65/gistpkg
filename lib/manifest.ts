import { readFile, writeFile } from 'node:fs/promises';
import { logger } from './logger.js';

export interface Dependency {
  url: string;
  alias?: string;
  description?: string;
}

export interface Manifest {
  dest?: string;
  dependencies?: Array<Dependency>;
}

const manifestFileName = './gistpkg.json';

export async function readManifest(pkgDir: string | URL): Promise<Manifest> {
  const manifestStr = await readFile(
    new URL(manifestFileName, pkgDir),
    'utf-8',
  );

  const manifest = JSON.parse(manifestStr);

  logger.trace(manifest, 'manifest');

  return manifest;
}

export async function writeManifest(
  pkgDir: string | URL,
  manifest: Manifest,
): Promise<void> {
  await writeFile(
    new URL(manifestFileName, pkgDir),
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );
}
