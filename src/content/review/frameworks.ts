import type { DevTrack, FrameworkId, ReviewCategory, ReviewFramework, Severity, TrackSide } from '../types';

export const REVIEW_FRAMEWORKS: ReviewFramework[] = [
  {
    id: 'spring',
    track: 'backend',
    title: 'Spring Boot',
    subtitle: 'Java · Kotlin · Spring Data JPA',
    language: 'java',
    variants: ['kotlin'],
    icon: 'leaf',
    accent: '#16A34A',
  },
  {
    id: 'nest',
    track: 'backend',
    title: 'Node.js · NestJS',
    subtitle: 'TypeScript · Express · TypeORM',
    language: 'typescript',
    icon: 'logo-nodejs',
    accent: '#E0234E',
  },
  {
    id: 'django',
    track: 'backend',
    title: 'Django · Flask',
    subtitle: 'Python · Django ORM · SQLAlchemy',
    language: 'python',
    icon: 'logo-python',
    accent: '#2563EB',
  },
  {
    id: 'react',
    track: 'frontend',
    title: 'React',
    subtitle: 'TypeScript · Hooks · TanStack Query',
    language: 'tsx',
    icon: 'logo-react',
    accent: '#0EA5E9',
  },
  {
    id: 'vue',
    track: 'frontend',
    title: 'Vue',
    subtitle: 'TypeScript · Composition API · Pinia',
    language: 'vue',
    icon: 'logo-vue',
    accent: '#10B981',
  },
];

export const REVIEW_FRAMEWORK_MAP = Object.fromEntries(
  REVIEW_FRAMEWORKS.map((f) => [f.id, f]),
) as Record<FrameworkId, ReviewFramework>;

export const REVIEW_CATEGORY_LABEL: Record<ReviewCategory, string> = {
  performance: '성능',
  security: '보안',
  design: '설계',
  transaction: '트랜잭션',
  'error-handling': '예외 처리',
  concurrency: '동시성',
  readability: '가독성',
  testing: '테스트',
  'api-design': 'API 설계',
  state: '상태 관리',
  accessibility: '접근성',
};

export const DEV_TRACKS: { id: DevTrack; title: string; description: string; icon: string }[] = [
  { id: 'backend', title: '백엔드', description: 'Spring · NestJS · Django 서버 개발', icon: 'server-outline' },
  { id: 'frontend', title: '프론트엔드', description: 'React · Vue 웹 화면 개발', icon: 'desktop-outline' },
  { id: 'fullstack', title: '풀스택', description: '백엔드 · 프론트엔드 모두', icon: 'layers-outline' },
];

export const DEV_TRACK_LABEL: Record<DevTrack, string> = { backend: '백엔드', frontend: '프론트엔드', fullstack: '풀스택' };
export const TRACK_SIDE_LABEL: Record<TrackSide, string> = { backend: '백엔드', frontend: '프론트엔드' };

/** 코스가 보는 쪽 (풀스택은 백엔드 · 프론트엔드 둘 다) */
export function trackSides(track: DevTrack): TrackSide[] {
  return track === 'fullstack' ? ['backend', 'frontend'] : [track];
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: '치명적',
  major: '중요',
  minor: '사소함',
};
