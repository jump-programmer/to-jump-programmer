/** 하네스가 출력한 케이스별 원시 결과 (기대값과 비교하기 전) */
export interface RawCaseOutput {
  index: number;
  ok: boolean;
  /** ok=true 이면 반환값(JSON), false 이면 에러 메시지 */
  value: unknown;
  stdout: string;
  timeMs: number;
}
