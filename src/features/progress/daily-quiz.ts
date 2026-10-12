/**
 * 오늘의 퀴즈 구성 — 하루 목표(profile.dailyGoal)만큼, 관심 프레임워크에 맞는 언어 문제만 낸다.
 * React Native 를 가져오지 않으므로 Node 테스트(scripts/test-core.ts)에서도 쓴다.
 */
import {
  CS_CATEGORIES,
  CS_CATEGORY_MAP,
  CS_CONTENT,
  FRAMEWORK_LANGUAGE_CATEGORIES,
  QUESTION_MAP,
  QUESTION_SOURCE,
  type CsCategory,
  type FrameworkId,
} from '@/content';
import { shuffle } from '@/lib/date';

/** 오늘의 퀴즈에 내는 CS 카테고리 — 언어 카테고리는 관심 프레임워크의 언어만 */
export function csCategoriesForFramework(framework: FrameworkId): CsCategory[] {
  const languages = FRAMEWORK_LANGUAGE_CATEGORIES[framework];
  return CS_CATEGORIES.filter((c) => c.group !== 'language' || languages.includes(c.id));
}

export function csQuestionIdsForFramework(framework: FrameworkId): string[] {
  return csCategoriesForFramework(framework).flatMap((c) => (CS_CONTENT[c.id]?.quiz ?? []).map((q) => q.id));
}

/** 관심 프레임워크와 맞지 않는 언어 카테고리의 CS 문제만 false (알고리즘 문제는 모두 true) */
export function isQuestionForFramework(id: string, framework: FrameworkId): boolean {
  const q = QUESTION_MAP[id];
  if (!q) return false;
  if (QUESTION_SOURCE[id] !== 'cs') return true;
  const category = CS_CATEGORY_MAP[q.categoryId];
  return category?.group !== 'language' || FRAMEWORK_LANGUAGE_CATEGORIES[framework].includes(category.id);
}

export interface DailyQuizQuota {
  wrong: number;
  cs: number;
  algo: number;
}

/** 목표 수를 틀린 문제 : CS : 알고리즘 = 2 : 4 : 2 비율로 나눈다 (5 → 1·3·1, 10 → 2·5·3, 20 → 5·10·5, 30 → 7·15·8) */
export function dailyQuizQuota(goal: number): DailyQuizQuota {
  const total = Math.max(0, Math.floor(goal));
  const cs = Math.round(total / 2);
  const wrong = Math.floor((total - cs) / 2);
  return { wrong, cs, algo: total - cs - wrong };
}

/** 안 본 문제를 먼저, 각각 섞어서 */
function preferUnseen(ids: readonly string[], seen: (id: string) => boolean, random: () => number): string[] {
  return [
    ...shuffle(
      ids.filter((id) => !seen(id)),
      random,
    ),
    ...shuffle(
      ids.filter((id) => seen(id)),
      random,
    ),
  ];
}

export interface DailyQuizInput {
  /** 하루 목표 = 문제 수 */
  goal: number;
  /** 틀린 문제 (최근에 틀린 순) */
  wrong: readonly string[];
  /** CS · 알고리즘 후보 */
  cs: readonly string[];
  algo: readonly string[];
  /** 한 번이라도 푼 문제 */
  seen: (id: string) => boolean;
  random: () => number;
  /** 그대로 남길 문제 (목표를 바꾸기 전에 오늘 이미 푼 문제) — 앞에 두고, 같은 영역 몫에서 뺀다 */
  keep?: readonly string[];
}

/**
 * 오늘의 퀴즈 문제 목록 (최대 goal 개). 틀린 문제 → 안 본 CS → 안 본 알고리즘 순으로 몫만큼 고르고,
 * 모자라면 다른 영역의 안 본 문제 → 틀린 문제 → 이미 맞힌 문제 순으로 채운다.
 */
export function composeDailyQuiz({ goal, wrong, cs, algo, seen, random, keep = [] }: DailyQuizInput): string[] {
  const quota = dailyQuizQuota(goal);
  const limit = quota.wrong + quota.cs + quota.algo;
  const picked = new Set<string>();
  const take = (list: readonly string[], count: number) => {
    for (const id of list) {
      if (count <= 0 || picked.size >= limit) return;
      if (picked.has(id)) continue;
      picked.add(id);
      count--;
    }
  };

  const algoSet = new Set(algo);
  take(keep, limit);
  for (const id of picked) {
    const own = algoSet.has(id) ? 'algo' : 'cs';
    const from = quota[own] > 0 ? own : (['cs', 'algo', 'wrong'] as const).find((k) => quota[k] > 0);
    if (from) quota[from]--;
  }

  const csList = preferUnseen(cs, seen, random);
  const algoList = preferUnseen(algo, seen, random);
  const fresh = (list: string[]) => list.filter((id) => !seen(id));
  take(wrong, quota.wrong);
  take(fresh(csList), quota.cs);
  take(fresh(algoList), quota.algo);
  take([...fresh(csList), ...fresh(algoList), ...wrong, ...csList, ...algoList], limit);
  return [...picked];
}
