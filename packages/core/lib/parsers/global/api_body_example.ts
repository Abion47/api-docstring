import { Element } from '../../parser';
import exampleParser from './api_example';
import { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  return exampleParser.parse(element);
}

const parser: FieldParser = {
  parse,
};

export = parser;
