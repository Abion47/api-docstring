export function concatNewlines(str: string | undefined) {
  return str?.replace(/\n\n/g, '¶').replace(/\n/g, ' ').replace(/¶/g, '\n');
}
