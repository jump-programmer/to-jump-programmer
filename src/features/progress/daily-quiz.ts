/**
 * 오늘의 퀴즈 구성 — 하루 목표(profile.dailyGoal)만큼, 코스에 맞는 문제만(후보는 course.ts) 낸다.
 * React Native 를 가져오지 않으므로 Node 테스트(scripts/test-core.ts)에서도 쓴다.
 */
import { shuffle } from '@/lib/date';

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

/** 묶음들을 번갈아 하나씩 꺼내 한 줄로 — 안 본 문제끼리 먼저, 그다음 본 문제끼리 */
function interleave(lists: string[][], seen: (id: string) => boolean): string[] {
  const round = (ls: string[][]) => {
    const out: string[] = [];
    for (let i = 0; ls.some((l) => i < l.length); i++) for (const l of ls) if (i < l.length) out.push(l[i]);
    return out;
  };
  return [...round(lists.map((l) => l.filter((id) => !seen(id)))), ...round(lists.map((l) => l.filter(seen)))];
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
  /** CS 후보 묶음 — 여러 묶음이면 번갈아 고른다 (풀스택: 백엔드 · 프론트엔드 · 공통) */
  cs: readonly (readonly string[])[];
  /** 알고리즘 후보 */
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

  // 묶음마다 섞은 뒤 번갈아 늘어놓는다. 어느 묶음부터 시작할지도 날짜(random)에 따라 바뀐다
  const start = cs.length > 1 ? Math.floor(random() * cs.length) : 0;
  const csList = interleave([...cs.slice(start), ...cs.slice(0, start)].map((g) => preferUnseen(g, seen, random)), seen);
  const algoList = preferUnseen(algo, seen, random);
  const fresh = (list: string[]) => list.filter((id) => !seen(id));
  take(wrong, quota.wrong);
  take(fresh(csList), quota.cs);
  take(fresh(algoList), quota.algo);
  take([...fresh(csList), ...fresh(algoList), ...wrong, ...csList, ...algoList], limit);
  return [...picked];
}
