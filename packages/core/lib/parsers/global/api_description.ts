import Globals from '../../globals';
import type { Element } from '../../parser';
import { tokenizeContent } from '../../util/element_content_parser';
import type { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  Globals.app.log.debug(tokens);

  if (typeof tokens === 'string') {
    element.hasError = true;
    element.error = tokens;
    return { elementType: element.name };
  }

  if (!element.body) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: Body is required`;
    return { elementType: element.name };
  }

  return {
    elementType: element.name,
    description: element.body,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
