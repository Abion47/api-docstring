import type { Config } from './conf';
import type { Block, ParsedElement } from './parser';

export type ApiFile = {
  filename: string;
  defines: Record<string, Block>;
  blocks: Block[];
};

export type ApiDefinition = {
  info: {
    title: string;
    version: string;
  };
  globalDefines: Record<string, Block>;
  files: ApiFile[];
};

export const latestOpenApiVersion = '3.0.0';

export function analyzeBlocks(config: Config, fileBlocks: Record<string, Block[]>) {
  const analysisResult = {
    openApi: undefined as ApiDefinition | undefined,
    asyncApi: undefined as ApiDefinition | undefined,
  };

  if (config.openApi.enabled) {
    const definition: ApiDefinition = {
      info: {
        title: config.openApi.title,
        version: config.openApi.version ?? latestOpenApiVersion,
      },
      globalDefines: {},
      files: [],
    };

    analysisResult.openApi = definition as ApiDefinition;

    for (const [filename, blocks] of Object.entries(fileBlocks)) {
      const fileInfo: ApiFile = {
        filename,
        defines: {},
        blocks: [],
      };

      for (const block of blocks) {
        let isDefineBlock = false;

        for (const element of block.elements as ParsedElement[]) {
          if (element.name === 'apidefine') {
            fileInfo.defines[element.parserOutput.name as string] = block;
            isDefineBlock = true;
            break;
          }
          if (element.name === 'apidefineglobal') {
            definition.globalDefines[element.parserOutput.name as string] = block;
            isDefineBlock = true;
            break;
          }
        }

        if (!isDefineBlock) {
          fileInfo.blocks.push(block);
        }
      }

      definition.files?.push(fileInfo);
    }
  }

  return analysisResult;
}
