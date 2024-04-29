import Globals from '../../globals';
import type { Element } from '../../parser';
import { checkRequiredFields, tokenizeContent, tokensToFields } from '../../util/element_content_parser';
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
    curly: 'type',
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

  if (!element.body) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: Body is required`;
    return { elementType: element.name };
  }

  const enums = element.body
    .split('\n')
    .filter(s => s !== '')
    .map((line, idx) => {
      const [name, value] = line.split('=');
      return { index: idx, name, value };
    });

  return {
    elementType: element.name,
    type: fields.type,
    name: fields.name,
    enums,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
