import { Element } from '../../parser';
import { tokenizeContent } from '../../util/element_content_parser';
import { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  console.log(tokens);

  return { elementType: element.name };
}

const parser: FieldParser = {
  parse,
};

export = parser;
