// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { CsCategoryContent } from '@/content/types';

const content: CsCategoryContent = {
  quiz: [
    {
      id: 'cs-browser-q01',
      categoryId: 'browser',
      type: 'mcq',
      difficulty: 1,
      prompt: '다음 중 브라우저의 **렌더 트리(Render Tree)에 포함되지 않는** 요소는?',
      choices: [
        '`visibility: hidden`이 적용된 요소',
        '`display: none`이 적용된 요소',
        '`opacity: 0`이 적용된 요소',
        '스크롤해야 보이는, 뷰포트 밖에 있는 요소',
      ],
      answer: 1,
      explanation: `렌더 트리는 DOM과 CSSOM을 합쳐 **화면에 그려질 노드만** 모은 트리입니다. \`display: none\`인 요소는 자손까지 통째로 렌더 트리에서 빠지므로 레이아웃 공간도 차지하지 않습니다. \`head\`, \`script\`, \`meta\`처럼 원래 보이지 않는 요소도 마찬가지입니다.

- \`visibility: hidden\`: 보이지 않을 뿐 렌더 트리에 남아 **레이아웃 공간을 차지**합니다.
- \`opacity: 0\`: 투명하게 그려지는 것이라 공간을 차지하고, 클릭 같은 이벤트도 그대로 받습니다.
- 뷰포트 밖 요소: 렌더 트리에 있고 레이아웃도 계산됩니다. 지금 화면에 보이지 않을 뿐입니다.

> 요소를 숨길 때 \`display\`를 바꾸면 주변 레이아웃이 다시 계산되고, \`visibility\`·\`opacity\`는 자리를 유지한 채 숨깁니다.`,
      tags: [
        'rendering',
        'render-tree',
      ],
    },
    {
      id: 'cs-browser-q02',
      categoryId: 'browser',
      type: 'mcq',
      difficulty: 1,
      prompt: '이미 화면에 그려진 요소의 스타일을 아래처럼 바꿀 때, **레이아웃(리플로우)을 다시 계산하게 만드는** 변경은?',
      choices: [
        '`color: red` → `color: blue`',
        '`transform: translateX(0)` → `transform: translateX(100px)`',
        '`width: 100px` → `width: 200px`',
        '`opacity: 1` → `opacity: 0.5`',
      ],
      answer: 2,
      explanation: `요소의 크기나 문서 흐름상의 위치가 바뀌면, 그 요소와 영향을 받는 주변 요소의 기하 정보를 다시 계산하는 **레이아웃(리플로우)**이 일어나고 페인트·합성도 이어서 다시 합니다. \`width\`, \`height\`, \`padding\`, \`margin\`, \`font-size\` 변경, DOM 추가·삭제 등이 여기에 속합니다.

- \`color\`, \`background-color\`: 기하 정보는 그대로라 레이아웃 없이 **리페인트**만 합니다.
- \`transform\`, \`opacity\`: 문서 흐름에 영향을 주지 않아 레이아웃을 다시 계산하지 않고, 보통 **합성(Composite)** 단계만으로 처리됩니다. 그래서 애니메이션에 가장 저렴한 속성입니다.

> 요소를 움직이는 애니메이션은 \`left\`·\`top\` 대신 \`transform: translate()\`로 구현하는 것이 기본입니다.`,
      tags: [
        'reflow',
        'repaint',
        'composite',
      ],
    },
  ],
  cards: [
    {
      id: 'cs-browser-c01',
      categoryId: 'browser',
      difficulty: 1,
      question: '주소창에 URL을 입력한 뒤 화면이 그려지기까지, 브라우저가 HTML을 받은 이후의 렌더링 과정을 설명해주세요.',
      answer: `DNS 조회와 TCP·TLS 연결을 거쳐 HTML 응답이 오면, 브라우저는 다음 순서로 화면을 그립니다. 이 흐름을 **중요 렌더링 경로(Critical Rendering Path)**라고 합니다.

1. **DOM 생성**: HTML을 파싱해 DOM 트리를 만듭니다. 속성 없는 일반 스크립트를 만나면 파싱을 멈추고 내려받아 실행합니다.
2. **CSSOM 생성**: CSS를 파싱해 CSSOM을 만듭니다. CSS는 렌더링 차단 리소스라 CSSOM이 준비돼야 그릴 수 있습니다.
3. **렌더 트리**: DOM과 CSSOM을 합쳐 실제로 보이는 노드만 모읍니다. \`display: none\`인 요소는 빠집니다.
4. **레이아웃**: 각 노드의 크기와 위치를 계산합니다.
5. **페인트**: 글자·색·이미지·그림자 등을 그리는 명령을 레이어별로 만듭니다.
6. **합성(Composite)**: 여러 레이어를 GPU에서 합쳐 최종 화면을 만듭니다.

실무에서는 첫 화면을 빨리 그리기 위해 첫 화면용 CSS를 작게 유지하고, 스크립트에 \`defer\`를 붙여 파싱을 막지 않게 하며, 애니메이션은 레이아웃·페인트를 건너뛰는 \`transform\`·\`opacity\`로 구현합니다.`,
      keywords: [
        'DOM · CSSOM',
        '렌더 트리',
        '레이아웃',
        '페인트',
        '합성(Composite)',
        '렌더링 차단 리소스',
      ],
      followUps: [
        '리플로우와 리페인트는 어떻게 다른가요?',
        'display: none과 visibility: hidden은 렌더링 과정에서 어떻게 다르게 처리되나요?',
        'DNS 조회부터 HTML 응답을 받기까지 네트워크 구간에서는 어떤 일이 일어나나요?',
      ],
    },
  ],
};

export default content;
