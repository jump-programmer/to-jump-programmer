import { Badge } from '@/components/ui/badge';
import { isLessonUnderstood, lessonStatus } from '@/features/progress/lessons';
import { useProgress } from '@/features/progress/store';

/** CS 이론 레슨 상태 — 안 읽음 · 읽는 중 · 완료(확인 퀴즈 2/3 이상이면 이해함) */
export function LessonStatusBadge({ lessonId }: { lessonId: string }) {
  const record = useProgress((s) => s.lessons[lessonId]);
  const status = lessonStatus(record);
  if (status === 'new') return <Badge label="안 읽음" />;
  if (status === 'reading') return <Badge label="읽는 중" tone="warning" icon="book-outline" />;
  return isLessonUnderstood(record) ? (
    <Badge label="이해함" tone="success" icon="checkmark" />
  ) : (
    <Badge label="완료" tone="primary" icon="checkmark" />
  );
}
