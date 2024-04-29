import type { Element } from '../parser';

export type FieldParser = {
  deprecated?: boolean;
  parse: (element: Element) => FieldParserOutput;
};

export type FieldParserOutput = Record<string, unknown> & {
  elementType: string;
  description?: string;
};
