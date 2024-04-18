import type { App } from '../..';
import type { Element } from '../../parser';
import { tokenizeContent } from '../../util/element_content_parser';
import type { FieldParser, FieldParserOutput } from '../_types';

function parse(app: App, element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  app.log.debug(tokens);

  return { elementType: element.name };
}

const parser: FieldParser = {
  parse,
};

export = parser;
