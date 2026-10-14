/**
 * 순수 로직 테스트 (외부 도구 불필요)
 *   npm test
 */
import assert from 'node:assert/strict';

import {
  ALL_LESSONS,
  CS_CATEGORIES,
  CS_CATEGORY_MAP,
  FRAMEWORK_LANGUAGE_CATEGORIES,
  LESSON_QUESTION_IDS,
  QUESTION_MAP,
  QUESTION_SOURCE,
} from '../src/content';
import { backupFileName, createBackup, describeBackup, parseBackup } from '../src/features/progress/backup';
import {
  csCategoriesForCourse,
  csQuestionGroupsForCourse,
  isCategoryInTrack,
  isQuestionForCourse,
  sideOfDay,
  solveLanguagesFor,
  type Course,
} from '../src/features/progress/course';
import { composeDailyQuiz, dailyQuizQuota, type DailyQuizInput } from '../src/features/progress/daily-quiz';
import {
  categoryLessons,
  isLessonUnderstood,
  lessonStatus,
  nextLessonCandidates,
  pickLessonCheck,
  type LessonRecord,
} from '../src/features/progress/lessons';
import { migrateProgress } from '../src/features/progress/migrate';
import type { ProgressData } from '../src/features/progress/store';
import { computeBestStreak, computeStreak, dayKey, seededRandom } from '../src/lib/date';
import { diffLines, diffStats } from '../src/lib/diff';
import { highlightLines } from '../src/lib/highlight';
import { resultsMatch } from './lib/harness/compare';
import { parseHarnessOutput } from './lib/harness/protocol';
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

console.log('highlight');
test('키워드 · 문자열 · 주석 · 여러 줄 토큰', () => {
  const lines = highlightLines('def f():\n    """doc\n    string"""\n    return "x"  # c', 'python');
  assert.equal(lines.length, 4);
  assert.equal(lines[0][0].kind, 'keyword');
  assert.ok(lines[2].some((t) => t.kind === 'string'));
  assert.ok(lines[3].some((t) => t.kind === 'comment'));
});

test('JSX · Vue 템플릿 · CSS 속성', () => {
  const kinds = (code: string, lang: string) => highlightLines(code, lang).flat().filter((t) => t.kind !== 'plain');
  const tsx = kinds('const a = useState<number>(0);\nreturn <Item key={id} className="x" />;', 'tsx');
  assert.ok(tsx.some((t) => t.kind === 'type' && t.text === 'Item'));
  assert.ok(tsx.some((t) => t.kind === 'annotation' && t.text === 'className'));
  assert.ok(!tsx.some((t) => t.kind === 'keyword' && t.text === 'number')); // 제네릭은 태그가 아니다
  const vue = kinds('<script setup lang="ts">\nconst n = ref(0);\n</script>\n<template>\n  <p v-if="ok" @click="n++">{{ n }}</p>\n</template>\n<style>\n.a { color: red; }\n</style>', 'vue');
  assert.ok(vue.some((t) => t.kind === 'keyword' && t.text === 'const'));
  assert.ok(vue.some((t) => t.kind === 'annotation' && t.text === 'v-if'));
  assert.ok(vue.some((t) => t.kind === 'annotation' && t.text === '@click'));
  assert.ok(vue.some((t) => t.kind === 'type' && t.text === 'color'));
  assert.ok(kinds('name: app', 'yaml').some((t) => t.kind === 'type' && t.text === 'name'));
});

console.log('backup');
test('학습 기록 백업 만들기 · 읽기', () => {
  const progress: ProgressData = {
    profile: {
      nickname: '점프',
      goal: 'new',
      language: 'kotlin',
      track: 'fullstack',
      framework: 'spring',
      frontendFramework: 'vue',
      dailyGoal: 10,
      onboarded: true,
    },
    settings: { theme: 'dark', haptics: true, reviewLanguage: { spring: 'kotlin' } },
    quiz: { q1: { attempts: 2, correct: 1, last: true, lastAt: 1 } },
    cards: {},
    problems: { p1: { solved: true, language: 'kotlin', bestPassed: 3, total: 3, submissions: 1, lastAt: 1 } },
    patterns: {},
    challenges: {},
    algoPatterns: { 'binary-search-lower-bound': 1 },
    lessons: { 'cs-os-l01': { startedAt: 1, readAt: 2, completedAt: 3, correct: 2, total: 3, lastAt: 3 } },
    bookmarks: {},
    activity: { '2026-10-09': 3, '2026-10-10': 1 },
    daily: null,
  } as ProgressData;
  const now = new Date(2026, 9, 10, 9, 0);
  const file = createBackup(progress, now);
  const parsed = parseBackup(JSON.stringify(file));
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.backup.progress, progress);
  assert.equal(parsed.backup.drafts, undefined);
  // 이전 버전 백업(작성 중인 코드 포함)도 읽을 수 있다
  const old = { ...file, drafts: { drafts: { 'p1:kotlin': 'class Solution {}' }, lastLanguage: { p1: 'kotlin' } } };
  assert.ok(parseBackup(JSON.stringify(old)).ok);
  assert.equal(backupFileName(now), 'to-jump-backup-2026-10-10.json');
  assert.match(describeBackup(parsed.backup), /학습한 날 2일 · 퀴즈 1문항 · 알고리즘 유형 1개 · CS 이론 1개/);
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
  reject({ ...ok, progress: { ...ok.progress, algoPatterns: 'x' } });
  reject({ ...ok, progress: { ...ok.progress, daily: 'x' } });
  reject({ ...ok, drafts: { drafts: { a: 1 }, lastLanguage: {} } });
});

