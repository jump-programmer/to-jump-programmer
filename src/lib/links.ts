import { Linking, Platform } from 'react-native';

/** 앱 소스 저장소 */
export const GITHUB_URL = 'https://github.com/lgm1007/to-jump-programmer';

/** 외부 링크 열기 — 웹(PWA)은 학습 화면을 벗어나지 않도록 새 탭, 앱은 기본 브라우저 */
export function openExternal(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url).catch(() => {});
}
