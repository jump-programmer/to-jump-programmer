/** 입출력 예의 값을 화면에 보여줄 문자열로 (JSON 스타일, 원소 사이에 공백) */
export function formatValue(v: unknown, maxLength = 400): string {
  const s = format(v);
  return s.length > maxLength ? `${s.slice(0, maxLength)}…` : s;
}

function format(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(format).join(', ')}]`;
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}
