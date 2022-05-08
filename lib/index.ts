// eslint-disable-next-line import/no-extraneous-dependencies
import type { Endpoints } from '@octokit/types';
import { mkdir, symlink, writeFile } from 'fs/promises';
import { Octokit } from 'octokit';
import { packageDirectory } from 'pkg-dir';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from './logger.js';
import {
  Dependency,
  Manifest,
  readManifest,
  writeManifest,
} from './manifest.js';

type GetGistResponse = Endpoints['GET /gists/{gist_id}']['response'];

async function getPackageDir(cwd?: URL): Promise<URL> {
  const pkgDir = await packageDirectory({
    cwd: cwd && fileURLToPath(cwd),
  });

  logger.trace({ cwd }, 'pkgDir: %s', pkgDir);

  if (!pkgDir) {
    throw new Error('Cannot determine package dir');
  }

  const pkgDirUrl = pathToFileURL(`${pkgDir}/`);
  logger.trace('pkgDirUrl: %s', pkgDirUrl);

  return pkgDirUrl;
}

async function writeGist(
  gist: GetGistResponse,
  dep: Dependency,
  dest: string = './gist_modules',
): Promise<URL> {
  if (!gist.data.files) {
    throw new Error('Gist has no files');
  }
  const pkgDir = await getPackageDir();

  const gistDir = new URL(
    `${dest}/${gist.data.owner?.login}/${
      dep.alias ? dep.alias : gist.data.id
    }/`,
    pkgDir,
  );
  logger.trace('gistDir: %s', gistDir);

  await mkdir(gistDir, {
    recursive: true,
  }).catch((err: NodeJS.ErrnoException) => {
    logger.trace({ gistDir }, err.message);
    // already exists, ok np
    if (err.code !== 'EEXIST') {
      throw err;
    }
  });

  // eslint-disable-next-line no-restricted-syntax
  for await (const file of Object.values(gist.data.files)) {
    // logger.trace(file, file?.filename);

    if (!file?.content || !file.filename || !file.raw_url) {
      logger.warn({ file }, 'Bad file');
      throw new Error('Bad file');
    }

    const filePath = new URL(file.filename, gistDir);
    logger.trace('filePath: %s', filePath);

    await writeFile(filePath, file.content);
  }

  // if (dep.alias) {
  //   const gistAliasDir = new URL(`../${dep.alias}`, gistDir);
  //   logger.debug('gistAliasDir: %s', gistAliasDir);
  //   await symlink(gistDir, gistAliasDir).catch((err: NodeJS.ErrnoException) => {
  //     logger.trace({ gistDir, gistAliasDir }, err.message);
  //     // already exists, ok np
  //     if (err.code !== 'EEXIST') {
  //       throw err;
  //     }
  //   });
  // }

  return gistDir;
}

export async function freshen(dep: Dependency, dest?: string) {
  const gistUrl = new URL(dep.url);
  const [, _username, gistId, revision] = gistUrl.pathname.split('/');

  // logger.info({ username, gistId, revision }, gistUrl.pathname);

  const octokit = new Octokit();

  const gist = await octokit.rest.gists.get({
    gist_id: gistId,
    sha: revision,
  });

  // logger.trace(gist.data, 'gist');

  await writeGist(gist, dep, dest);

  return gist.data;
}

export async function add(dep: Dependency) {
  const gist = await freshen(dep);

  const pkgDir = await getPackageDir();
  const { dependencies = [], ...manifest } = await readManifest(pkgDir);

  await writeManifest(pkgDir, {
    ...manifest,
    dependencies: [
      ...dependencies.filter((d) => !d.url.startsWith(dep.url)),
      {
        description: gist.description || undefined,
        ...dep,
      },
    ],
  });

  logger.info(
    'Dep installed: %s (%s)',
    dep.url,
    dep.description || 'no description',
  );
}

export async function install() {
  const pkgDir = await getPackageDir();
  const { dependencies = [], dest } = await readManifest(pkgDir);

  // eslint-disable-next-line no-restricted-syntax
  for await (const dep of dependencies) {
    await freshen(dep, dest);
  }

  logger.info('%s dependencies installed', dependencies.length);
}

export async function init() {
  const pkgDir = await getPackageDir();
  const manifest = await readManifest(pkgDir).catch(
    (err: NodeJS.ErrnoException): Manifest => {
      logger.trace({ pkgDir }, err.message);
      if (err.code === 'ENOENT') {
        return {
          dependencies: [],
        };
      }
      throw err;
    },
  );
  await writeManifest(pkgDir, manifest);

  logger.info('Initialised');
}
