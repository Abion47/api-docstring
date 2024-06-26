import Globals from '../../globals';
import type { Element } from '../../parser';
import { tokenizeContent, tokensToFields } from '../../util/element_content_parser';
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
    plain: 'reason',
  });

  if (typeof fields === 'string') {
    element.hasError = true;
    element.error = fields;
    return { elementType: element.name };
  }

  return {
    elementType: element.name,
    reason: fields.reason,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
