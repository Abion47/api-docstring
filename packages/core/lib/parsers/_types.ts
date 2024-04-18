import type { App } from '..';
import type { Element } from '../parser';

export type FieldParser = {
  deprecated?: boolean;
  parse: (app: App, element: Element) => FieldParserOutput;
};

export type FieldParserOutput = Record<string, unknown> & {
  elementType: string;
  description?: string;
};
