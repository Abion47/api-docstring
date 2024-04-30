import type { Logger } from './types';
import type { Language } from './languages/_types';
import type { Config } from './conf';

export type AppOptions = {
  log: Logger;
  languages: Record<string, string | Language>;
  parsers: {
    global: Record<string, string>;
    rest: Record<string, string>;
    event: Record<string, string>;
  };
};

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

export class App {
  files: string[];
  cwd: string;
  programConfig: Config;
  options: AppOptions;

  constructor(files: string[], cwd: string, programConfig: Config, options: AppOptions) {
    this.files = files;
    this.cwd = cwd;
    this.programConfig = programConfig;
    this.options = options;
  }

  get log() {
    return this.options.log;
  }
}
