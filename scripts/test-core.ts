/**
 * 순수 로직 테스트 (외부 도구 불필요)
 *   npm test
 */
import assert from 'node:assert/strict';

import { CS_CATEGORIES, CS_CONTENT, FRAMEWORK_LANGUAGE_CATEGORIES, QUESTION_MAP, QUESTION_SOURCE } from '../src/content';
import { backupFileName, createBackup, describeBackup, parseBackup } from '../src/features/progress/backup';
import {
  composeDailyQuiz,
  csQuestionIdsForFramework,
  dailyQuizQuota,
  isQuestionForFramework,
  type DailyQuizInput,
} from '../src/features/progress/daily-quiz';
import type { ProgressData } from '../src/features/progress/store';
import { resultsMatch } from '../src/features/runner/core/compare';
import { parseHarnessOutput } from '../src/features/runner/core/protocol';
import { signatureText, starterCode } from '../src/features/runner/core/languages';
import { computeBestStreak, computeStreak, dayKey, seededRandom } from '../src/lib/date';
import { diffLines, diffStats } from '../src/lib/diff';
import { highlightLines } from '../src/lib/highlight';
import { parseInline, parseMarkdown } from '../src/lib/markdown';

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}`);
    throw e;
  }
}

console.log('markdown');
test('인라인: 굵게와 코드, 코드 안의 ** 는 굵게가 아님', () => {
  assert.deepEqual(parseInline('**O(n)**이고 `a**b` 다'), [
    { text: 'O(n)', bold: true },
    { text: '이고 ' },
    { text: 'a**b', code: true },
    { text: ' 다' },
  ]);
});
test('블록: 제목 · 목록 · 팁 · 코드 · 표', () => {
  const blocks = parseMarkdown(
    '### 제목\n문단 1\n이어짐\n\n- a\n- b\n\n1. 하나\n2. 둘\n\n> 팁\n\n```python\nx = 1\n```\n\n| A | B |\n|---|---|\n| 1 | `x|y` |',
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    ['heading', 'paragraph', 'bullet', 'ordered', 'quote', 'code', 'table'],
  );
  const table = blocks[6] as Extract<(typeof blocks)[number], { type: 'table' }>;
  assert.equal(table.rows[0][1][0].text, 'x|y');
  const code = blocks[5] as Extract<(typeof blocks)[number], { type: 'code' }>;
  assert.equal(code.lang, 'python');
  assert.equal(code.code, 'x = 1');
});

console.log('diff');
test('줄 단위 diff', () => {
  const lines = diffLines('a\nb\nc', 'a\nB\nc\nd');
  assert.deepEqual(
    lines.map((l) => l.type),
    ['same', 'del', 'add', 'same', 'add'],
  );
  assert.deepEqual(diffStats(lines), { added: 2, removed: 1 });
});

console.log('compare');
test('exact / unordered / float', () => {
  assert.equal(resultsMatch([1, 2], [1, 2]), true);
  assert.equal(resultsMatch([1, 2], [2, 1]), false);
  assert.equal(resultsMatch([1, 2], [2, 1], 'unordered'), true);
  assert.equal(resultsMatch(0.1 + 0.2, 0.3, 'float'), true);
  assert.equal(resultsMatch(0.1 + 0.2, 0.3), false);
  assert.equal(resultsMatch([[1], [2]], [[1], [2]]), true);
  assert.equal(resultsMatch(true, 1), false);
});

console.log('protocol');
test('케이스별 출력 분리 · 비정상 종료 감지', () => {
  const out = '@@TJ:BEGIN:0\nhello\n\n@@TJ:END:0:OK:1.50:[1,2]\n@@TJ:BEGIN:1\nno newline@@TJ:END:1:ERR:0.10:"boom"\n@@TJ:BEGIN:2\npartial';
  const r = parseHarnessOutput(out);
  assert.equal(r.outputs.length, 2);
  assert.deepEqual(r.outputs[0], { index: 0, ok: true, value: [1, 2], stdout: 'hello\n', timeMs: 1.5 });
  assert.equal(r.outputs[1].ok, false);
  assert.equal(r.outputs[1].stdout, 'no newline');
  assert.equal(r.crashedIndex, 2);
  assert.equal(r.crashedStdout, 'partial');
});

console.log('starter code');
test('언어별 시작 코드', () => {
  const sig = { params: [{ name: 'nums', type: 'int[]' as const }, { name: 'k', type: 'int' as const }], returns: 'string[]' as const };
  assert.match(starterCode('python', sig), /^def solution\(nums, k\):/);
  assert.match(starterCode('java', sig), /public String\[\] solution\(int\[\] nums, int k\)/);
  assert.match(starterCode('kotlin', sig), /^class Solution \{\n {4}fun solution\(nums: IntArray, k: Int\): Array<String> \{/);
  assert.match(starterCode('kotlin', sig), /var answer: Array<String> = arrayOf<String>\(\)/);
  assert.equal(signatureText('kotlin', sig), 'fun solution(nums: IntArray, k: Int): Array<String>');
  assert.match(starterCode('cpp', sig), /vector<string> solution\(vector<int> nums, int k\)/);
  assert.match(starterCode('javascript', sig), /^function solution\(nums, k\)/);
});

console.log('highlight');
test('키워드 · 문자열 · 주석 · 여러 줄 토큰', () => {
  const lines = highlightLines('def f():\n    """doc\n    string"""\n    return "x"  # c', 'python');
  assert.equal(lines.length, 4);
  assert.equal(lines[0][0].kind, 'keyword');
  assert.ok(lines[2].some((t) => t.kind === 'string'));
  assert.ok(lines[3].some((t) => t.kind === 'comment'));
});

console.log('backup');
test('학습 기록 백업 만들기 · 읽기', () => {
  const progress: ProgressData = {
    profile: { nickname: '점프', goal: 'new', language: 'kotlin', framework: 'spring', dailyGoal: 10, onboarded: true },
    settings: { theme: 'dark', runnerUrl: '', editorFontSize: 15, haptics: true, reviewLanguage: { spring: 'kotlin' } },
    quiz: { q1: { attempts: 2, correct: 1, last: true, lastAt: 1 } },
    cards: {},
    problems: { p1: { solved: true, language: 'kotlin', bestPassed: 3, total: 3, submissions: 1, lastAt: 1 } },
    patterns: {},
    challenges: {},
    bookmarks: {},
    activity: { '2026-10-09': 3, '2026-10-10': 1 },
    daily: null,
  } as ProgressData;
  const now = new Date(2026, 9, 10, 9, 0);
  const file = createBackup(progress, { drafts: { 'p1:kotlin': 'class Solution {}' }, lastLanguage: { p1: 'kotlin' } }, now);
  const parsed = parseBackup(JSON.stringify(file));
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.backup.progress, progress);
  assert.equal(parsed.backup.drafts?.drafts['p1:kotlin'], 'class Solution {}');
  assert.equal(backupFileName(now), 'to-jump-backup-2026-10-10.json');
  assert.match(describeBackup(parsed.backup), /학습한 날 2일 · 퀴즈 1문항 · 코딩 문제 1개/);
});
test('잘못된 백업 파일은 거절', () => {
  const ok = { app: 'to-jump-programmer', format: 1, exportedAt: '', progress: { profile: {}, settings: {} } };
  const reject = (v: unknown) => assert.equal(parseBackup(typeof v === 'string' ? v : JSON.stringify(v)).ok, false);
  assert.equal(parseBackup(JSON.stringify(ok)).ok, true);
  reject('not json');
  reject({ ...ok, app: 'other-app' });
  reject({ ...ok, format: 99 });
  reject({ ...ok, progress: { settings: {} } });
  reject({ ...ok, progress: { ...ok.progress, quiz: [] } });
  reject({ ...ok, progress: { ...ok.progress, daily: 'x' } });
  reject({ ...ok, drafts: { drafts: { a: 1 }, lastLanguage: {} } });
});

console.log('daily quiz');
const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`);
const compose = (input: Partial<DailyQuizInput> & { goal: number }) =>
  composeDailyQuiz({ wrong: [], cs: ids('c', 40), algo: ids('a', 40), seen: () => false, random: seededRandom(7), ...input });
