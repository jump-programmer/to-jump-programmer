/**
 * CS 이론 레슨의 학습 상태와 확인 퀴즈 선택.
 * React Native 를 가져오지 않으므로 Node 테스트(scripts/test-core.ts)에서도 쓴다.
 */
import { CS_CONTENT, LESSON_QUESTION_IDS, type CsCategory, type CsLesson } from '@/content';
import { shuffle } from '@/lib/date';

export interface LessonRecord {
  /** 처음 연 시각 */
  startedAt: number;
  /** 끝까지 읽은 시각 */
  readAt?: number;
  /** 확인 퀴즈를 제출한 시각 — 이때 레슨을 완료로 본다 */
  completedAt?: number;
  /** 가장 최근 확인 퀴즈 결과 */
  correct?: number;
  total?: number;
  lastAt: number;
}

export type LessonStatus = 'new' | 'reading' | 'done';

/** 안 읽음 · 읽는 중 · 완료 (확인 퀴즈 제출) */
export function lessonStatus(rec: LessonRecord | undefined): LessonStatus {
  if (!rec) return 'new';
  return rec.completedAt ? 'done' : 'reading';
}

/** 확인 퀴즈를 3개 중 2개 이상(2/3 이상) 맞혔으면 '이해함' */
export function isLessonUnderstood(rec: LessonRecord | undefined): boolean {
  return !!rec?.completedAt && !!rec.total && (rec.correct ?? 0) * 3 >= rec.total * 2;
}

export const categoryLessons = (categoryId: string): CsLesson[] => CS_CONTENT[categoryId]?.lessons ?? [];

/** 확인 퀴즈 — 레슨에 연결된 문제 중 안 푼 문제를 먼저, 섞어서 count 개 */
export function pickLessonCheck(
  lessonId: string,
  seen: (id: string) => boolean,
  random: () => number = Math.random,
  count = 3,
): string[] {
  const ids = LESSON_QUESTION_IDS[lessonId] ?? [];
  return [...shuffle(ids.filter((id) => !seen(id)), random), ...shuffle(ids.filter(seen), random)].slice(0, count);
}

/**
 * 오늘 읽을 레슨 후보 — 카테고리마다 아직 완료하지 않은 첫 레슨(순서대로 읽도록).
 * 읽다 만 레슨이 있으면 그 레슨들만 후보로 한다.
 */
export function nextLessonCandidates(categories: CsCategory[], records: Record<string, LessonRecord>): CsLesson[] {
  const next = categories
    .map((cat) => categoryLessons(cat.id).find((l) => lessonStatus(records[l.id]) !== 'done'))
    .filter((l): l is CsLesson => !!l);
  const reading = next.filter((l) => lessonStatus(records[l.id]) === 'reading');
  return reading.length ? reading : next;
}
