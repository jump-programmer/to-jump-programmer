import {
  ALGO_PATTERN_MAP,
  ALGO_PATTERNS,
  ALGO_QUIZ,
  ALGO_TOPICS,
  ALL_ALGO_PATTERNS,
  CARD_MAP,
  CS_CATEGORIES,
  CS_CONTENT,
  LESSON_MAP,
  ALL_LESSONS,
  QUESTION_MAP,
  REVIEW_CONTENT,
  REVIEW_FRAMEWORKS,
  trackSides,
} from '@/content';
import { dayKey, hashString, seededRandom } from '@/lib/date';

import {
  cardCategoriesForCourse,
  courseKey,
  csCategoriesForCourse,
  csQuestionGroupsForCourse,
  isQuestionForCourse,
  questionScope,
  sideFramework,
  sideOfDay,
} from './course';
import { composeDailyQuiz } from './daily-quiz';
import { lessonStatus, nextLessonCandidates } from './lessons';
import { useProgress, type DailyPlanRecord, type ProgressState, type QuizRecord } from './store';

export interface QuizSetStats {
  total: number;
  attempted: number;
  /** 가장 최근 풀이가 정답인 문제 수 */
  correct: number;
  /** attempted 대비 정답 비율 (0~1) */
  accuracy: number;
  /** total 대비 푼 비율 (0~1) */
  progress: number;
}

export function quizSetStats(ids: string[], quiz: Record<string, QuizRecord>): QuizSetStats {
  let attempted = 0;
  let correct = 0;
  for (const id of ids) {
    const r = quiz[id];
    if (!r) continue;
    attempted++;
    if (r.last) correct++;
  }
  return {
    total: ids.length,
    attempted,
    correct,
    accuracy: attempted ? correct / attempted : 0,
    progress: ids.length ? attempted / ids.length : 0,
  };
}

export const algoTopicQuestionIds = (topicId: string) => (ALGO_QUIZ[topicId]?.questions ?? []).map((q) => q.id);
export const csCategoryQuestionIds = (categoryId: string) => (CS_CONTENT[categoryId]?.quiz ?? []).map((q) => q.id);
export const csCategoryCardIds = (categoryId: string) => (CS_CONTENT[categoryId]?.cards ?? []).map((c) => c.id);
export const algoTopicPatternIds = (topicId: string) => (ALGO_PATTERNS[topicId] ?? []).map((p) => p.id);

export const ALL_ALGO_QUESTION_IDS = ALGO_TOPICS.flatMap((t) => algoTopicQuestionIds(t.id));
export const ALL_CS_QUESTION_IDS = CS_CATEGORIES.flatMap((c) => csCategoryQuestionIds(c.id));

/** 가장 최근에 틀린 문제 (오답노트) — 최근에 틀린 순 */
export function wrongQuestionIds(quiz: Record<string, QuizRecord>, filter?: (id: string) => boolean): string[] {
  return Object.entries(quiz)
    .filter(([id, r]) => !r.last && QUESTION_MAP[id] && (!filter || filter(id)))
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .map(([id]) => id);
}

export function againCardIds(state: Pick<ProgressState, 'cards'>): string[] {
  return Object.entries(state.cards)
    .filter(([id, r]) => r.rating !== 'good' && CARD_MAP[id])
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .map(([id]) => id);
}

export interface TrackSummary {
  algo: { quiz: QuizSetStats; patternsRead: number; patterns: number };
  review: { patternsRead: number; patterns: number; challengesDone: number; challenges: number };
  cs: { quiz: QuizSetStats; cardsReviewed: number; cards: number; lessonsDone: number; lessons: number };
}

