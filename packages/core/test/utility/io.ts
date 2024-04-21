import fs from 'node:fs';
import path from 'node:path';

export function loadFixture(fixturePath: string, encoding: 'utf8'): string;
export function loadFixture(fixturePath: string, encoding?: 'buffer'): Buffer;
export function loadFixture(fixturePath: string, encoding?: 'buffer' | 'utf8') {
  const fullPath = path.resolve(process.cwd(), 'test/fixtures', fixturePath);
  if (encoding === 'utf8') return fs.readFileSync(fullPath, { encoding: 'utf8' });
  return fs.readFileSync(fullPath);
}