test('하루 목표를 틀린 문제 : CS : 알고리즘 = 2 : 4 : 2 로 나눔', () => {
  assert.deepEqual(dailyQuizQuota(5), { wrong: 1, cs: 3, algo: 1 });
  assert.deepEqual(dailyQuizQuota(8), { wrong: 2, cs: 4, algo: 2 }); // 예전 고정 구성
  assert.deepEqual(dailyQuizQuota(10), { wrong: 2, cs: 5, algo: 3 });
  assert.deepEqual(dailyQuizQuota(20), { wrong: 5, cs: 10, algo: 5 });
  assert.deepEqual(dailyQuizQuota(30), { wrong: 7, cs: 15, algo: 8 });
});
test('목표 5 · 10 · 20 · 30 만큼 출제, 영역별 몫 · 틀린 문제 먼저', () => {
  const wrong = ['c39', 'a39', 'c38', 'a38', 'c37', 'a37', 'c36', 'a36'];
  const seen = (id: string) => wrong.includes(id);
  for (const goal of [5, 10, 20, 30]) {
    const quota = dailyQuizQuota(goal);
    const quiz = compose({ goal, wrong, seen });
    assert.equal(quiz.length, goal);
    assert.equal(new Set(quiz).size, goal);
    assert.deepEqual(quiz.slice(0, quota.wrong), wrong.slice(0, quota.wrong));
    const fresh = quiz.slice(quota.wrong);
    assert.equal(fresh.filter((id) => id.startsWith('c')).length, quota.cs);
    assert.equal(fresh.filter((id) => id.startsWith('a')).length, quota.algo);
    assert.ok(fresh.every((id) => !seen(id))); // 안 본 문제가 충분하면 본 문제는 다시 안 냄
  }
  assert.deepEqual(compose({ goal: 10, wrong, seen }), compose({ goal: 10, wrong, seen })); // 같은 날 · 같은 시드면 같은 구성
});
test('후보가 모자라면 다른 영역에서 채우고, 전체보다 많으면 있는 만큼만', () => {
  const quiz = compose({ goal: 10, cs: ids('c', 2) });
  assert.equal(quiz.length, 10);
  assert.equal(quiz.filter((id) => id.startsWith('c')).length, 2);
  // 틀린 문제가 없으면 그 몫도 새 문제로
  assert.equal(compose({ goal: 20 }).length, 20);
  // 안 본 문제를 다 쓰면 이미 푼 문제로 채움
  const seenAll = compose({ goal: 10, cs: ids('c', 3), algo: ids('a', 3), seen: (id) => id.endsWith('0') });
  assert.equal(seenAll.length, 6);
  assert.ok(seenAll.slice(-2).every((id) => id.endsWith('0')));
  assert.equal(compose({ goal: 30, cs: ids('c', 4), algo: ids('a', 3) }).length, 7);
  assert.deepEqual(compose({ goal: 10, cs: [], algo: [] }), []);
});
test('목표를 바꿔도 오늘 이미 푼 문제는 남김', () => {
  const keep = ['c1', 'a1', 'c2'];
  const wrong = ['c39', 'a39', 'c38', 'a38', 'c37'];
  const quiz = compose({ goal: 20, keep, wrong, seen: (id) => keep.includes(id) || wrong.includes(id) });
  assert.equal(quiz.length, 20);
  assert.deepEqual(quiz.slice(0, 3), keep);
  assert.deepEqual(quiz.slice(3, 8), wrong);
  // 남긴 문제도 영역 몫(CS 10 · 알고리즘 5)에 포함
  assert.equal(quiz.slice(8).filter((id) => id.startsWith('c')).length, 8);
  assert.equal(quiz.slice(8).filter((id) => id.startsWith('a')).length, 4);
  // 목표를 줄이면 앞에서부터 목표 수만큼
  assert.deepEqual(compose({ goal: 5, keep: ids('c', 8) }), ids('c', 5));
});
test('언어 CS 문제는 관심 프레임워크의 언어만, 다른 카테고리는 그대로', () => {
  const languageIds = CS_CATEGORIES.filter((c) => c.group === 'language').map((c) => c.id);
  // 매핑에는 실제 언어 카테고리만, 모든 언어 카테고리는 어느 프레임워크에선가 출제
  for (const list of Object.values(FRAMEWORK_LANGUAGE_CATEGORIES)) assert.ok(list.every((id) => languageIds.includes(id)));
  assert.deepEqual([...new Set(Object.values(FRAMEWORK_LANGUAGE_CATEGORIES).flat())].sort(), [...languageIds].sort());
  assert.deepEqual(FRAMEWORK_LANGUAGE_CATEGORIES.django, ['python']);
  assert.deepEqual(FRAMEWORK_LANGUAGE_CATEGORIES.nest, ['javascript']);
  assert.ok(FRAMEWORK_LANGUAGE_CATEGORIES.spring.includes('java'));

  const otherIds = CS_CATEGORIES.filter((c) => c.group !== 'language').flatMap((c) => CS_CONTENT[c.id]?.quiz.map((q) => q.id) ?? []);
  assert.ok(otherIds.length > 0);
  for (const fw of ['spring', 'nest', 'django'] as const) {
    const cs = csQuestionIdsForFramework(fw);
    const allowed = FRAMEWORK_LANGUAGE_CATEGORIES[fw];
    const categories = new Set(cs.map((id) => QUESTION_MAP[id].categoryId));
    assert.ok(otherIds.every((id) => cs.includes(id)), `${fw}: 비언어 카테고리 문제가 빠짐`);
    for (const lang of languageIds) {
      const hasQuiz = (CS_CONTENT[lang]?.quiz.length ?? 0) > 0;
      assert.equal(categories.has(lang), allowed.includes(lang) && hasQuiz, `${fw} · ${lang}`);
    }
    assert.ok(cs.every((id) => isQuestionForFramework(id, fw)));
    const java = CS_CONTENT.java.quiz[0]?.id;
    if (java) assert.equal(isQuestionForFramework(java, fw), fw === 'spring');
  }
  assert.equal(isQuestionForFramework(Object.keys(QUESTION_MAP).find((id) => QUESTION_SOURCE[id] === 'algo')!, 'django'), true);
  assert.equal(isQuestionForFramework('없는-문제', 'spring'), false);
});

console.log('date');
test('연속 학습일', () => {
  const today = new Date(2026, 9, 9);
  const k = (d: number) => dayKey(new Date(2026, 9, d));
  assert.equal(computeStreak({ [k(9)]: 1, [k(8)]: 2, [k(7)]: 1, [k(5)]: 1 }, today), 3);
  assert.equal(computeStreak({ [k(8)]: 1, [k(7)]: 1 }, today), 2); // 오늘 아직 안 했으면 어제부터
  assert.equal(computeStreak({ [k(6)]: 1 }, today), 0);
  assert.equal(computeBestStreak({ [k(1)]: 1, [k(2)]: 1, [k(3)]: 1, [k(7)]: 1 }), 3);
});

console.log(`\n✅ ${passed}개 테스트 통과`);
