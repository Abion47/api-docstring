import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

import type { ApiDefinition } from '../../analyzer';
import type { Config } from '../../conf';

import openApi300 from './v3.0.0';

export const latestOpenApi = '3.0.0';

export function generateOpenApi(config: Config, openApiDefinition: ApiDefinition, out: string) {
  if (!config.openApi.enabled) return;

  const version = config.openApi.version ?? latestOpenApi;

  let openApi: unknown;
  switch (version) {
    case '3.0.0':
      openApi = openApi300(config, openApiDefinition);
      break;
    default:
      throw new Error(`Unsupported OpenAPI version: ${version}`);
  }

  // TODO: Make spacing/minifcation configurable
  let output: string;
  if (config.openApi.format === 'yaml' || (config.openApi.format == null && config.format === 'yaml')) {
    output = YAML.stringify(openApi);
  } else {
    output = JSON.stringify(openApi, null, 2);
  }

  const outputDir = path.resolve(process.cwd(), out);
  const outputFile = path.resolve(outputDir, 'openapi.json');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, output, { encoding: 'utf8' });
}
