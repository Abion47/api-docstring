import type { ApiDefinition } from '../../../analyzer';
import type { Config } from '../../../conf';
import Globals from '../../../globals';
import type { Block, ParsedElement } from '../../../parser';
import type {
  ApiBinaryBody,
  ApiBody,
  ApiBodyExample,
  ApiDeprecated,
  ApiDescription,
  ApiEnum,
  ApiExample,
  ApiHeader,
  ApiHeaderExample,
  ApiIgnore,
  ApiName,
  ApiParam,
  ApiParamExample,
  ApiPermission,
  ApiPrivate,
  ApiQuery,
  ApiQueryExample,
  ApiShortName,
  ApiType,
  ApiUse,
  OpenApiPath,
  OpenApiSuccess,
  OpenApiSuccessExample,
  OpenApiSuccessHeader,
  OpenApiSuccessHeaderExample,
} from '../../../parsers/model';

export type OpenApiSchemaFormat =
  | 'int32'
  | 'int64'
  | 'float'
  | 'double'
  | 'byte'
  | 'binary'
  | 'date'
  | 'date-time'
  | 'email'
  | 'uuid'
  | 'password';

export type OpenApiSchemaObject = {
  [key: `x-${string}`]: unknown;
  type: string;
  enum?: (string | number)[];
  maxLength?: number;
  items?: OpenApiSchemaObject;
  properties?: Record<string, OpenApiSchemaObject>;
  required?: string[];
  format?: OpenApiSchemaFormat;
  default?: unknown;
  description?: string;
};

export type OpenApiParamObject = {
  name: string;
  in: 'query' | 'header' | 'path';
  required: boolean;
  schema: OpenApiSchemaObject;
  description?: string;
  example?: string;
  'x-example-lang'?: string;
  'x-example-title'?: string;
};

export type OpenApiOperationObject = {
  [key: `x-${string}`]: unknown;
  operationId?: string;
  summary?: string;
  description?: string;
  // security?: Record<string, string[]>[];
  deprecated?: boolean;
  parameters?: OpenApiParamObject[];
  requestBody?: {
    content:
      | {
          'application/json': {
            schema: OpenApiSchemaObject;
            example?: string;
            'x-example-lang'?: string;
            'x-example-title'?: string;
          };
        }
      | {
          'application/octet-stream': {
            schema: OpenApiSchemaObject;
            example?: string;
            'x-example-lang'?: string;
            'x-example-title'?: string;
          };
        };
  };
  responses?: {
    [key: string]: {
      description: string;
      headers?: {
        [key: string]: Omit<OpenApiParamObject, 'name' | 'in'>;
      };
      content?:
        | {
            'application/json': {
              schema: OpenApiSchemaObject;
              example?: string;
              'x-example-lang'?: string;
              'x-example-title'?: string;
            };
          }
        | {
            'application/octet-stream': {
              schema: OpenApiSchemaObject;
              example?: string;
              'x-example-lang'?: string;
              'x-example-title'?: string;
            };
          };
    };
  };
};

export type OpenApi = {
  $schema: string;
  openapi: '3.0.0';
  info: {
    version: string;
    title: string;
  };
  paths: {
    [key: string]: Record<string, OpenApiOperationObject>;
  };
};

function convertType(type: string) {
  if (type.endsWith('[]')) {
    return 'array';
  }

  switch (type.toLowerCase()) {
    case 'boolean':
      return 'boolean';
    case 'integer':
    case 'number':
      return 'number';
    case 'uuid':
    case 'datetime':
    case 'binary':
    case 'string':
      return 'string';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'unknown';
  }
}

function detectFormat(type: string): OpenApiSchemaFormat | undefined {
  switch (type.toLowerCase()) {
    case 'binary':
      return 'binary';
    case 'integer':
      return 'int32';
    case 'uuid':
      return 'uuid';
    case 'datetime':
      return 'date-time';
    default:
      return undefined;
  }
}

