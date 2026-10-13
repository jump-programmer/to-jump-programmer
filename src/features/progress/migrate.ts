/**
 * 저장된 학습 기록을 현재 형식으로 바꾼다. persist version 을 올릴 때 여기에 단계를 더한다.
 * React Native 를 가져오지 않으므로 Node 테스트(scripts/test-core.ts)에서도 쓴다.
 */
import type { ProgressData } from './store';

export const PROGRESS_VERSION = 3;

export function migrateProgress(persisted: unknown, version: number): Partial<ProgressData> {
  const data = { ...((persisted ?? {}) as Partial<ProgressData>) };
  if (version < 2) {
    // v2: 개발자 코스 — 기존 사용자는 백엔드 코스로 두고, 프론트엔드 프레임워크는 기본값으로 채운다
    data.profile = { track: 'backend', frontendFramework: 'react', ...data.profile } as ProgressData['profile'];
  }
  if (version < 3) {
    // v3: CS 이론 레슨 기록
    data.lessons ??= {};
  }
  return data;
}
