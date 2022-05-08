#!/usr/bin/env node
// eslint-disable-next-line import/extensions
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { add, init, install } from '../lib/index.js';
import { logger } from '../lib/logger.js';
import { Dependency } from '../lib/manifest.js';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(hideBin(process.argv))
  .command<Dependency>(
    'add <url> [alias]',
    'add a gist',
    (_) => {
      /* y.option('logLevel', {
        alias: ['l'],
        type: 'string',
        choices: ['trace', 'debug', 'info'],
        description: 'Sets the logging level',
      }); */
    },
    (argv) => {
      add({ url: argv.url, alias: argv.alias }).catch((err) => {
        logger.fatal(err);
        process.exitCode = 1;
      });
    },
  )
  .command(
    'install',
    'install deps',
    (_) => {
      /* y.option('logLevel', {
        alias: ['l'],
        type: 'string',
        choices: ['trace', 'debug', 'info'],
        description: 'Sets the logging level',
      }); */
    },
    (_) => {
      install().catch((err) => {
        logger.fatal(err);
        process.exitCode = 1;
      });
    },
  )
  .command(
    'init',
    'initialise a repo',
    (_) => {
      /* y.option('logLevel', {
        alias: ['l'],
        type: 'string',
        choices: ['trace', 'debug', 'info'],
        description: 'Sets the logging level',
      }); */
    },
    (_) => {
      init().catch((err) => {
        logger.fatal(err);
        process.exitCode = 1;
      });
    },
  )
  .demandCommand(1, 'You need at least one command')
  .strict()
  .help().argv;