console.log('daily quiz');
const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`);
const compose = (input: Partial<DailyQuizInput> & { goal: number }) =>
  composeDailyQuiz({ wrong: [], cs: [ids('c', 40)], algo: ids('a', 40), seen: () => false, random: seededRandom(7), ...input });
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
  const quiz = compose({ goal: 10, cs: [ids('c', 2)] });
  assert.equal(quiz.length, 10);
  assert.equal(quiz.filter((id) => id.startsWith('c')).length, 2);
  // 틀린 문제가 없으면 그 몫도 새 문제로
  assert.equal(compose({ goal: 20 }).length, 20);
  // 안 본 문제를 다 쓰면 이미 푼 문제로 채움
  const seenAll = compose({ goal: 10, cs: [ids('c', 3)], algo: ids('a', 3), seen: (id) => id.endsWith('0') });
  assert.equal(seenAll.length, 6);
  assert.ok(seenAll.slice(-2).every((id) => id.endsWith('0')));
  assert.equal(compose({ goal: 30, cs: [ids('c', 4)], algo: ids('a', 3) }).length, 7);
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
test('풀스택은 CS 후보 묶음을 번갈아 골라 한쪽으로 쏠리지 않음', () => {
  for (const seed of [1, 2, 3, 4]) {
    const quiz = composeDailyQuiz({
      goal: 20,
      wrong: ids('w', 5),
      cs: [ids('b', 30), ids('f', 30), ids('x', 30)],
      algo: ids('a', 30),
      seen: (id) => id.startsWith('w'),
      random: seededRandom(seed),
    });
    const count = (p: string) => quiz.filter((id) => id.startsWith(p)).length;
    assert.equal(count('b') + count('f') + count('x'), 10);
    assert.ok(Math.max(count('b'), count('f'), count('x')) - Math.min(count('b'), count('f'), count('x')) <= 1);
  }
  // 한 묶음이 모자라면 다른 묶음에서 채운다 (CS 몫 5 + 틀린 문제가 없어 남는 2)
  const short = composeDailyQuiz({ goal: 10, wrong: [], cs: [ids('b', 1), ids('f', 30)], algo: ids('a', 30), seen: () => false, random: seededRandom(1) });
  assert.equal(short.filter((id) => id.startsWith('b')).length, 1);
  assert.equal(short.filter((id) => id.startsWith('f')).length, 6);
});

console.log('course');
const course = (track: Course['track'], framework: Course['framework'] = 'spring', frontendFramework: Course['frontendFramework'] = 'react'): Course => ({
  track,
  framework,
  frontendFramework,
});
const catIds = (c: Course) => csCategoriesForCourse(c).map((cat) => cat.id);
test('언어 · 프레임워크 매핑은 실제 카테고리만, 모든 언어 카테고리는 어느 프레임워크에선가 출제', () => {
  const languageIds = CS_CATEGORIES.filter((c) => c.group === 'language').map((c) => c.id);
  for (const list of Object.values(FRAMEWORK_LANGUAGE_CATEGORIES)) assert.ok(list.every((id) => languageIds.includes(id)));
  assert.deepEqual([...new Set(Object.values(FRAMEWORK_LANGUAGE_CATEGORIES).flat())].sort(), [...languageIds].sort());
  // 프레임워크 카테고리는 프레임워크와 연결되고, 그 프레임워크와 같은 코스
  for (const cat of CS_CATEGORIES.filter((c) => c.group === 'framework')) {
    assert.ok(cat.framework, `${cat.id}: framework 없음`);
  }
  assert.equal(CS_CATEGORY_MAP.react.track, 'frontend');
  assert.equal(CS_CATEGORY_MAP.spring.track, 'backend');
});
test('백엔드 코스: 고른 프레임워크 · 언어만, 프론트엔드 카테고리 제외', () => {
  const ids = catIds(course('backend', 'django'));
  assert.ok(ids.includes('python') && !ids.includes('java') && !ids.includes('javascript'));
  assert.ok(ids.includes('django') && !ids.includes('spring') && !ids.includes('react'));
  assert.ok(ids.includes('database') && ids.includes('os') && !ids.includes('browser'));
});
test('프론트엔드 코스: 프론트엔드 · 공통 카테고리, 백엔드 전용 제외', () => {
  const ids = catIds(course('frontend', 'spring', 'vue'));
  assert.ok(ids.includes('javascript') && ids.includes('vue') && ids.includes('browser') && ids.includes('network'));
  assert.ok(!ids.includes('java') && !ids.includes('spring') && !ids.includes('react') && !ids.includes('database'));
  assert.equal(isCategoryInTrack(CS_CATEGORY_MAP.infra, 'frontend'), false);
  assert.equal(isCategoryInTrack(CS_CATEGORY_MAP.security, 'frontend'), true);
});
test('풀스택 코스: 두 쪽에서 고른 프레임워크 하나씩, CS 후보는 백엔드 · 프론트엔드 · 공통 묶음', () => {
  const c = course('fullstack', 'spring', 'vue');
  const ids = catIds(c);
  assert.ok(ids.includes('java') && ids.includes('javascript') && ids.includes('spring') && ids.includes('vue'));
  assert.ok(!ids.includes('react') && !ids.includes('nestjs') && !ids.includes('python'));
  assert.ok(ids.includes('database') && ids.includes('browser'));
  const groups = csQuestionGroupsForCourse(c);
  assert.ok(groups.length >= 1 && groups.length <= 3);
  assert.equal(csQuestionGroupsForCourse(course('backend')).length, 1);
  const all = groups.flat();
  assert.ok(all.every((id) => isQuestionForCourse(id, c)));
  // 다른 코스의 문제와 알고리즘 문제
  const javaQ = Object.keys(QUESTION_MAP).find((id) => QUESTION_MAP[id].categoryId === 'java');
  if (javaQ) assert.equal(isQuestionForCourse(javaQ, course('frontend')), false);
  const algoQ = Object.keys(QUESTION_MAP).find((id) => QUESTION_SOURCE[id] === 'algo')!;
  assert.equal(isQuestionForCourse(algoQ, course('frontend')), true);
  assert.equal(isQuestionForCourse('없는-문제', c), false);
});
test('Spring 코스는 Java · Kotlin 언어 문제를 함께 출제', () => {
  const spring = course('backend', 'spring');
  assert.ok(catIds(spring).includes('java') && catIds(spring).includes('kotlin'));
  assert.ok(catIds(course('fullstack', 'spring', 'vue')).includes('kotlin'));
  assert.ok(!catIds(course('backend', 'nest')).includes('kotlin') && !catIds(course('frontend')).includes('kotlin'));
  const groups = csQuestionGroupsForCourse(spring);
  const firstOf = (cat: string) => groups.flat().find((id) => QUESTION_MAP[id].categoryId === cat);
  const javaQ = firstOf('java');
  const kotlinQ = firstOf('kotlin');
  assert.ok(javaQ && kotlinQ);
  // 안 푼 CS 문제가 Java · Kotlin 하나씩뿐이면 오늘의 퀴즈에 둘 다 나온다
  const quiz = composeDailyQuiz({ goal: 10, wrong: [], cs: groups, algo: [], seen: (id) => id !== javaQ && id !== kotlinQ, random: seededRandom(3) });
  assert.ok(quiz.includes(javaQ) && quiz.includes(kotlinQ));
});
test('AI Agent 카테고리는 모든 코스에서 출제', () => {
  for (const c of [course('backend', 'django'), course('frontend', 'spring', 'vue'), course('fullstack')]) {
    assert.ok(catIds(c).includes('ai-agent'));
  }
});
test('풀스택의 오늘의 추천은 날마다 백엔드 · 프론트엔드를 번갈아', () => {
  const d1 = new Date(2026, 9, 13);
  const d2 = new Date(2026, 9, 14);
  assert.notEqual(sideOfDay('fullstack', d1), sideOfDay('fullstack', d2));
  assert.notEqual(sideOfDay('fullstack', d1), sideOfDay('fullstack', d1, 1)); // 리뷰와 면접 질문은 엇갈리게
  assert.equal(sideOfDay('frontend', d1), 'frontend');
  assert.equal(sideOfDay('backend', d2, 1), 'backend');
});
test('코스별 코딩 테스트 언어 순서', () => {
  assert.equal(solveLanguagesFor('frontend')[0], 'javascript');
  assert.equal(solveLanguagesFor('frontend').length, 5);
  assert.equal(solveLanguagesFor('backend')[0], 'python');
});
test('이전 버전 학습 기록 옮기기 (v1 → 백엔드 코스, v2 → 레슨 기록)', () => {
  const old = { profile: { nickname: '점프', framework: 'django', language: 'java' }, quiz: { q1: { attempts: 1 } } };
  const migrated = migrateProgress(old, 1);
  assert.equal(migrated.profile?.track, 'backend');
  assert.equal(migrated.profile?.frontendFramework, 'react');
  assert.equal(migrated.profile?.framework, 'django');
  assert.deepEqual(migrated.quiz, old.quiz);
  assert.deepEqual(migrated.lessons, {}); // v3: 레슨 기록
  const v2 = { profile: { track: 'frontend', frontendFramework: 'vue' } };
  assert.deepEqual(migrateProgress(v2, 2), { ...v2, lessons: {} });
  const current = { ...v2, lessons: { 'cs-os-l01': { startedAt: 1, lastAt: 1 } } };
  assert.deepEqual(migrateProgress(current, 3), current);
});

console.log('lessons');
test('레슨 상태: 안 읽음 → 읽는 중 → 완료, 2/3 이상이면 이해함', () => {
  assert.equal(lessonStatus(undefined), 'new');
  assert.equal(lessonStatus({ startedAt: 1, lastAt: 1 }), 'reading');
  assert.equal(lessonStatus({ startedAt: 1, readAt: 2, lastAt: 2 }), 'reading');
  const done = (correct: number, total: number): LessonRecord => ({ startedAt: 1, completedAt: 3, correct, total, lastAt: 3 });
  assert.equal(lessonStatus(done(0, 3)), 'done');
  assert.equal(isLessonUnderstood(done(2, 3)), true);
  assert.equal(isLessonUnderstood(done(1, 3)), false);
  assert.equal(isLessonUnderstood(done(2, 2)), true);
  assert.equal(isLessonUnderstood({ startedAt: 1, lastAt: 1 }), false);
});
test('레슨마다 확인 퀴즈 3개 이상이 연결되고, 안 푼 문제를 먼저 3개 고름', () => {
  for (const l of ALL_LESSONS) assert.ok((LESSON_QUESTION_IDS[l.id]?.length ?? 0) >= 3, `${l.id}: 확인 퀴즈 부족`);
  const lesson = ALL_LESSONS.find((l) => (LESSON_QUESTION_IDS[l.id]?.length ?? 0) >= 4);
  if (!lesson) return;
  const ids = LESSON_QUESTION_IDS[lesson.id];
  const seen = new Set(ids.slice(0, ids.length - 3));
  const picked = pickLessonCheck(lesson.id, (id) => seen.has(id), seededRandom(3));
  assert.equal(picked.length, 3);
  assert.equal(new Set(picked).size, 3);
  assert.ok(picked.every((id) => !seen.has(id))); // 안 푼 문제가 3개 있으면 그것만
  assert.ok(picked.every((id) => QUESTION_MAP[id].lessonId === lesson.id));
});
test('오늘 읽을 레슨: 카테고리마다 다음 레슨, 읽다 만 레슨이 있으면 그것', () => {
  const cat = CS_CATEGORIES.find((c) => categoryLessons(c.id).length >= 2);
  if (!cat) return;
  const [first, second] = categoryLessons(cat.id);
  assert.equal(nextLessonCandidates([cat], {})[0].id, first.id);
  const records: Record<string, LessonRecord> = { [first.id]: { startedAt: 1, completedAt: 2, total: 3, correct: 3, lastAt: 2 } };
  assert.equal(nextLessonCandidates([cat], records)[0].id, second.id);
  const other = CS_CATEGORIES.find((c) => c.id !== cat.id && categoryLessons(c.id).length > 0);
  if (other) {
    const reading = { ...records, [second.id]: { startedAt: 3, lastAt: 3 } };
    assert.deepEqual(nextLessonCandidates([cat, other], reading).map((l) => l.id), [second.id]);
  }
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
