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
    parenth: 'group',
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

  const matches = /^([\w.]+)(\?)?$/.exec(fields.name as string);
  if (matches == null) {
    element.hasError = true;
    element.error = `Element ${element.index} could not be parsed: Name field is null or empty`;
    return { elementType: element.name };
  }

  const path = matches[1];
  const optional = (matches.length >= 3 ? matches[2] : undefined) === '?';

  let root = path;
  let accessors: string[] | undefined = undefined;
  if (path.includes('.')) {
    const split = root.split('.');
    root = split[0];
    accessors = split.slice(1);
  }

  const description = element.body;

  return {
    elementType: element.name,
    group: fields.group,
    type: fields.type,
    name: root,
    inner: accessors,
    optional,
    description,
  };
}

const parser: FieldParser = {
  parse,
};

export = parser;