/** 학습 트랙 요약 — 코드 리뷰는 코스(백엔드 · 프론트엔드 · 풀스택) 범위, CS 는 오늘의 퀴즈와 같은 범위(고른 언어 · 프레임워크)만 센다 */
export function trackSummary(state: ProgressState): TrackSummary {
  const sides = trackSides(state.profile.track);
  const reviews = REVIEW_FRAMEWORKS.filter((f) => sides.includes(f.track)).map((f) => REVIEW_CONTENT[f.id]);
  const patternIds = reviews.flatMap((r) => r.patterns.map((p) => p.id));
  const challengeIds = reviews.flatMap((r) => r.challenges.map((ch) => ch.id));
  const cats = csCategoriesForCourse(state.profile);
  const cardIds = cats.flatMap((cat) => csCategoryCardIds(cat.id));
  const lessonIds = cats.flatMap((cat) => (CS_CONTENT[cat.id]?.lessons ?? []).map((l) => l.id));
  return {
    algo: {
      quiz: quizSetStats(ALL_ALGO_QUESTION_IDS, state.quiz),
      patternsRead: ALL_ALGO_PATTERNS.filter((p) => state.algoPatterns[p.id]).length,
      patterns: ALL_ALGO_PATTERNS.length,
    },
    review: {
      patternsRead: patternIds.filter((id) => state.patterns[id]).length,
      patterns: patternIds.length,
      challengesDone: challengeIds.filter((id) => state.challenges[id]).length,
      challenges: challengeIds.length,
    },
    cs: {
      quiz: quizSetStats(
        cats.flatMap((cat) => csCategoryQuestionIds(cat.id)),
        state.quiz,
      ),
      cardsReviewed: cardIds.filter((id) => state.cards[id]).length,
      cards: cardIds.length,
      lessonsDone: lessonIds.filter((id) => lessonStatus(state.lessons[id]) === 'done').length,
      lessons: lessonIds.length,
    },
  };
}

/** 0~1 사이 트랙 진행률 */
export function trackProgress(s: TrackSummary) {
  const ratio = (a: number, b: number) => (b ? a / b : 0);
  return {
    algo: (s.algo.quiz.progress + ratio(s.algo.patternsRead, s.algo.patterns)) / 2,
    review: (ratio(s.review.patternsRead, s.review.patterns) + ratio(s.review.challengesDone, s.review.challenges)) / 2,
    cs: s.cs.lessons
      ? (s.cs.quiz.progress + ratio(s.cs.cardsReviewed, s.cs.cards) + ratio(s.cs.lessonsDone, s.cs.lessons)) / 3
      : (s.cs.quiz.progress + ratio(s.cs.cardsReviewed, s.cs.cards)) / 2,
  };
}

/* ------------------------------------------------------------------ */
/* 오늘의 학습 (날짜 기반 결정적 추천)                                  */
/* ------------------------------------------------------------------ */

export type DailyPlan = DailyPlanRecord;

const answeredOn = (quiz: Record<string, QuizRecord>, id: string, key: string) =>
  !!quiz[id] && dayKey(new Date(quiz[id].lastAt)) === key;

/** 오늘의 퀴즈 — 하루 목표만큼, 코스 · 언어에 맞는 문제만(`isQuestionForCourse`). keep 은 그대로 남길 문제 (오늘 이미 푼 문제) */
export function dailyQuestionIds(state: ProgressState, date: Date = new Date(), keep: string[] = []): string[] {
  const scope = questionScope(state.profile);
  const inScope = (id: string) => isQuestionForCourse(id, state.profile, scope);
  return composeDailyQuiz({
    goal: state.profile.dailyGoal,
    wrong: wrongQuestionIds(state.quiz, inScope),
    cs: csQuestionGroupsForCourse(state.profile),
    algo: ALL_ALGO_QUESTION_IDS.filter(inScope),
    seen: (id) => !!state.quiz[id],
    random: seededRandom(hashString(`${dayKey(date)}:${state.profile.nickname}:quiz`)),
    keep: keep.filter(inScope),
  });
}

