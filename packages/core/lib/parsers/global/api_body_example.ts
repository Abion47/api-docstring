import type { App } from '../..';
import type { Element } from '../../parser';
import type { FieldParser, FieldParserOutput } from '../_types';
import exampleParser from './api_example';

function parse(app: App, element: Element): FieldParserOutput {
  return exampleParser.parse(app, element);
}

const parser: FieldParser = {
  parse,
};

export = parser;
