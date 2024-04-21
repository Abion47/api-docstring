import type { ArgsConfig } from './args';
import { type Config, defaultConfig } from './conf';
import { App, defaultAppOptions } from './app';

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

export let app: App;
export function parse(files: string[], options: { config?: Config; args?: ArgsConfig; cwd?: string }) {
  // TODO: Expose for customization
  const appOptions = defaultAppOptions;

  // TODO: Set log level based on args.silent/vebose
  // appOptions.log.level = options.args?.silent ? 'error' : options.args?.verbose ? 'verbose' : 'info';
  appOptions.log.level = 'debug';

  app = new App(files, options.cwd ?? process.cwd(), options.config ?? defaultConfig, appOptions);
  // app.log.debug(app.parser.languages);

  app.parser.parseFiles({ encoding: 'utf8' });
  // const parsedFileBlocks = app.parser.parseFiles({ encoding: 'utf8' });

  // console.dir(parsedFileBlocks, { depth: 2 });
  // app.log.debug(parsedFileNames);
  // app.log.debug(parsedFiles);
}
