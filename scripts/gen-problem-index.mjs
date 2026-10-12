// 코딩 문제 · 알고리즘 유형 폴더의 index.ts 를 자동 생성한다. (파일 1개 = 문제/유형 1개)
//   node scripts/gen-problem-index.mjs              src/content/data/algorithm 의 problems, patterns
//   node scripts/gen-problem-index.mjs <algorithm 폴더>
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ident = (prefix, f) => prefix + f.replace(/\.ts$/, '').replace(/[^a-zA-Z0-9]/g, '_');

/** 폴더의 파일을 모아 index.ts 를 만든다. 위치와 관계없이 쓰이도록 타입은 별칭 경로로 가져온다. */
function writeIndex(dir, typeName, exportName, prefix) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .sort();
  const lines = [
    '// 자동 생성 파일입니다. 직접 수정하지 말고 `npm run content:index` 를 실행하세요.',
    `import type { ${typeName} } from '@/content/types';`,
    '',
    ...files.map((f) => `import ${ident(prefix, f)} from './${f.replace(/\.ts$/, '')}';`),
    '',
    `export const ${exportName}: ${typeName}[] = [`,
    ...files.map((f) => `  ${ident(prefix, f)},`),
    '];',
    '',
  ];
  const out = join(dir, 'index.ts');
  const next = lines.join('\n');
  let prev = '';
  try {
    prev = readFileSync(out, 'utf8');
  } catch {}
  if (prev !== next) writeFileSync(out, next);
  return files.length;
}

export const writeProblemIndex = (dir) => writeIndex(dir, 'AlgoProblem', 'PROBLEMS', 'p_');
export const writePatternIndex = (dir) => writeIndex(dir, 'AlgoPattern', 'PATTERNS', 'pt_');

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] ?? join(root, 'src', 'content', 'data', 'algorithm'));
  console.log(`problems/index.ts: ${writeProblemIndex(join(dir, 'problems'))}개 문제`);
  console.log(`patterns/index.ts: ${writePatternIndex(join(dir, 'patterns'))}개 유형`);
}
