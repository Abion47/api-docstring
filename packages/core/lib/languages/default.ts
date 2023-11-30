import { Language } from './_types';

/**
 * C#, Go, Dart, Java, JavaScript, PHP (all DocStyle capable languages)
 */
const language: Language = {
  // find document blocks between '/**' and '*/'
  docBlocksRegExp: /\/\*\*(.+?)(?:\s*)?\*\//gs,
  // remove not needed ' * ' and tabs at the beginning
  inlineRegExp: /^(\s*)?(\*)[ ]?/gm,
};

export = language;
