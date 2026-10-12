/**
 * 알고리즘 유형 콘텐츠의 핵심 해설(keyPoints)이 언어마다 맞는 줄을 가리키는지 눈으로 확인한다.
 *   npx tsx scripts/show-pattern.ts <유형 id> [언어 ...]
 *   npx tsx scripts/show-pattern.ts binary-search-lower-bound
 *   npx tsx scripts/show-pattern.ts binary-search-lower-bound kotlin cpp
 *   npx tsx scripts/show-pattern.ts binary-search-lower-bound --lines   # 핵심 해설이 가리키는 줄만
 *
 * 콘텐츠 폴더는 src/content/data (npm run content:sync), TJ_CONTENT_DATA 로 비공개 콘텐츠 폴더를 직접 지정할 수 있다.
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AlgoPattern, SolveLanguage } from '../src/content/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = process.env.TJ_CONTENT_DATA ? resolve(process.env.TJ_CONTENT_DATA) : join(ROOT, 'src', 'content', 'data');
const ALL: SolveLanguage[] = ['python', 'javascript', 'java', 'kotlin', 'cpp'];

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--') && !ALL.includes(a as SolveLanguage));
const onlyLines = args.includes('--lines');
const langs = ALL.filter((l) => args.includes(l));
if (!id) {
  console.error('사용법: npx tsx scripts/show-pattern.ts <유형 id> [언어 ...] [--lines]');
  process.exit(1);
}

async function main() {
  const file = join(CONTENT, 'algorithm', 'patterns', `${id}.ts`);
  if (!existsSync(file)) {
    console.error(`✗ ${file} 이 없습니다`);
    process.exit(1);
  }
  const p = ((await import(pathToFileURL(file).href)) as { default: AlgoPattern }).default;
  p.implementations.forEach((im, i) => {
    console.log(`\n=== #${i + 1} ${im.title} ===`);
    im.keyPoints.forEach((k, j) => console.log(`  [${j + 1}] ${k.title}`));
    for (const lang of langs.length ? langs : ALL) {
      console.log(`\n--- ${lang} ---`);
      const lines = im.code[lang].replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
      lines.forEach((text, n) => {
        const marks = im.keyPoints.flatMap((k, j) => (k.lines[lang]?.includes(n + 1) ? [j + 1] : []));
        if (onlyLines && !marks.length) return;
        const tag = marks.length ? `[${marks.join(',')}]` : '';
        console.log(`${tag.padStart(7)} ${String(n + 1).padStart(3)} | ${text}`);
      });
    }
  });
}

void main();
