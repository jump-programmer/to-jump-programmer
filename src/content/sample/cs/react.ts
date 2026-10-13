// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { CsCategoryContent } from '@/content/types';

const content: CsCategoryContent = {
  quiz: [
    {
      id: 'cs-react-q01',
      categoryId: 'react',
      type: 'ox',
      difficulty: 1,
      prompt: '부모 컴포넌트가 다시 렌더링되어도, 자식 컴포넌트는 전달받은 props가 바뀌지 않았다면 다시 렌더링되지 않는다.',
      answer: false,
      explanation: `React는 기본적으로 컴포넌트가 렌더링되면 그 아래 **모든 자식 컴포넌트를 다시 렌더링**합니다. props가 같은지 비교해서 건너뛰는 것은 자식을 \`React.memo\`로 감쌌을 때만 일어납니다.

컴포넌트가 다시 렌더링되는 경우는 크게 세 가지입니다.

- 자신의 state가 바뀔 때
- 부모 컴포넌트가 다시 렌더링될 때
- 구독 중인 Context 값이 바뀔 때

> 여기서 렌더링은 컴포넌트 함수를 다시 호출하는 것이지 DOM을 다시 그리는 것이 아닙니다. React는 결과를 이전과 비교(재조정)해 **바뀐 부분만** DOM에 반영하므로, 리렌더링 자체가 곧 성능 문제는 아닙니다. 느린 것이 확인된 곳에만 \`memo\`를 적용합니다.`,
      tags: [
        'rendering',
        'memo',
      ],
    },
    {
      id: 'cs-react-q02',
      categoryId: 'react',
      type: 'mcq',
      difficulty: 1,
      prompt: '버튼을 **한 번** 클릭한 뒤 화면에 표시되는 값은?',
      code: {
        language: 'tsx',
        source: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}`,
      },
      choices: [
        '`3`',
        '`1`',
        '`0`',
        '렌더링이 세 번 일어나 `1`, `2`, `3`이 차례로 표시된다',
      ],
      answer: 1,
      explanation: `state는 렌더링마다 고정된 **스냅샷**입니다. 이번 렌더링에서 \`count\`는 0이므로 세 줄 모두 \`setCount(0 + 1)\`을 예약하고, 결과는 \`1\`입니다.

- \`setCount\`는 값을 즉시 바꾸지 않고 **다음 렌더링을 예약**합니다. 그래서 호출 직후 \`console.log(count)\`를 찍으면 이전 값이 나오지만, 클릭 직후 다시 렌더링되므로 화면이 \`0\`에 머무르지는 않습니다.
- 이벤트 핸들러 안의 여러 업데이트는 **배칭**되어 렌더링은 한 번만 일어납니다. 중간 값이 화면에 차례로 나타나지 않습니다.
- 이전 값을 기준으로 여러 번 바꾸려면 **함수형 업데이트**를 씁니다. React가 대기열의 업데이트를 순서대로 적용하므로 \`3\`이 됩니다.

\`\`\`tsx
setCount((c) => c + 1);
setCount((c) => c + 1);
setCount((c) => c + 1); // 3
\`\`\``,
      tags: [
        'useState',
        'functional-update',
        'batching',
      ],
    },
  ],
  cards: [
    {
      id: 'cs-react-c01',
      categoryId: 'react',
      difficulty: 1,
      question: '가상 DOM(Virtual DOM)이란 무엇이고, React는 어떤 과정으로 화면을 업데이트하나요?',
      answer: `가상 DOM은 화면을 어떻게 그릴지 표현한 **자바스크립트 객체 트리**(React 엘리먼트)입니다. state가 바뀌면 React는 컴포넌트를 다시 실행해 새 트리를 만들고, 이전 트리와 비교하는 **재조정(Reconciliation)**으로 바뀐 부분을 찾아 실제 DOM에는 그 차이만 반영합니다. 이 과정은 트리를 계산하는 **렌더 단계**와 DOM에 적용하는 **커밋 단계**로 나뉩니다.

트리 비교는 O(n)에 끝나도록 휴리스틱을 씁니다.

- 엘리먼트 타입이 다르면(\`div\` → \`span\`, \`A\` → \`B\`) 하위 트리를 통째로 버리고 새로 만듭니다. 이때 하위 컴포넌트의 state도 사라집니다.
- 타입이 같으면 DOM 노드를 유지하고 바뀐 속성만 갱신합니다.
- 목록은 **key**로 같은 항목을 식별하므로, key는 데이터의 고유 id처럼 안정적인 값이어야 합니다.

가상 DOM이 직접 DOM 조작보다 항상 빠른 것은 아닙니다. 핵심 가치는 UI를 **선언적으로 작성해도** React가 변경을 모아 필요한 만큼만 DOM을 건드려 충분한 성능을 낸다는 데 있습니다.`,
      keywords: [
        'React 엘리먼트 트리',
        '재조정(Reconciliation)',
        '렌더 단계 · 커밋 단계',
        '타입 비교 휴리스틱',
        'key',
      ],
      followUps: [
        '리스트에서 key로 인덱스를 쓰면 어떤 문제가 생기나요?',
        '가상 DOM을 쓰면 항상 직접 DOM을 조작하는 것보다 빠른가요?',
        'React Fiber 아키텍처는 무엇을 가능하게 했나요?',
      ],
    },
  ],
};

export default content;
