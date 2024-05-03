import Globals from '../../globals';
import type { Element } from '../../parser';
import { tokenizeContent, tokensToFields } from '../../util/element_content_parser';
import { concatNewlines } from '../../util/misc';
import type { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  Globals.app.log.debug(tokens);

  if (typeof tokens === 'string') {
    element.hasError = true;
    element.error = tokens;
    return { elementType: element.name };
  }

  const fields = tokensToFields(tokens, {
    plain: 'since',
  });

  if (typeof fields === 'string') {
    element.hasError = true;
    element.error = fields;
    return { elementType: element.name };
  }

  const description = concatNewlines(element.body);

  return {
    elementType: element.name,
    since: fields.since,
    description,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
