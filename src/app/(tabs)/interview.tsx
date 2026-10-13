import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { IconBadge, SectionHeader } from '@/components/ui/misc';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ALL_LESSONS, CS_CATEGORIES, CS_CATEGORY_MAP, CS_GROUPS, DEV_TRACK_LABEL, type CsCategory } from '@/content';
import { AdSlot } from '@/features/ads';
import { isCategoryInTrack } from '@/features/progress/course';
import { categoryLessons, lessonStatus } from '@/features/progress/lessons';
import { againCardIds, csCategoryCardIds, csCategoryQuestionIds, quizSetStats } from '@/features/progress/selectors';
import { useProgress } from '@/features/progress/store';
import { useColors } from '@/theme/theme-provider';
import { spacing } from '@/theme/tokens';

export default function InterviewTab() {
  const c = useColors();
  const cards = useProgress((s) => s.cards);
  const track = useProgress((s) => s.profile.track);
  const againCount = againCardIds({ cards }).length;
  const [showOthers, setShowOthers] = useState(false);
  const [mode, setMode] = useState<Mode>('lessons');
  const lessonRecords = useProgress((s) => s.lessons);
  // 가장 최근에 읽던 레슨 (이어 읽기)
  const reading = ALL_LESSONS.filter((l) => lessonStatus(lessonRecords[l.id]) === 'reading').sort(
    (a, b) => lessonRecords[b.id].lastAt - lessonRecords[a.id].lastAt,
  )[0];
  // 내 코스(공통 + 코스 쪽) 카테고리를 먼저, 다른 코스 카테고리는 아래에 접어 둔다
  const mine = CS_CATEGORIES.filter((cat) => isCategoryInTrack(cat, track));
  const others = CS_CATEGORIES.filter((cat) => !isCategoryInTrack(cat, track));

  return (
    <Screen edges={['top']}>
      <View style={{ gap: 4, paddingTop: spacing.sm }}>
        <Text variant="title1">기술 면접 CS</Text>
        <Text variant="callout" color="textTertiary">
          이론으로 익히고, 퀴즈로 확인하고, 질문 카드로 말하기 연습까지
        </Text>
      </View>

      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: 'lessons', label: '이론 학습' },
          { value: 'practice', label: '퀴즈 · 카드' },
        ]}
      />

      {mode === 'lessons' && reading && (
        <Card tint={c.csSoft} style={styles.resume} onPress={() => router.push(`/interview/lesson/${reading.id}`)}>
          <Ionicons name="book" size={22} color={c.cs} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="small" tint={c.cs} weight="700">
              이어 읽기 · {CS_CATEGORY_MAP[reading.categoryId]?.title}
            </Text>
            <Text variant="bodyStrong" numberOfLines={1}>
              {reading.title}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
        </Card>
      )}

      {mode === 'practice' && (
        <View style={styles.quick}>
          <Card
            style={styles.quickCard}
            onPress={() => router.push({ pathname: '/quiz', params: { mode: 'ids', ids: randomMix(mine), title: 'CS 랜덤 10문제' } })}>
            <IconBadge name="shuffle" color={c.cs} background={c.csSoft} size={36} />
            <Text variant="subhead" weight="700">
              랜덤 10문제
            </Text>
            <Text variant="small" color="textTertiary">
              {track === 'fullstack' ? '전 범위 섞어서' : `${DEV_TRACK_LABEL[track]} 범위에서`}
            </Text>
          </Card>
          <Card
            style={styles.quickCard}
            onPress={() => router.push({ pathname: '/cards', params: { mode: 'again' } })}
            accessibilityLabel="다시 볼 면접 카드">
            <IconBadge name="repeat" color={c.warning} background={c.warningSoft} size={36} />
            <Text variant="subhead" weight="700">
              다시 볼 카드
            </Text>
            <Text variant="small" color="textTertiary">
              {againCount ? `${againCount}개 남음` : '아직 없어요'}
            </Text>
          </Card>
        </View>
      )}

      <CategoryGroups categories={mine} mode={mode} />

      {others.length > 0 && (
        <Button
          title={showOthers ? '다른 코스 카테고리 접기' : `다른 코스 카테고리 ${others.length}개 보기`}
          icon={showOthers ? 'chevron-up' : 'chevron-down'}
          variant="secondary"
          onPress={() => setShowOthers(!showOthers)}
        />
      )}
      {showOthers && <CategoryGroups categories={others} mode={mode} />}
      <AdSlot />
    </Screen>
  );
}

type Mode = 'lessons' | 'practice';

/** 카테고리를 그룹(CS 기초 · 언어 · 프레임워크 …)별로 묶어 보여준다. 이론 보기는 레슨 진행률, 퀴즈 · 카드 보기는 풀이 진행률 */
function CategoryGroups({ categories, mode }: { categories: CsCategory[]; mode: Mode }) {
  const c = useColors();
  const quiz = useProgress((s) => s.quiz);
  const cards = useProgress((s) => s.cards);
  const lessonRecords = useProgress((s) => s.lessons);
  return CS_GROUPS.map((g) => {
    const cats = categories.filter((cat) => cat.group === g.id);
    if (!cats.length) return null;
    return (
      <View key={g.id} style={{ gap: spacing.md }}>
        <SectionHeader title={g.title} subtitle={g.description} />
        <View style={styles.grid}>
          {cats.map((cat) => {
            const qIds = csCategoryQuestionIds(cat.id);
            const cIds = csCategoryCardIds(cat.id);
            const stats = quizSetStats(qIds, quiz);
            const seenCards = cIds.filter((id) => cards[id]).length;
            const lessons = categoryLessons(cat.id);
            const doneLessons = lessons.filter((l) => lessonStatus(lessonRecords[l.id]) === 'done').length;
            const total = mode === 'lessons' ? lessons.length : qIds.length + cIds.length;
            const value = !total ? 0 : mode === 'lessons' ? doneLessons / total : (stats.attempted + seenCards) / total;
            return (
              <Card
                key={cat.id}
                style={styles.cell}
                onPress={() => router.push({ pathname: '/interview/[id]', params: { id: cat.id, tab: mode } })}>
                <View style={styles.cellTop}>
                  <IconBadge name={cat.icon} color={c.cs} background={c.csSoft} size={38} />
                  {value >= 1 && <Ionicons name="checkmark-circle" size={20} color={c.success} />}
                </View>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {cat.title}
                </Text>
                <Text variant="small" color="textTertiary" numberOfLines={2} style={{ minHeight: 32 }}>
                  {cat.description}
                </Text>
                <ProgressBar value={value} color={c.cs} height={5} />
                <Text variant="small" color="textTertiary">
                  {!total
                    ? '콘텐츠 준비 중'
                    : mode === 'lessons'
                      ? `이론 ${doneLessons}/${lessons.length}`
                      : `퀴즈 ${qIds.length} · 질문 ${cIds.length}`}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>
    );
  });
}

function randomMix(categories: CsCategory[]): string {
  const ids = categories.flatMap((cat) => csCategoryQuestionIds(cat.id));
  const picked: string[] = [];
  const pool = [...ids];
  while (picked.length < 10 && pool.length) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked.join(',');
}

const styles = StyleSheet.create({
  quick: { flexDirection: 'row', gap: spacing.md },
  resume: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quickCard: { flex: 1, gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { flexBasis: '47%', flexGrow: 1, maxWidth: '49%', gap: 8 },
  cellTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
