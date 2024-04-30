import Globals from '../../globals';
import type { Element } from '../../parser';
import { tokenizeContent } from '../../util/element_content_parser';
import type { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  Globals.app.log.debug(tokens);

  return {
    elementType: element.name,
    titleText: element.content,
    bodyText: element.body,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
