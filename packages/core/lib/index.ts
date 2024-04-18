// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import _ from 'lodash';
// import semver from 'semver';

// import Filter from './filter';
import Parser from './parser';
// import Worker from './worker';

import type { ArgsConfig } from './args';
import { type Config, defaultConfig } from './conf';
// import FileError from './errors/file_error';
// import ParserError from './errors/parser_error';
// import WorkerError from './errors/worker_error';
import type { Language } from './languages/_types';

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

// Simple logger interace
export const consoleLogger: Logger = {
  level: 'debug',
  debug: (...args: unknown[]) => {
    if (consoleLogger.level !== 'debug') return;
    console.log('[D]', ...args);
  },
  verbose: (...args: unknown[]) => {
    if (!['debug', 'verbose'].includes(consoleLogger.level)) return;
    console.log('[V]', ...args);
  },
  info: (...args: unknown[]) => {
    if (!['debug', 'verbose', 'info'].includes(consoleLogger.level)) return;
    console.log('[I]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (!['debug', 'verbose', 'info', 'warn'].includes(consoleLogger.level)) return;
    console.log('[W]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[E]', ...args);
  },
};
export type Logger = {
  level: 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  debug: (...args: unknown[]) => void;
  verbose: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export const defaultAppOptions: AppOptions = {
  log: consoleLogger,
  languages: {
    default: './languages/default.js',
  },
  parsers: {
    global: {
      apibinarybody: './parsers/global/api_binary_body.js',
      apibody: './parsers/global/api_body.js',
      apibodyexample: './parsers/global/api_body_example.js',
      apidefine: './parsers/global/api_define.js',
      apidefineglobal: './parsers/global/api_define_global.js',
      apideprecated: './parsers/global/api_deprecated.js',
      apidescription: './parsers/global/api_description.js',
      apienum: './parsers/global/api_enum.js',
      apierror: './parsers/global/api_error.js',
      apierrorexample: './parsers/global/api_error_example.js',
      apierrorheader: './parsers/global/api_error_header.js',
      apierrorheaderexample: './parsers/global/api_error_header_example.js',
      apiexample: './parsers/global/api_example.js',
      apigroup: './parsers/global/api_group.js',
      apiheader: './parsers/global/api_header.js',
      apiheaderexample: './parsers/global/api_header_example.js',
      apiignore: './parsers/global/api_ignore.js',
      apiname: './parsers/global/api_name.js',
      apishortname: './parsers/global/api_short_name.js',
      apiparam: './parsers/global/api_param.js',
      apiparamexample: './parsers/global/api_param_example.js',
      apipermission: './parsers/global/api_permission.js',
      apiprivate: './parsers/global/api_private.js',
      apiproto: './parsers/global/api_proto.js',
      apiquery: './parsers/global/api_query.js',
      apiqueryexample: './parsers/global/api_query_example.js',
      apiuse: './parsers/global/api_use.js',
      apiversion: './parsers/global/api_version.js',
    },
    rest: {
      api: './parsers/rest/api.js',
      apisuccess: './parsers/rest/api_success.js',
      apisuccessexample: './parsers/rest/api_success_example.js',
      apisuccessheader: './parsers/rest/api_success_header.js',
      apisuccessheaderexample: './parsers/rest/api_success_header_example.js',
    },
    event: {
      api: './parsers/event/api.js',
    },
  },
};

export type AppOptions = {
  log: Logger;
  languages: Record<string, string | Language>;
  parsers: {
    global: Record<string, string>;
    rest: Record<string, string>;
    event: Record<string, string>;
  };
};

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

export class App {
  files: string[];
  cwd: string;
  programConfig: Config;
  options: AppOptions;

  parser: Parser;

  constructor(files: string[], cwd: string, programConfig: Config, options: AppOptions) {
    this.files = files;
    this.cwd = cwd;
    this.programConfig = programConfig;
    this.options = options;
    this.parser = new Parser(this);
  }

  get log() {
    return this.options.log;
  }
}
