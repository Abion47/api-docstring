import type { Element } from '../../parser';
import type { FieldParser, FieldParserOutput } from '../_types';
import exampleParser from './api_example';

function parse(element: Element): FieldParserOutput {
  return exampleParser.parse(element);
}

const parser: FieldParser = {
  parse,
};

export = parser;
