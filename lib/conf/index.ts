import fs from 'node:fs';
import path from 'node:path';

import {
  validateArray,
  validateArrayItems,
  validateBool,
  validateNumber,
  validateObject,
  validateString,
  validateUnion,
} from './validation';

export const defaultConfig: Config = {
  version: '0.0.1',
  openApi: { enabled: false },
  asyncApi: { enabled: false },
  private: false,
  files: { include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'] },
  format: 'json',
  outDir: './api',
  srcDir: './src',
};

export type InputConfig = {
  files?: FilesConfig;
  format?: 'json' | 'yaml';
  groups?: GroupConfig[];
  asyncApi?: AsyncApiConfig | AsyncApiConfigDisabled;
  openApi?: OpenApiConfig | OpenApiConfigDisabled;
  private?: boolean;
  outDir?: string;
  srcDir?: string;
  version: string;
};

export type InputAsyncApiConfig = {
  enabled?: boolean;
  format?: 'json' | 'yaml';
  out?: string;
  version?: string;
};

export type InputFilesConfig = {
  include?: string[];
  exclude?: string[];
};

export type InputGroupConfig = {
  name: string;
  include?: boolean;
  sortOrder?: number;
};

export type Config = {
  files: FilesConfig;
  format: 'json' | 'yaml';
  groups?: GroupConfig[];
  openApi: OpenApiConfig | OpenApiConfigDisabled;
  asyncApi: AsyncApiConfig | AsyncApiConfigDisabled;
  private: boolean;
  outDir: string;
  srcDir: string;
  version: string;
};

export type OpenApiConfigDisabled = {
  enabled: false;
};

export type OpenApiConfig = {
  enabled: true;
  title: string;
  format?: 'json' | 'yaml';
  out?: string;
  version?: string;
};

export type AsyncApiConfigDisabled = {
  enabled: false;
};

export type AsyncApiConfig = {
  enabled: true;
  title: string;
  format?: 'json' | 'yaml';
  out?: string;
  version?: string;
};

export type FilesConfig = {
  include: string[];
  exclude?: string[];
};

export type GroupConfig = {
  name: string;
  include?: boolean;
  sortOrder?: number;
};

export function initConfig(cwd: string) {
  const programConfigPath = path.resolve(cwd, './api-docstring.config.json');
  if (fs.existsSync(programConfigPath)) {
    console.error('Cannot create config file "api-docstring.config.json: file already exists');
    return;
  }

  fs.writeFileSync(programConfigPath, JSON.stringify(defaultConfig, null, 2));
}

export function locateDefaultConfigPath(cwd: string): string {
  const programConfigPath = path.resolve(cwd, './api-docstring.config');
  if (fs.existsSync(programConfigPath)) return programConfigPath;

  const programConfigPathJson = `${programConfigPath}.json`;
  if (fs.existsSync(programConfigPathJson)) return programConfigPathJson;

  const programConfigPathJs = `${programConfigPath}.js`;
  if (fs.existsSync(programConfigPathJs)) return programConfigPathJs;

  return '';
}

export function loadConfig(filepath?: string): Config {
  if (!filepath) return defaultConfig;

  const providedConfig = require(filepath);

  const config: Partial<Config> = {};

  config.private = validateBool('private', providedConfig.private, true) ?? defaultConfig.private;
  config.version = validateString('version', providedConfig.version);
  config.srcDir = validateString('srcDir', providedConfig.srcDir, true) ?? defaultConfig.srcDir;
  config.outDir = validateString('outDir', providedConfig.outDir, true) ?? defaultConfig.outDir;
  if (validateString('format', providedConfig.format, true) != null) {
    config.format =
      validateUnion<'json' | 'yaml'>('format', providedConfig.format, ['json', 'yaml']) ?? defaultConfig.format;
  }

  // asyncApi
  if (providedConfig.asyncApi != null && validateObject('asyncApi', providedConfig.asyncApi)) {
    const providedAsyncApi = providedConfig.asyncApi as AsyncApiConfig | AsyncApiConfigDisabled;

    if (providedAsyncApi.enabled) {
      const asyncApi: Partial<AsyncApiConfig> = { enabled: true };

      asyncApi.title = validateString('asyncApi.title', providedAsyncApi.title);
      asyncApi.format = validateUnion<'json' | 'yaml'>(
        'asyncApi.format',
        providedAsyncApi.format,
        ['json', 'yaml'],
        true
      );
      asyncApi.version = validateString('asyncApi.version', providedAsyncApi.version, true);
      asyncApi.out = validateString('asyncApi.out', providedAsyncApi.out, true);

      config.asyncApi = asyncApi as AsyncApiConfig;
    } else {
      config.asyncApi = providedAsyncApi;
    }
  }

  // openApi
  if (providedConfig.openApi != null && validateObject('openApi', providedConfig.openApi)) {
    const providedOpenApi = providedConfig.openApi as OpenApiConfig | OpenApiConfigDisabled;

    if (providedOpenApi.enabled) {
      const openApi: Partial<OpenApiConfig> = { enabled: true };

      openApi.title = validateString('openApi.title', providedOpenApi.title);
      openApi.format = validateUnion<'json' | 'yaml'>('openApi.format', providedOpenApi.format, ['json', 'yaml'], true);
      openApi.version = validateString('openApi.version', providedOpenApi.version, true);
      openApi.out = validateString('openApi.out', providedOpenApi.out, true);

      config.openApi = openApi as OpenApiConfig;
    }
  }

  // files
  if (providedConfig.files != null && validateObject('files', providedConfig.files, true)) {
    // biome-ignore lint/style/noNonNullAssertion: Constantly defined to be non-null
    const defaultFiles = defaultConfig.files!;
    const providedFiles = providedConfig.files;
    const files: Partial<FilesConfig> = {};

    const include = validateArray('files.include', providedFiles.include, true);
    if (include != null)
      files.include = validateArrayItems<string>('files.include', include, validateString) ?? defaultFiles.include;
    const exclude = validateArray('files.exclude', providedFiles.exclude, true);
    if (exclude != null)
      files.exclude = validateArrayItems<string>('files.exclude', exclude, validateString) ?? defaultFiles.exclude;

    config.files = files as FilesConfig;
  }

  // groups
  if (providedConfig.groups != null && validateArray(providedConfig.groups, true)) {
    const providedGroups = validateArray('groups', providedConfig.groups, true);
    const groups: GroupConfig[] = [];

    if (providedGroups) {
      for (let i = 0; i < providedGroups.length; i++) {
        const providedGroup = validateObject(`groups[${i}]`, providedGroups[i]);

        const group: Partial<GroupConfig> = {};
        group.name = validateString(`groups[${i}].name`, providedGroup.name);
        group.include = validateBool(`groups[${i}].include`, providedGroup.include, true);
        group.sortOrder = validateNumber(`groups[${i}]`, providedGroup.sortOrder, true);

        groups.push(group as GroupConfig);
      }
    }

    config.groups = groups;
  }

  return config as Config;
}
