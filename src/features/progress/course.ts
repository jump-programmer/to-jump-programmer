/**
 * 개발자 코스(백엔드 · 프론트엔드 · 풀스택)에 맞는 콘텐츠 범위.
 * React Native 를 가져오지 않으므로 Node 테스트(scripts/test-core.ts)에서도 쓴다.
 */
import {
  CS_CATEGORIES,
  CS_CONTENT,
  FRAMEWORK_LANGUAGE_CATEGORIES,
  QUESTION_MAP,
  QUESTION_SOURCE,
  REVIEW_FRAMEWORKS,
  SOLVE_LANGUAGE_IDS,
  trackSides,
  type BackendFrameworkId,
  type CsCategory,
  type DevTrack,
  type FrameworkId,
  type FrontendFrameworkId,
  type ReviewFramework,
  type SolveLanguage,
  type TrackSide,
} from '@/content';

/** 프로필 중 코스와 관련된 부분 */
export interface Course {
  track: DevTrack;
  framework: BackendFrameworkId;
  frontendFramework: FrontendFrameworkId;
}

/** 코스 설정이 바뀌었는지 비교하는 키 (오늘의 플랜을 다시 만들지 판단) */
export const courseKey = (c: Course) => `${c.track}:${c.framework}:${c.frontendFramework}`;

export const sideFramework = (c: Course, side: TrackSide): FrameworkId =>
  side === 'backend' ? c.framework : c.frontendFramework;

/** 코스에서 고른 프레임워크 (풀스택은 백엔드 · 프론트엔드 하나씩) */
export function courseFrameworks(c: Course): FrameworkId[] {
  return trackSides(c.track).map((side) => sideFramework(c, side));
}

/** 코스 쪽의 코드 리뷰 프레임워크 목록 */
export function reviewFrameworksFor(side: TrackSide): ReviewFramework[] {
  return REVIEW_FRAMEWORKS.filter((f) => f.track === side);
}

/** 코스에서 먼저 보여줄 CS 카테고리인지 — 공통이거나 코스 쪽 카테고리 (나머지는 면접 CS 탭 아래쪽 '다른 코스') */
export function isCategoryInTrack(cat: CsCategory, track: DevTrack): boolean {
  return !cat.track || trackSides(track).includes(cat.track);
}

/**
 * 오늘의 퀴즈 · 면접 질문에 내는 CS 카테고리.
 * 코스 범위 중 언어 카테고리는 고른 프레임워크의 언어만, 프레임워크 카테고리는 고른 프레임워크만 낸다.
 */
export function csCategoriesForCourse(c: Course): CsCategory[] {
  const frameworks = courseFrameworks(c);
  const languages = new Set(frameworks.flatMap((f) => FRAMEWORK_LANGUAGE_CATEGORIES[f]));
  return CS_CATEGORIES.filter((cat) => {
    if (cat.group === 'language') return languages.has(cat.id);
    if (cat.framework) return frameworks.includes(cat.framework);
    return isCategoryInTrack(cat, c.track);
  });
}

/**
 * 오늘의 퀴즈 CS 후보를 묶음으로 나눈다. 풀스택은 백엔드 · 프론트엔드 · 공통 묶음을 번갈아 골라
 * 한쪽으로 쏠리지 않게 하고, 나머지 코스는 묶음 하나다.
 */
export function csQuestionGroupsForCourse(c: Course): string[][] {
  const ids = (cats: CsCategory[]) => cats.flatMap((cat) => (CS_CONTENT[cat.id]?.quiz ?? []).map((q) => q.id));
  const cats = csCategoriesForCourse(c);
  if (c.track !== 'fullstack') return [ids(cats)];
  return [
    ids(cats.filter((cat) => cat.track === 'backend')),
    ids(cats.filter((cat) => cat.track === 'frontend')),
    ids(cats.filter((cat) => !cat.track)),
  ].filter((g) => g.length > 0);
}

/** 코스 범위의 문제인지 (알고리즘 문제는 모든 코스 공통) */
export function isQuestionForCourse(id: string, c: Course, categoryIds = courseCategoryIds(c)): boolean {
  const q = QUESTION_MAP[id];
  if (!q) return false;
  if (QUESTION_SOURCE[id] !== 'cs') return true;
  return categoryIds.has(q.categoryId);
}

export const courseCategoryIds = (c: Course) => new Set(csCategoriesForCourse(c).map((cat) => cat.id));

/** 오늘의 면접 질문 후보 카테고리. 풀스택은 그날 볼 쪽(side)과 공통 카테고리만 */
export function cardCategoriesForCourse(c: Course, side?: TrackSide): CsCategory[] {
  const cats = csCategoriesForCourse(c);
  if (c.track !== 'fullstack' || !side) return cats;
  return cats.filter((cat) => !cat.track || cat.track === side);
}

/** 날짜마다 번갈아 보는 쪽 — 풀스택의 오늘의 추천이 한쪽으로 쏠리지 않게 (offset 으로 리뷰 · 면접 질문을 서로 엇갈리게) */
export function sideOfDay(track: DevTrack, date: Date, offset = 0): TrackSide {
  if (track !== 'fullstack') return track;
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return (day + offset) % 2 === 0 ? 'backend' : 'frontend';
}

/** 코스에 맞춘 코딩 테스트 언어 순서 — 프론트엔드는 JavaScript 를 먼저 */
export function solveLanguagesFor(track: DevTrack): SolveLanguage[] {
  if (track !== 'frontend') return SOLVE_LANGUAGE_IDS;
  return ['javascript', ...SOLVE_LANGUAGE_IDS.filter((l) => l !== 'javascript')];
}
