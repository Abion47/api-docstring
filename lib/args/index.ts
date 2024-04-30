import arg from 'arg';

import { LIB_VERSION } from './version';

export type ArgsConfig = {
  help: boolean;
  init: boolean;
  version: boolean;
  verbose: boolean;
  silent: boolean;
};

export const defaultArgsConfig: ArgsConfig = {
  help: false,
  init: false,
  version: false,
  verbose: false,
  silent: false,
};

export function getHelp(): string {
  const lines = [
    ['--help, -h', 'Print this message.'],
    ['--init', 'Generate a default configuration file.'],
    ['--version', 'Print the version of this package.'],
    ['--verbose, -v', 'Sets the logging level to verbose.'],
    ['--silent, -s', 'Silences non-error logging output.'],
  ];

  const maxLength = lines.reduce((val, line) => Math.max(val, line[0].length), 0);

  return lines.map(line => `    ${line[0].padEnd(maxLength, ' ')}    ${line[1]}`).join('\n');
}

export function getVersion(): string {
  return LIB_VERSION;
}

export function parseArgs(): ArgsConfig {
  const argsParsed = arg({
    // Flags
    '--help': Boolean,
    '--init': Boolean,
    '--verbose': Boolean,
    '--version': Boolean,
    '--silent': Boolean,

    // Aliases
    '-h': '--help',
    '-s': '--silent',
    '-v': '--verbose',
  });

  return {
    help: argsParsed['--help'] ?? defaultArgsConfig.help,
    init: argsParsed['--init'] ?? defaultArgsConfig.init,
    verbose: argsParsed['--verbose'] ?? defaultArgsConfig.verbose,
    version: argsParsed['--version'] ?? defaultArgsConfig.version,
    silent: argsParsed['--silent'] ?? defaultArgsConfig.silent,
  };
}
