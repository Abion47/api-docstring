import { Element } from '../../parser';
import { tokenizeContent, checkRequiredFields, tokensToFields } from '../../util/element_content_parser';
import { FieldParser, FieldParserOutput } from '../_types';

function parse(element: Element): FieldParserOutput {
  const tokens = tokenizeContent(element.content);
  if (typeof tokens === 'string') {
    element.hasError = true;
    element.error = tokens;
    return { elementType: element.name };
  }

  const fields = tokensToFields(tokens, {
    curly: 'lang',
    plain: 'title',
  });

  if (typeof fields === 'string') {
    element.hasError = true;
    element.error = fields;
    return { elementType: element.name };
  }

  const error = checkRequiredFields(fields, ['lang']);

  if (error) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: ${error}`;
  }

  const example = element.body;

  return {
    elementType: element.name,
    lang: fields.lang,
    title: fields.title,
    example,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