function formatValue(type: string, value: string) {
  switch (type.toLowerCase()) {
    case 'boolean':
      return value.toLowerCase() === 'true';

    case 'integer':
      return Number.parseInt(value);

    case 'number':
      return Number.parseFloat(value);

    case 'array':
    case 'object':
      return JSON.parse(value);

    case 'uuid':
    case 'datetime':
    case 'string':
      return value;

    default:
      return 'unknown';
  }
}

export default function generate(config: Config, definition: ApiDefinition): OpenApi {
  const openApi: OpenApi = {
    $schema: 'https://spec.openapis.org/oas/3.0/schema/2021-09-28',
    openapi: '3.0.0',
    info: definition.info,
    paths: {},
  };

  function processBlock(
    operation: OpenApiOperationObject,
    globalDefines: Record<string, Block>,
    defines: Record<string, Block>,
    block: Block
  ) {
    const types: Record<string, OpenApiSchemaObject> = {};
    const enums: Record<string, { type: string; values: (string | number)[] }> = {};
    const elementsToParse: ParsedElement[] = [];

    function buildSchemaObject(typeName: string, description: string | undefined, defaultValue: string | undefined) {
      const type = convertType(typeName);
      let schemaObj: OpenApiSchemaObject;

      if (type === 'unknown') {
        const customType = types[typeName];
        if (customType != null) {
          schemaObj = {
            ...customType,
            description,
          };
        } else if (typeName in enums) {
          const enumEntry = enums[typeName];
          schemaObj = {
            type: enumEntry.type,
            enum: enumEntry.values,
            description,
          };
        } else {
          Globals.app.log.error(`Unrecognized OpenAPI type: ${type}`);
          schemaObj = {
            type,
            description,
          };
        }
      } else {
        schemaObj = {
          type,
          description,
        };
      }

      if (type === 'array') {
        const itemTypeName = typeName.substring(0, typeName.length - 2);
        const itemType = convertType(itemTypeName);
        let itemSchemaObj: OpenApiSchemaObject;

        if (itemType === 'unknown') {
          const customType = types[itemTypeName];
          if (customType != null) {
            itemSchemaObj = {
              ...customType,
            };
          } else if (itemTypeName in enums) {
            const enumEntry = enums[itemTypeName];
            itemSchemaObj = {
              type: enumEntry.type,
              enum: enumEntry.values,
            };
          } else {
            Globals.app.log.error(`Unrecognized OpenAPI type: ${itemType}`);
            itemSchemaObj = {
              type: itemType,
            };
          }
        } else {
          itemSchemaObj = {
            type: itemType,
          };
        }

        const itemsFormat = detectFormat(itemType);
        if (itemsFormat) {
          itemSchemaObj.format = itemsFormat;
        }

        schemaObj.items = itemSchemaObj;
      }

      if (defaultValue) {
        schemaObj.default = formatValue(typeName, defaultValue);
      }

      const format = detectFormat(typeName);
      if (format) {
        schemaObj.format = format;
      }

      return schemaObj;
    }

    // Initial Pass
    for (const element of block.elements as ParsedElement[]) {
      if (element.hasError) {
        Globals.app.log.error('Element could not be parsed:', `[${element.name}]`, element.error);
        continue;
      }

      switch (element.name) {
        case 'apienum': {
          const parserOutput = element.parserOutput as ApiEnum;
          let type = parserOutput.type?.toLowerCase();
          const values = parserOutput.enums.map(entry => {
            if (!type) {
              if (entry.value) type = typeof entry.value;
              else type = 'integer';
            }
            if (entry.value) return entry.value;
            if (type === 'string') return entry.name;
            return entry.index;
          });

          if (!type || values.length === 0) {
            Globals.app.log.error('An @apiEnum was declared but no items were specified.');
            break;
          }

          enums[parserOutput.name] = {
            type,
            values,
          };
          break;
        }

        case 'apiuse': {
          const parserOutput = element.parserOutput as ApiUse;

          let reference: Block | undefined = defines[parserOutput.name];
          if (!reference) {
            reference = globalDefines[parserOutput.name];
            if (!reference) {
              Globals.app.log.error(
                `An @apiUse has referenced a define '${parserOutput.name}', but no define with that name can be found in the scope.`
              );
              break;
            }
          }

          elementsToParse.push(
            ...(reference.elements as ParsedElement[]).filter(
              element => element.name !== 'apidefine' && element.name !== 'apidefineglobal'
            )
          );
          break;
        }

        default:
          elementsToParse.push(element);
          break;
      }
    }

    let skipBlock = false;
    let path = '';
    let method = '';
    let apiExample: { example: string; title?: string; lang?: string } | undefined;
    let bodyExample: { example: string; title?: string; lang?: string } | undefined;

    let requestBodySchema: OpenApiSchemaObject | undefined;

    let lastHeader: OpenApiParamObject | undefined;
    let lastParam: OpenApiParamObject | undefined;
    let lastQuery: OpenApiParamObject | undefined;
    let lastSuccessHeader: Omit<OpenApiParamObject, 'name' | 'in'> | undefined;

    let successHeaders:
      | {
          [key: string]: Omit<OpenApiParamObject, 'name' | 'in'>;
        }
      | undefined;
    let successContent:
      | {
          'application/json': {
            schema: OpenApiSchemaObject;
            example?: string;
            'x-example-lang'?: string;
            'x-example-title'?: string;
          };
        }
      | {
          'application/octet-stream': {
            schema: OpenApiSchemaObject;
            example?: string;
            'x-example-lang'?: string;
            'x-example-title'?: string;
          };
        }
      | undefined;

    // Second pass
    for (const element of elementsToParse) {
      Globals.app.log.debug(element.source);
      switch (element.name) {
        case 'api': {
          const parserOutput = element.parserOutput as OpenApiPath;
          method = parserOutput.method.toLowerCase();
          path = parserOutput.path.replace(/:[\w\d_-]+/g, match => `{${match.substring(1)}}`);
          break;
        }

        case 'apibinarybody': {
          const parserOutput = element.parserOutput as ApiBinaryBody;
          if (requestBodySchema) {
            Globals.app.log.error('An @apiBinaryBody has been declared after an @apiBody has already been processed.');
            break;
          }

          requestBodySchema = {
            type: 'string',
            format: 'binary',
            description: parserOutput.description,
          };
          if (parserOutput.maxSize) requestBodySchema.maxLength = Number.parseInt(parserOutput.maxSize);
          break;
        }

        case 'apibodyexample': {
          const parserOutput = element.parserOutput as ApiBodyExample;
          bodyExample = { example: parserOutput.example, lang: parserOutput.lang };
          break;
        }

        case 'apibody': {
          const parserOutput = element.parserOutput as ApiBody;
          // requestBodySchema.type = parserOutput.type;

          if (requestBodySchema && requestBodySchema.format === 'binary') {
            Globals.app.log.error('An @apiBody has been declared after an @apiBinaryBody has already been processed.');
            break;
          }

          requestBodySchema ??= {
            type: 'object',
            properties: {},
            required: [],
          };

          let parentSchema = requestBodySchema;
          let propertyName = parserOutput.name;
          let parentFound = true;
          if (parserOutput.inner) {
            const keys = [parserOutput.name, ...parserOutput.inner];
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];

              if (key === '[]') {
                if (parentSchema.type !== 'array') {
                  parentFound = false;
                  Globals.app.log.error(
                    `An @apiSuccess defined an inner array but the parent property has not been defined or isn't an array: ${
                      parserOutput.name
                    }.${parserOutput.inner.join('.')}`
                  );
                  break;
                }

                if (parentSchema.items == null) {
                  Globals.app.log.error(
                    `An @apiBody defined an inner array but the parent property is malformed: ${
                      parserOutput.name
                    }.${parserOutput.inner.join('.')}`
                  );
                  break;
                }

                parentSchema.items.properties ??= {};
                parentSchema = parentSchema.items;

                if (i + 1 >= keys.length - 1) {
                  propertyName = keys[i + 1];
                  break;
                }

                continue;
              }

              if (parentSchema.type !== 'object') {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiBody defined an inner property but the parent property isn't an object: ${
                    parserOutput.name
                  }.${parserOutput.inner.join('.')}`
                );
                break;
              }

              if (!parentSchema.properties) {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiSuccess defined an inner property but the parent property has not been defined: ${
                    parserOutput.name
                  }.${parserOutput.inner.join('.')}`
                );
                break;
              }

              parentSchema = parentSchema.properties[key];
              propertyName = keys[i + 1];
            }
          }

          if (!parentFound) break;

          const propertySchema = buildSchemaObject(
            parserOutput.type,
            parserOutput.description,
            parserOutput.defaultValue
          );
          // const type = convertType(parserOutput.type);
          // if (type === 'unknown') {
          //   const customType = types[parserOutput.type];
          //   if (customType != null) {
          //     propertySchema = {
          //       ...customType,
          //       description: parserOutput.description,
          //     };
          //   } else {
          //     Globals.app.log.error(`Unrecognized OpenAPI type: ${type}`);
          //     propertySchema = {
          //       type,
          //       description: parserOutput.description,
          //     };
          //   }
          // } else {
          //   propertySchema = {
          //     type,
          //     description: parserOutput.description,
          //   };
          // }

          // const format = detectFormat(parserOutput.type);
          // let itemType: string | undefined;
          // if (type === 'array') {
          //   itemType = convertType(parserOutput.type.substring(0, parserOutput.type.length - 2));
          // }

          // if (itemType) {
          //   const itemsFormat = detectFormat(itemType);
          //   propertySchema.items = {
          //     type: itemType,
          //     format: itemsFormat,
          //   };
          // }

          // if (parserOutput.defaultValue) {
          //   propertySchema.default = formatValue(parserOutput.type, parserOutput.defaultValue);
          // }

          // if (parserOutput.type in enums) {
          //   const enumEntry = enums[parserOutput.type];
          //   propertySchema.type = enumEntry.type;
          //   propertySchema.enum = enumEntry.values;
          // } else if (format) {
          //   propertySchema.format = format;
          // }

          if (!parserOutput.optional) {
            parentSchema.required?.push(propertyName);
          }

          parentSchema.properties ??= {};
          parentSchema.properties[propertyName] = propertySchema;
          break;
        }

        case 'apicomment': {
          break;
        }

        case 'apideprecated': {
          const parserOutput = element.parserOutput as ApiDeprecated;
          operation.deprecated = true;
          operation['x-deprecated-reason'] = parserOutput.reason;
          break;
        }

        case 'apidescription': {
          const parserOutput = element.parserOutput as ApiDescription;
          operation.description = parserOutput.description;
          break;
        }

        // case 'apierrorexample': {
        //   const parserOutput = element.parserOutput as ApiErrorExample;
        //   break;
        // }

        // case 'apierror': {
        //   const parserOutput = element.parserOutput as ApiError;
        //   break;
        // }

        // case 'apierrorheaderexample': {
        //   const parserOutput = element.parserOutput as ApiErrorHeaderExample;
        //   break;
        // }

        // case 'apierrorheader': {
        //   const parserOutput = element.parserOutput as ApiErrorHeader;
        //   break;
        // }

        case 'apiexample': {
          const parserOutput = element.parserOutput as ApiExample;
          apiExample = { example: parserOutput.example, lang: parserOutput.lang };
          break;
        }

        case 'apiheaderexample': {
          const parserOutput = element.parserOutput as ApiHeaderExample;
          if (lastHeader == null) {
            Globals.app.log.warn('No preceding header to attach example to.');
            break;
          }
          const header = lastHeader;
          header.example = parserOutput.example;
          header['x-example-title'] = parserOutput.title;
          header['x-example-lang'] = parserOutput.lang;
          break;
        }

        case 'apiheader': {
          const parserOutput = element.parserOutput as ApiHeader;
          const header: OpenApiParamObject = {
            name: parserOutput.name,
            in: 'header',
            required: !parserOutput.optional,
            description: parserOutput.description,
            schema: {
              type: 'string',
            },
          };

          if (parserOutput.defaultValue) {
            header.schema.default = formatValue('string', parserOutput.defaultValue);
          }

          operation.parameters ??= [];
          operation.parameters.push(header);
          lastHeader = header;
          break;
        }

        case 'apiignore': {
          const parserOutput = element.parserOutput as ApiIgnore;
          skipBlock = true;
          Globals.app.log.verbose(
            `Skipping block due to being marked ignored.${
              parserOutput.reason ? ` (Reason: ${parserOutput.reason})` : ''
            }`
          );
          break;
        }

        case 'apiname': {
          const parserOutput = element.parserOutput as ApiName;
          operation.summary = parserOutput.name;
          break;
        }

        case 'apiparamexample': {
          const parserOutput = element.parserOutput as ApiParamExample;
          if (lastParam == null) {
            Globals.app.log.warn('No preceding header to attach example to.');
            break;
          }
          const param = lastParam;
          param.example = parserOutput.example;
          param['x-example-title'] = parserOutput.title;
          param['x-example-lang'] = parserOutput.lang;
          break;
        }

        case 'apiparam': {
          const parserOutput = element.parserOutput as ApiParam;
          const param: OpenApiParamObject = {
            name: parserOutput.name,
            in: 'path',
            required: !parserOutput.optional,
            description: parserOutput.description,
            schema: {
              type: convertType(parserOutput.type),
            },
          };

          if (parserOutput.defaultValue) {
            param.schema.default = formatValue(parserOutput.type, parserOutput.defaultValue);
          }

          operation.parameters ??= [];
          operation.parameters.push(param);
          lastParam = param;
          break;
        }

        case 'apipermission': {
          const parserOutput = element.parserOutput as ApiPermission;
          operation['x-flows'] ??= [];
          (operation['x-flows'] as string[]).push(parserOutput.name);
          break;
        }

        case 'apiprivate': {
          const parserOutput = element.parserOutput as ApiPrivate;
          if (!config.private) {
            skipBlock = true;
            break;
          }

          operation['x-private'] = true;
          if (parserOutput.reason) {
            operation['x-private-reason'] = parserOutput.reason;
          }
          break;
        }

        case 'apiqueryexample': {
          const parserOutput = element.parserOutput as ApiQueryExample;
          if (lastQuery == null) {
            Globals.app.log.warn('No preceding header to attach example to.');
            break;
          }
          const query = lastQuery;
          query.example = parserOutput.example;
          query['x-example-title'] = parserOutput.title;
          query['x-example-lang'] = parserOutput.lang;
          break;
        }

        case 'apiquery': {
          const parserOutput = element.parserOutput as ApiQuery;
          const query: OpenApiParamObject = {
            name: parserOutput.name,
            in: 'query',
            required: !parserOutput.optional,
            description: parserOutput.description,
            schema: {
              type: convertType(parserOutput.type),
            },
          };

          if (parserOutput.defaultValue) {
            query.schema.default = formatValue(parserOutput.type, parserOutput.defaultValue);
          }

          operation.parameters ??= [];
          operation.parameters.push(query);
          lastQuery = query;
          break;
        }

        case 'apishortname': {
          const parserOutput = element.parserOutput as ApiShortName;
          operation.operationId = parserOutput.name;
          break;
        }

        case 'apitype': {
          const parserOutput = element.parserOutput as ApiType;

          let parentSchema = types[parserOutput.typeName];
          if (!parentSchema) {
            parentSchema = {
              'x-type': parserOutput.typeName,
              type: 'object',
              properties: {},
              required: [],
            };
            types[parserOutput.typeName] = parentSchema;
          }

          let propertyName = parserOutput.fieldName;
          let parentFound = true;
          if (parserOutput.fieldInner) {
            const keys = [parserOutput.fieldName, ...parserOutput.fieldInner];
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];

              if (key === '[]') {
                if (parentSchema.type !== 'array') {
                  parentFound = false;
                  Globals.app.log.error(
                    `An @apiSuccess defined an inner array but the parent property has not been defined or isn't an array: ${
                      parserOutput.name
                    }.${parserOutput.fieldInner.join('.')}`
                  );
                  break;
                }

                if (parentSchema.items == null) {
                  Globals.app.log.error(
                    `An @apiBody defined an inner array but the parent property is malformed: ${
                      parserOutput.name
                    }.${parserOutput.fieldInner.join('.')}`
                  );
                  break;
                }

                parentSchema.items.properties ??= {};
                parentSchema = parentSchema.items;

                if (i + 1 >= keys.length - 1) {
                  propertyName = keys[i + 1];
                  break;
                }

                continue;
              }

              if (parentSchema.type !== 'object') {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiBody defined an inner property but the parent property isn't an object: ${
                    parserOutput.name
                  }.${parserOutput.fieldInner.join('.')}`
                );
                break;
              }

              if (!parentSchema.properties) {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiSuccess defined an inner property but the parent property has not been defined: ${
                    parserOutput.name
                  }.${parserOutput.fieldInner.join('.')}`
                );
                break;
              }

              parentSchema = parentSchema.properties[key];
              propertyName = keys[i + 1];
            }
          }

          if (!parentFound) break;

          const propertySchema = buildSchemaObject(
            parserOutput.fieldType,
            parserOutput.description,
            parserOutput.fieldDefaultValue
          );

          if (!parserOutput.fieldOptional) {
            parentSchema.required?.push(propertyName);
          }

          parentSchema.properties ??= {};
          parentSchema.properties[propertyName] = propertySchema;
          break;
        }

        // case 'apiversion': {
        //   const parserOutput = element.parserOutput as ApiVersion;
        //   break;
        // }

        case 'apisuccessexample': {
          const parserOutput = element.parserOutput as OpenApiSuccessExample;
          if (!successContent) {
            Globals.app.log.warn('An @apiSuccessExample was specified before a corresponding @apiSuccess');
            break;
          }

          let content: {
            schema: OpenApiSchemaObject;
            example?: string;
            'x-example-lang'?: string;
            'x-example-title'?: string;
          };
          if ('application/json' in successContent) content = successContent['application/json'];
          else content = successContent['application/octet-stream'];

          content.example = parserOutput.example;
          content['x-example-title'] = parserOutput.title;
          content['x-example-lang'] = parserOutput.lang;
          break;
        }

        case 'apisuccess': {
          const parserOutput = element.parserOutput as OpenApiSuccess;

          if (!successContent) {
            successContent = {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              },
            };
          }

          if (!('application/json' in successContent)) {
            Globals.app.log.error('Cannot declare an @apiSuccess after @apiSuccessBinaryBody has been declared');
            break;
          }

          if (!successContent['application/json'].schema) {
            successContent['application/json'].schema = {
              type: 'object',
              properties: {},
              required: [],
            };
          }

          if (!successContent['application/json'].schema.properties) {
            successContent['application/json'].schema.properties = {};
          }

          let parentSchema = successContent['application/json'].schema;
          let propertyName = parserOutput.name;
          let parentFound = true;
          if (parserOutput.inner) {
            const keys = [parserOutput.name, ...parserOutput.inner];
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];

              if (key === '[]') {
                if (parentSchema.type !== 'array') {
                  parentFound = false;
                  Globals.app.log.error(
                    `An @apiSuccess defined an inner array but the parent property has not been defined or isn't an array: ${
                      parserOutput.name
                    }.${parserOutput.inner.join('.')}`
                  );
                  break;
                }

                if (parentSchema.items == null) {
                  Globals.app.log.error(
                    `An @apiSuccess defined an inner array but the parent property is malformed: ${
                      parserOutput.name
                    }.${parserOutput.inner.join('.')}`
                  );
                  break;
                }

                parentSchema.items.properties ??= {};
                parentSchema = parentSchema.items;

                if (i + 1 >= keys.length - 1) {
                  propertyName = keys[i + 1];
                  break;
                }

                continue;
              }

              if (parentSchema.type !== 'object') {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiSuccess defined an inner property but the parent property isn't an object: ${
                    parserOutput.name
                  }.${parserOutput.inner.join('.')}`
                );
                break;
              }

              if (!parentSchema.properties) {
                parentFound = false;
                Globals.app.log.error(
                  `An @apiSuccess defined an inner property but the parent property has not been defined: ${
                    parserOutput.name
                  }.${parserOutput.inner.join('.')}`
                );
                break;
              }

              parentSchema = parentSchema.properties[key];
              propertyName = keys[i + 1];
            }
          }

          if (!parentFound) break;

          const propertySchema = buildSchemaObject(
            parserOutput.type,
            parserOutput.description,
            parserOutput.defaultValue
          );

          // const type = convertType(parserOutput.type);
          // const format = detectFormat(parserOutput.type);
          // let itemType: string | undefined;
          // if (type === 'array') {
          //   itemType = convertType(parserOutput.type.substring(0, parserOutput.type.length - 2));
          // }

          // const propertySchema: OpenApiSchemaObject = {
          //   type,
          //   description: parserOutput.description,
          // };

          // if (itemType) {
          //   const itemsFormat = detectFormat(itemType);
          //   propertySchema.items = {
          //     type: itemType,
          //     format: itemsFormat,
          //   };
          // }

          // if (parserOutput.defaultValue) {
          //   propertySchema.default = formatValue(parserOutput.type, parserOutput.defaultValue);
          // }

          // if (parserOutput.type in enums) {
          //   const enumEntry = enums[parserOutput.type];
          //   propertySchema.type = enumEntry.type;
          //   propertySchema.enum = enumEntry.values;
          // } else if (format) {
          //   propertySchema.format = format;
          // }

          parentSchema.properties ??= {};
          parentSchema.properties[propertyName] = propertySchema;

          if (!parserOutput.optional) {
            parentSchema.required ??= [];
            parentSchema.required.push(propertyName);
          }

          break;
        }

        case 'apisuccessheaderexample': {
          const parserOutput = element.parserOutput as OpenApiSuccessHeaderExample;

          if (!lastSuccessHeader) {
            Globals.app.log.warn('An @apiSuccessExample was specified before a corresponding @apiSuccess');
            break;
          }

          lastSuccessHeader.example = parserOutput.example;
          lastSuccessHeader['x-example-title'] = parserOutput.title;
          lastSuccessHeader['x-example-lang'] = parserOutput.lang;
          break;
        }

        case 'apisuccessheader': {
          const parserOutput = element.parserOutput as OpenApiSuccessHeader;
          if (!successHeaders) {
            successHeaders = {};
          }

          successHeaders[parserOutput.name] = {
            schema: {
              type: 'string',
              default: parserOutput.defaultValue,
            },
            required: !parserOutput.optional,
          };

          if (parserOutput.defaultValue) {
            successHeaders[parserOutput.name].schema.default = formatValue('string', parserOutput.defaultValue);
          }
          break;
        }
      }

      if (skipBlock) break;
    }

    if (skipBlock) return undefined;

    return {
      path,
      method,
      apiExample,
      bodyExample,
      requestBodySchema: requestBodySchema as OpenApiSchemaObject,
      successHeaders,
      successContent,
    };
  }

  for (const file of definition.files) {
    Globals.app.log.verbose(`[OpenAPI]: Process file ${file.filename}`);

    for (const block of file.blocks) {
      const operation: OpenApiOperationObject = {};

      const processedBlock = processBlock(operation, definition.globalDefines, file.defines, block);
      if (!processedBlock) continue;

      const { requestBodySchema, successHeaders, successContent, path, method, apiExample, bodyExample } =
        processedBlock;

      if (apiExample) {
        operation['x-example'] = apiExample;
      }

      if (method !== 'get' && requestBodySchema != null && Object.keys(requestBodySchema).length > 0) {
        if (requestBodySchema.format === 'binary') {
          operation.requestBody = {
            content: {
              'application/octet-stream': {
                schema: requestBodySchema,
                example: bodyExample?.example,
                'x-example-lang': bodyExample?.lang,
              },
            },
          };
        } else {
          operation.requestBody = {
            content: {
              'application/json': {
                schema: requestBodySchema,
                example: bodyExample?.example,
                'x-example-lang': bodyExample?.lang,
              },
            },
          };
        }
      }

      operation.responses = {
        '200': {
          description: 'A successful response',
          content: successContent,
        },
      };
      if (successHeaders) {
        operation.responses['200'].headers = successHeaders;
      }

      openApi.paths[path] ??= {};
      openApi.paths[path][method] = operation;
    }
  }

  return openApi;
}
