import type { ArgsConfig } from './args';
import { type Config, defaultConfig } from './conf';
import { defaultAppOptions } from './app';
import Globals from './globals';
import { analyzeBlocks } from './analyzer';
import { generateOpenApi } from './generators/openapi';

const SPECIFICATION_VERSION = '0.0.1';
export function getSpecificationVersion() {
  return SPECIFICATION_VERSION;
}

export const defaultGenerator = {
  name: 'api-docstring',
  time: new Date(),
  url: 'https://apidocjs.com',
  version: '0.0.0',
};
export type Generator = typeof defaultGenerator;

export const defaultPackageInfos = {
  description: '',
  name: '',
  sampleUrl: false,
  version: '0.0.0',
  defaultVersion: '0.0.0',
};
export type PackageInfos = typeof defaultPackageInfos;

export function parse(files: string[], options: { config?: Config; args?: ArgsConfig; cwd?: string }) {
  // TODO: Expose for customization
  const appOptions = defaultAppOptions;

  const config = options.config ?? defaultConfig;

  // TODO: Set log level based on args.silent/vebose
  // appOptions.log.level = options.args?.silent ? 'error' : options.args?.verbose ? 'verbose' : 'info';
  appOptions.log.level = 'verbose';

  Globals.initialize({
    files,
    cwd: options.cwd ?? process.cwd(),
    programConfig: config,
    options: appOptions,
  });

  // Globals.app.log.debug(Globals.app.parser.languages);

  // Globals.parser.parseFiles({ encoding: 'utf8' });

  const parsedFileBlocks = Globals.parser.parseFiles({ encoding: 'utf8' });

  // console.dir(parsedFileBlocks, { depth: 99 });

  const apiDef = analyzeBlocks(config, parsedFileBlocks);

  if (apiDef.openApi && config.openApi.enabled) {
    generateOpenApi(config, apiDef.openApi, config.outDir);
  }

  // Globals.app.log.debug(parsedFileNames);
  // Globals.app.log.debug(parsedFiles);
}
