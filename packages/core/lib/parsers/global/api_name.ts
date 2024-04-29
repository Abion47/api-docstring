import Globals from '../../globals';
import type { Element } from '../../parser';
import { tokenizeContent } from '../../util/element_content_parser';
import type { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  Globals.app.log.debug(tokens);

  const name = element.content;

  if (!name) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: Name is required`;
    return { elementType: element.name };
  }

  return {
    elementType: element.name,
    name,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