export function dailyPlan(state: ProgressState, date: Date = new Date()): DailyPlan {
  return {
    key: dayKey(date),
    questionIds: dailyQuestionIds(state, date),
    goal: state.profile.dailyGoal,
    course: courseKey(state.profile),
    algoPatternId: pickAlgoPattern(state, date),
    lessonId: pickLesson(state, date),
    cardId: pickCard(state, date),
    review: pickReview(state, date),
  };
}

/** 오늘 읽을 CS 이론 — 코스 범위에서 카테고리마다 아직 완료하지 않은 첫 레슨 (읽다 만 레슨이 있으면 그것부터) */
export function pickLesson(state: ProgressState, date: Date = new Date()): string | undefined {
  const random = seededRandom(hashString(`${dayKey(date)}:${state.profile.nickname}:lesson`));
  const side = sideOfDay(state.profile.track, date);
  const pool = nextLessonCandidates(cardCategoriesForCourse(state.profile, side), state.lessons);
  return pool.length ? pool[Math.floor(random() * pool.length)].id : undefined;
}

/** 오늘의 면접 질문 — 코스 범위에서 아직 안 본 카드 (풀스택은 리뷰와 엇갈리게 날마다 백엔드 · 프론트엔드를 번갈아) */
export function pickCard(state: ProgressState, date: Date = new Date()): string | undefined {
  const random = seededRandom(hashString(`${dayKey(date)}:${state.profile.nickname}`));
  const side = sideOfDay(state.profile.track, date, 1);
  const all = cardCategoriesForCourse(state.profile, side).flatMap((cat) => csCategoryCardIds(cat.id));
  const unseen = all.filter((id) => !state.cards[id]);
  const pool = unseen.length ? unseen : all;
  return pool.length ? pool[Math.floor(random() * pool.length)] : undefined;
}

/** 오늘 공부할 알고리즘 유형 — 아직 안 본 유형 중 목표(신입: 기초~중급, 경력: 중급~심화)에 맞는 것 */
export function pickAlgoPattern(state: ProgressState, date: Date = new Date()): string | undefined {
  const random = seededRandom(hashString(`${dayKey(date)}:${state.profile.nickname}:pattern`));
  const level = state.profile.goal === 'career' ? 2 : 1;
  const unread = ALL_ALGO_PATTERNS.filter((p) => !state.algoPatterns[p.id]);
  const fit = unread.filter((p) => p.difficulty >= level && p.difficulty <= level + 1);
  const pool = fit.length ? fit : unread.length ? unread : ALL_ALGO_PATTERNS;
  return pool.length ? pool[Math.floor(random() * pool.length)].id : undefined;
}

/** 오늘 날짜이고 추천한 유형 · 카드가 아직 있는 플랜 */
function todayPlan(daily: DailyPlan | null, key: string): DailyPlan | null {
  if (!daily || daily.key !== key) return null;
  if (daily.algoPatternId && !ALGO_PATTERN_MAP[daily.algoPatternId]) return null;
  if (daily.lessonId && !LESSON_MAP[daily.lessonId]) return null;
  if (daily.cardId && !CARD_MAP[daily.cardId]) return null;
  return daily;
}

/** 나중에 생긴 추천 항목(알고리즘 유형 · CS 이론)이 빠진 플랜 (그 기능이 생기기 전에 만든 오늘의 플랜) */
const missingParts = (plan: DailyPlan) =>
  (!plan.algoPatternId && ALL_ALGO_PATTERNS.length > 0) || (!plan.lessonId && ALL_LESSONS.length > 0);

/**
 * 퀴즈가 지금의 하루 목표 · 코스로 만든 것인지.
 * 문제마다 지금의 범위도 확인한다 — 범위 규칙이나 콘텐츠가 바뀌어 범위 밖 문제가 남은 플랜(코딩 테스트 언어를 바꾼 경우 포함)은 다시 만든다.
 */
