// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { CsCategoryContent } from '@/content/types';

const content: CsCategoryContent = {
  quiz: [
    {
      id: 'cs-html-css-q01',
      categoryId: 'html-css',
      type: 'mcq',
      difficulty: 1,
      prompt: '`div`로만 만든 페이지를 `header`, `nav`, `main`, `article`, `footer` 같은 **시맨틱 요소**로 바꿨습니다. 기대할 수 있는 효과와 **거리가 먼** 것은?',
      choices: [
        '스크린 리더 사용자가 머리글, 내비게이션, 본문 같은 랜드마크로 바로 이동할 수 있다',
        '검색 엔진과 각종 도구가 문서 구조와 주요 내용을 더 정확히 파악할 수 있다',
        '태그 이름만 보고도 영역의 역할을 알 수 있어 코드를 읽고 유지보수하기 쉽다',
        '브라우저가 레이아웃 계산을 건너뛸 수 있어 렌더링 속도가 빨라진다',
      ],
      answer: 3,
      explanation: `시맨틱 요소는 **의미(역할)**를 전달합니다. 예를 들어 \`nav\`는 navigation, \`main\`은 main 랜드마크로 접근성 트리에 노출되어 스크린 리더 사용자가 영역 단위로 이동할 수 있고, 검색 엔진도 본문과 부가 영역을 구분하기 쉬워집니다. 코드 가독성도 좋아집니다.

하지만 렌더링 성능과는 관계가 없습니다. \`div\`와 \`article\`은 둘 다 기본적으로 블록 요소라 똑같이 레이아웃·페인트됩니다.

> 의미에 맞는 요소가 없을 때만 \`div\`·\`span\`을 쓰고, 버튼은 \`button\`, 링크는 \`a\`, 목록은 \`ul\`·\`li\`처럼 **의미와 동작이 맞는 요소**를 고르는 것이 접근성의 출발점입니다.`,
      tags: [
        'semantic-html',
        'accessibility',
        'seo',
      ],
    },
    {
      id: 'cs-html-css-q02',
      categoryId: 'html-css',
      type: 'mcq',
      difficulty: 1,
      prompt: '`box-sizing`이 기본값(`content-box`)일 때, 아래 `.box` 요소의 **테두리까지 포함한 너비**(margin 제외)는?',
      code: {
        language: 'css',
        source: `.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
}`,
      },
      choices: [
        '200px',
        '250px',
        '270px',
        '230px',
      ],
      answer: 1,
      explanation: `박스 모델은 안쪽부터 **content → padding → border → margin** 순서입니다. \`content-box\`에서는 \`width\`가 **콘텐츠 영역만의 너비**이므로 padding과 border가 더해집니다.

- 200(content) + 20 × 2(padding) + 5 × 2(border) = **250px**
- margin까지 더하면 270px만큼 공간을 차지하지만, margin은 테두리 바깥 여백이라 요소의 너비에는 들어가지 않습니다.

\`box-sizing: border-box\`이면 \`width: 200px\`이 테두리까지 포함한 너비가 되고, 콘텐츠 영역이 150px로 줄어듭니다. 크기 계산이 직관적이라 전역으로 지정하는 경우가 많습니다.

\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\``,
      tags: [
        'box-model',
        'box-sizing',
      ],
    },
  ],
  cards: [
    {
      id: 'cs-html-css-c01',
      categoryId: 'html-css',
      difficulty: 1,
      question: '시맨틱 마크업이란 무엇이고, 왜 중요한가요?',
      answer: `시맨틱 마크업은 요소를 **보이는 모양이 아니라 의미와 역할에 맞게** 고르는 것입니다. 모든 영역을 \`div\`로 만들지 않고 \`header\`, \`nav\`, \`main\`, \`article\`, \`footer\`를 쓰고, 목록은 \`ul\`·\`li\`, 버튼은 \`button\`으로 씁니다.

- **접근성**: 브라우저가 요소의 역할을 접근성 트리에 노출하므로, 스크린 리더 사용자가 랜드마크나 제목(\`h1\`~\`h6\`) 단위로 이동하고 "버튼", "링크"처럼 역할을 들을 수 있습니다.
- **기본 동작**: \`button\`의 키보드 조작, \`a\`의 링크 이동과 새 탭 열기, \`form\`의 Enter 제출을 브라우저가 기본으로 제공합니다.
- **SEO와 유지보수**: 검색 엔진이 본문을 파악하기 쉽고, 코드를 읽는 사람도 구조를 바로 이해합니다.

실무에서는 제목 단계를 건너뛰지 않고, 클릭 이벤트가 필요하면 \`div\` 대신 \`button\`이나 \`a\`를 쓰는 것을 기본 규칙으로 둡니다.`,
      keywords: [
        '의미에 맞는 요소',
        '접근성 트리',
        '랜드마크 · 제목 구조',
        '네이티브 기본 동작',
        'SEO',
      ],
      followUps: [
        'section과 article은 어떻게 구분해서 쓰나요?',
        '버튼과 링크는 어떤 기준으로 구분하나요?',
      ],
    },
  ],
};

export default content;
