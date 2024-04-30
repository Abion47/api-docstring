import type { FieldParserOutput } from './_types';

export type ApiBinaryBody = FieldParserOutput & {
  encoding?: string;
  maxSize?: string;
};

export type ApiBodyExample = ApiExample;

export type ApiBody = FieldParserOutput & {
  type: string;
  name: string;
  inner?: string[];
  optional: boolean;
  defaultValue?: string;
};

export type ApiDefineGlobal = FieldParserOutput & {
  name: string;
};

export type ApiDefine = FieldParserOutput & {
  name: string;
};

export type ApiDeprecated = FieldParserOutput & {
  reason?: string;
};

export type ApiDescription = FieldParserOutput & {
  description: string;
};

export type ApiEnum = FieldParserOutput & {
  type?: string;
  name: string;
  enums: { index: number; name: string; value?: string | number }[];
};

export type ApiErrorExample = ApiExample & {
  group?: string;
};

export type ApiError = FieldParserOutput & {
  group?: string;
  type: string;
  name: string;
  inner?: string[];
  optional: boolean;
  defaultValue?: string;
};

export type ApiErrorHeader = FieldParserOutput & {
  group?: string;
  name: string;
  optional: boolean;
  defaultValue?: string;
};

export type ApiErrorHeaderExample = ApiExample & {
  group?: string;
};

export type ApiExample = FieldParserOutput & {
  lang?: string;
  title: string;
  example: string;
};

export type ApiHeader = FieldParserOutput & {
  name: string;
  optional: boolean;
  defaultValue?: string;
};

export type ApiHeaderExample = ApiExample;

export type ApiIgnore = FieldParserOutput & {
  reason?: string;
};

export type ApiName = FieldParserOutput & {
  name: string;
};

export type ApiParamExample = ApiExample;

export type ApiParam = FieldParserOutput & {
  type: string;
  name: string;
  optional: boolean;
  defaultValue?: string;
};

export type ApiPermission = FieldParserOutput & {
  type: string;
  name: string;
};

export type ApiPrivate = FieldParserOutput & {
  reason?: string;
};

export type ApiProto = FieldParserOutput & {
  type: string;
  title: string;
};

export type ApiQueryExample = ApiExample;

export type ApiQuery = FieldParserOutput & {
  type: string;
  name: string;
  optional: boolean;
  defaultValue?: string;
};

export type ApiShortName = FieldParserOutput & {
  name: string;
};

export type ApiType = FieldParserOutput & {
  typeName: string;
  fieldType: string;
  fieldName: string;
  fieldInner?: string[];
  fieldOptional: boolean;
  fieldDefaultValue?: string;
};

export type ApiUse = FieldParserOutput & {
  name: string;
};

export type ApiVersion = FieldParserOutput & {
  version: string;
};

export type OpenApiSuccessExample = ApiExample & {
  group?: string;
};

export type OpenApiSuccess = ApiBody & {
  group?: string;
};

export type OpenApiSuccessHeaderExample = ApiExample & {
  group?: string;
};

export type OpenApiSuccessHeader = ApiHeader & {
  group?: string;
};

export type OpenApiPath = FieldParserOutput & {
  method: string;
  path: string;
};