export function quizUpToDate(plan: DailyPlan, profile: ProgressState['profile']): boolean {
  if (plan.goal !== profile.dailyGoal || plan.course !== courseKey(profile) || plan.questionIds.length === 0) return false;
  const scope = questionScope(profile);
  return plan.questionIds.every((id) => isQuestionForCourse(id, profile, scope));
}

/**
 * 오늘의 추천을 하루 동안 고정해서 돌려준다 (필요하면 새로 만든다).
 * 하루 목표나 코스가 바뀌면 퀴즈를 다시 만들고(오늘 이미 푼 문제는 남긴다), 코스가 바뀌면 CS 이론 · 면접 질문도 다시 고른다.
 * 나중에 생긴 추천 항목(알고리즘 유형 · CS 이론)이 없는 오늘의 플랜에는 그 항목만 채운다.
 */
export function useDailyPlan(): DailyPlan {
  const daily = useProgress((s) => s.daily);
  const profile = useProgress((s) => s.profile);
  const key = dayKey();
  const today = todayPlan(daily, key);
  if (today && quizUpToDate(today, profile) && !missingParts(today)) return today;

  const state = useProgress.getState();
  const course = courseKey(profile);
  const plan: DailyPlan = today
    ? {
        ...today,
        goal: profile.dailyGoal,
        course,
        questionIds: quizUpToDate(today, profile)
          ? today.questionIds
          : dailyQuestionIds(state, new Date(), answeredToday(today, state.quiz, key)),
        algoPatternId: today.algoPatternId ?? pickAlgoPattern(state),
        lessonId: today.course === course && today.lessonId ? today.lessonId : pickLesson(state),
        cardId: today.course === course ? today.cardId : pickCard(state),
      }
    : dailyPlan(state);
  if (plan.questionIds.length > 0) {
    // 렌더 중 상태 갱신을 피하기 위해 다음 틱에 저장
    setTimeout(() => {
      const s = useProgress.getState();
      const cur = todayPlan(s.daily, key);
      if (!cur || !quizUpToDate(cur, s.profile) || missingParts(cur)) s.setDaily(plan);
    }, 0);
  }
  return plan;
}

/** 오늘의 퀴즈 중 오늘 푼 문제 */
export function answeredToday(plan: DailyPlan, quiz: Record<string, QuizRecord>, key: string = dayKey()): string[] {
  return plan.questionIds.filter((id) => answeredOn(quiz, id, key));
}

/**
 * 오늘의 코드 리뷰 추천 — 코스 · 프레임워크가 바뀌어도 바로 반영되도록 매번 계산한다.
 * 풀스택은 날마다 백엔드 · 프론트엔드를 번갈아 추천하고, 그쪽 콘텐츠가 없으면 다른 쪽에서 고른다.
 */
export function pickReview(state: ProgressState, date: Date = new Date()): DailyPlanRecord['review'] {
  const side = sideOfDay(state.profile.track, date);
  const sides = side === 'backend' ? (['backend', 'frontend'] as const) : (['frontend', 'backend'] as const);
  const candidates = trackSides(state.profile.track).length > 1 ? sides : [side];
  const fw = candidates
    .map((s) => sideFramework(state.profile, s))
    .find((f) => REVIEW_CONTENT[f].patterns.length + REVIEW_CONTENT[f].challenges.length > 0);
  if (!fw) return undefined;
  const content = REVIEW_CONTENT[fw];
  const random = seededRandom(hashString(`${dayKey(date)}:${fw}:review`));
  const patterns = content.patterns.filter((p) => !state.patterns[p.id]);
  const challenges = content.challenges.filter((c) => !state.challenges[c.id]);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];
  if (patterns.length && (random() < 0.5 || !challenges.length)) return { kind: 'pattern', id: pick(patterns).id };
  if (challenges.length) return { kind: 'challenge', id: pick(challenges).id };
  if (content.patterns.length) return { kind: 'pattern', id: pick(content.patterns).id };
  return undefined;
}
