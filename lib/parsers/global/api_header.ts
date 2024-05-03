import Globals from '../../globals';
import type { Element } from '../../parser';
import { checkRequiredFields, tokenizeContent, tokensToFields } from '../../util/element_content_parser';
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
    plain: 'name',
  });

  if (typeof fields === 'string') {
    element.hasError = true;
    element.error = fields;
    return { elementType: element.name };
  }

  const error = checkRequiredFields(fields, ['name']);

  if (error) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: ${error}`;
    return { elementType: element.name };
  }

  const matches = /^([\w_.-]+)(\?)?(?:=([^\n]+))?$/.exec(fields.name as string);
  if (matches == null) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: Name field is null or empty`;
    return { elementType: element.name };
  }

  const name = matches[1];
  const optional = (matches.length >= 3 ? matches[2] : undefined) === '?';
  const defaultValue = matches.length >= 4 ? matches[3] : undefined;

  const description = concatNewlines(element.body);

  return {
    elementType: element.name,
    name,
    optional,
    defaultValue,
    description,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
