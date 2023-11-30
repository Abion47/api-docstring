export default function unindent(str: string): string {
  const lines = str.split('\n');

  const indentedLines = lines.filter(line => /\S/.test(line)).sort();
  if (indentedLines.length === 0) return str;

  const start = indentedLines[0];
  const end = indentedLines[indentedLines.length - 1];

  const maxLength = Math.min(start.length, end.length);

  let i = 0;
  while (i < maxLength && /\s/.test(start.charAt(i)) && start.charAt(i) === end.charAt(i)) {
    i++;
  }

  if (i === 0) return str;

  return lines.map(line => line.substring(i)).join('\n');
}
