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
  files: { include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'] },
  format: 'json',
  outDir: './api',
  srcDir: './src',
};

export type InputConfig = {
  asyncApi?: AsyncApiConfig;
  files?: FilesConfig;
  format?: 'json' | 'yaml';
  groups?: GroupConfig[];
  openApi?: OpenApiConfig;
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

export type InputOpenApiConfig = {
  enabled?: boolean;
  format?: 'json' | 'yaml';
  out?: string;
  version?: string;
};

export type Config = {
  asyncApi: AsyncApiConfig;
  files: FilesConfig;
  format: 'json' | 'yaml';
  groups?: GroupConfig[];
  openApi: OpenApiConfig;
  outDir: string;
  srcDir: string;
  version: string;
};

export type AsyncApiConfig = {
  enabled: boolean;
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

export type OpenApiConfig = {
  enabled: boolean;
  format?: 'json' | 'yaml';
  out?: string;
  version?: string;
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

  const config: Partial<Config> = { ...defaultConfig };

  config.version = validateString('version', providedConfig.version);
  config.srcDir = validateString('srcDir', providedConfig.srcDir, true) ?? defaultConfig.srcDir;
  config.outDir = validateString('outDir', providedConfig.outDir, true) ?? defaultConfig.outDir;
  if (validateString('format', providedConfig.format, true) != null)
    config.format =
      validateUnion<'json' | 'yaml'>('format', providedConfig.format, ['json', 'yaml']) ?? defaultConfig.format;

  // asyncApi
  if (providedConfig.asyncApi != null && validateObject(providedConfig.asyncApi, true)) {
    // biome-ignore lint/style/noNonNullAssertion: Constantly defined to be non-null
    const defaultAsyncApi = defaultConfig.asyncApi!;
    const providedAsyncApi = providedConfig.asyncApi;
    const asyncApi: Partial<AsyncApiConfig> = { ...defaultAsyncApi };

    asyncApi.enabled = validateBool('asyncApi.enabled', providedAsyncApi.enabled);
    if (validateString('asyncApi.format', providedAsyncApi.format, true) != null)
      config.format =
        validateUnion<'json' | 'yaml'>('asyncApi.format', providedAsyncApi.format, ['json', 'yaml']) ??
        defaultAsyncApi.format;
    asyncApi.version = validateString('asyncApi.version', providedAsyncApi.version) ?? defaultAsyncApi.version;
    asyncApi.out = validateString('asyncApi.out', providedAsyncApi.version) ?? defaultAsyncApi.out;

    config.asyncApi = asyncApi as AsyncApiConfig;
  }

  // openApi
  if (providedConfig.asyncApi != null && validateObject(providedConfig.asyncApi, true)) {
    // biome-ignore lint/style/noNonNullAssertion: Constantly defined to be non-null
    const defaultOpenApi = defaultConfig.openApi!;
    const providedOpenApi = providedConfig.openApi;
    const openApi: Partial<AsyncApiConfig> = { ...defaultOpenApi };

    openApi.enabled = validateBool('openApi.enabled', providedOpenApi.enabled);
    if (validateString('openApi.format', providedOpenApi.format, true) != null)
      config.format =
        validateUnion<'json' | 'yaml'>('openApi.format', providedOpenApi.format, ['json', 'yaml']) ??
        defaultOpenApi.format;
    openApi.version = validateString('openApi.version', providedOpenApi.version) ?? defaultOpenApi.version;
    openApi.out = validateString('openApi.out', providedOpenApi.version) ?? defaultOpenApi.out;

    config.openApi = openApi as OpenApiConfig;
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
