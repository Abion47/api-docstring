export function tokenizeContent(content: string) {
  let _content = content.trim();
  const tokens: Token[] = [];

  const curlyBracketGroup = /^{(.+?)}/;
  const squareBracketGroup = /^\[(.+?)\]/;
  const parenthesesGroup = /^\((.+?)\)/;
  const quotedWordGroup = /^"(.*?)"/;
  const wordGroup = /^(\S+)/;

  const tokenize = (pattern: RegExp) => {
    pattern.lastIndex = 0;
    const matches = pattern.exec(_content);

    let token = '';
    let fullMatch = '';
    if (matches) {
      token = matches[1];
      fullMatch = matches[0];
    } else {
      token = _content;
      fullMatch = _content;
    }

    _content = _content.substring(fullMatch.length).trimStart();
    return token;
  };

  let plainTokenContent = '';
  while (_content.length > 0) {
    const _c = _content.charAt(0);
    if (_c === '{') {
      if (plainTokenContent !== '')
        return `Error parsing token: Non-plain token ${tokenize(
          curlyBracketGroup
        )} found after plain token ${plainTokenContent}`;
      tokens.push({
        curly: true,
        content: tokenize(curlyBracketGroup),
      });
    } else if (_c === '[') {
      if (plainTokenContent !== '')
        return `Error parsing token: Non-plain token ${tokenize(
          squareBracketGroup
        )} found after plain token ${plainTokenContent}`;
      tokens.push({
        square: true,
        content: tokenize(squareBracketGroup),
      });
    } else if (_c === '(') {
      if (plainTokenContent !== '')
        return `Error parsing token: Non-plain token ${tokenize(
          parenthesesGroup
        )} found after plain token ${plainTokenContent}`;
      tokens.push({
        parenthesis: true,
        content: tokenize(parenthesesGroup),
      });
    } else if (_c === '"') {
      if (plainTokenContent !== '')
        return `Error parsing token: Cannot combine quoted plain token "${tokenize(
          quotedWordGroup
        )}" with non-quoted plain token`;
      tokens.push({
        content: tokenize(quotedWordGroup),
      });
    } else {
      const word = tokenize(wordGroup);
      plainTokenContent = plainTokenContent === '' ? word : `${plainTokenContent} ${word}`;
    }
  }

  if (plainTokenContent !== '') {
    tokens.push({
      content: plainTokenContent,
    });
  }

  return tokens;
}

export type Token = {
  curly?: boolean;
  square?: boolean;
  parenthesis?: boolean;
  content: string;
};

export function tokensToFields(
  tokens: Token[],
  fieldDefs: {
    curly?: string;
    square?: string;
    parenth?: string;
    plain?: string;
  }
) {
  const fields: Record<string, string> = {};

  for (const token of tokens) {
    if (token.curly) {
      if (fieldDefs.curly) {
        if (!fields[fieldDefs.curly]) fields[fieldDefs.curly] = token.content;
        else return `Extraneous curly token found: ${token.content}`;
      } else return `Unexpected curly token found: ${token.content}`;
    } else if (token.square) {
      if (fieldDefs.square) {
        if (!fields[fieldDefs.square]) fields[fieldDefs.square] = token.content;
        else return `Extraneous square token found: ${token.content}`;
      } else return `Unexpected square token found: ${token.content}`;
    } else if (token.parenthesis) {
      if (fieldDefs.parenth) {
        if (!fields[fieldDefs.parenth]) fields[fieldDefs.parenth] = token.content;
        else return `Extraneous parentheses token found: ${token.content}`;
      } else return `Unexpected parentheses token found: ${token.content}`;
    } else {
      if (fieldDefs.plain) {
        if (!fields[fieldDefs.plain]) fields[fieldDefs.plain] = token.content;
        else return `Extraneous plain token found: ${token.content}`;
      } else return `Unexpected plain token found: ${token.content}`;
    }
  }

  return fields;
}

export function checkRequiredFields(fields: Record<string, unknown>, requiredFields: string[]) {
  for (const req of requiredFields) {
    if (!fields[req]) {
      return `Could not find required field ${req}.`;
    }
  }
  return undefined;
}
