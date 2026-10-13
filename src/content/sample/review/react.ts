// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { ReviewFrameworkContent } from '@/content/types';

const content: ReviewFrameworkContent = {
  patterns: [
    {
      id: 'react-p-derived-state',
      framework: 'react',
      category: 'state',
      difficulty: 1,
      title: '파생 값을 state로 복제하고 useEffect로 동기화',
      summary: '다른 props · state로 계산할 수 있는 값은 state로 두지 말고 렌더링 중에 계산합니다. 동기화용 useEffect는 렌더링을 한 번 더 일으키고 값이 어긋날 틈을 만듭니다.',
      problem: `장바구니에서 선택한 상품의 결제 예정 금액을 보여 주는 컴포넌트입니다. \`totalPrice\`와 \`allChecked\`는 \`items\`와 \`checkedIds\`만 있으면 언제든 계산할 수 있는데, 별도 state로 복제하고 \`useEffect\`로 맞춰 주고 있습니다.

- 체크박스를 누를 때마다 **렌더링 → effect 실행 → setState → 다시 렌더링**으로 렌더링이 두 번 일어납니다.
- 첫 렌더링에서는 effect가 아직 실행되지 않았으므로, 모든 상품이 선택되어 있는데도 금액 \`0원\`과 체크 해제된 "전체 선택"이 잠깐 보일 수 있습니다.
- 같은 정보가 두 곳에 있어 어긋나기 쉽습니다. 장바구니에서 상품이 삭제되면 \`checkedIds\`에는 삭제된 id가 남아 \`checkedIds.length === items.length\` 비교가 틀어집니다.`,
      before: {
        language: 'tsx',
        filename: 'CartSummary.tsx',
        source: `import { useEffect, useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function CartSummary({ items }: { items: CartItem[] }) {
  // 처음에는 모든 상품을 선택한 상태
  const [checkedIds, setCheckedIds] = useState(() => items.map((i) => i.id));
  // 아래 두 값은 items · checkedIds로 계산할 수 있는데 state로 복제함
  const [totalPrice, setTotalPrice] = useState(0);
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    const total = items
      .filter((item) => checkedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [items, checkedIds]);

  useEffect(() => {
    setAllChecked(checkedIds.length === items.length);
  }, [items, checkedIds]);

  const toggle = (id: number) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  const toggleAll = () => setCheckedIds(allChecked ? [] : items.map((i) => i.id));

  return (
    <section>
      <label>
        <input type="checkbox" checked={allChecked} onChange={toggleAll} />
        전체 선택
      </label>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={checkedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              {item.name} × {item.quantity}
            </label>
          </li>
        ))}
      </ul>
      <p>결제 예정 금액 {totalPrice.toLocaleString()}원</p>
    </section>
  );
}`,
      },
      after: {
        language: 'tsx',
        filename: 'CartSummary.tsx',
        source: `import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function CartSummary({ items }: { items: CartItem[] }) {
  // state에는 사용자가 고른 것(선택한 id)만 둠
  const [checkedIds, setCheckedIds] = useState(() => items.map((i) => i.id));

  // 나머지는 렌더링 중에 계산: 항상 items · checkedIds와 일치
  const checkedItems = items.filter((item) => checkedIds.includes(item.id));
  const totalPrice = checkedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  // items 기준으로 계산하므로 삭제된 상품의 id가 남아 있어도 틀리지 않음
  const allChecked = items.length > 0 && checkedItems.length === items.length;

  const toggle = (id: number) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  const toggleAll = () => setCheckedIds(allChecked ? [] : items.map((i) => i.id));

  return (
    <section>
      <label>
        <input type="checkbox" checked={allChecked} onChange={toggleAll} />
        전체 선택
      </label>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={checkedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              {item.name} × {item.quantity}
            </label>
          </li>
        ))}
      </ul>
      <p>결제 예정 금액 {totalPrice.toLocaleString()}원</p>
    </section>
  );
}`,
      },
      explanation: `### 개선 포인트
- state에는 **사용자의 선택처럼 다른 값으로 만들 수 없는 정보**만 둡니다. 합계 · 전체 선택 여부 같은 파생 값은 렌더링 중에 계산합니다.
- 렌더링할 때마다 계산하므로 항상 최신 \`items\` · \`checkedIds\`와 일치하고, 동기화 effect가 없으니 추가 렌더링도 없습니다.
- \`allChecked\`를 \`items\` 기준으로 계산해, 삭제된 상품의 id가 \`checkedIds\`에 남아 있어도 결과가 틀리지 않습니다.

### 계산이 비싸다면
수천 개 항목 정렬처럼 **측정해 보니 실제로 느린 계산**만 \`useMemo\`로 감쌉니다. 모든 계산을 습관적으로 감싸면 의존성 배열을 관리하는 비용만 늘어납니다.

\`\`\`tsx
const sorted = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items],
);
\`\`\`

### 이런 effect는 의심하세요
- effect가 하는 일이 다른 state로 계산한 값을 \`setState\` 하는 것뿐이다.
- props가 바뀔 때 state를 초기화하려고 effect를 쓴다. 이때는 부모에서 \`key\`를 바꿔 컴포넌트를 새로 만드는 방법을 먼저 검토합니다. 예: \`<CartSummary key={cartId} items={items} />\`

> \`useState(() => items.map(...))\`의 초기값은 **첫 렌더링에서만** 쓰입니다. 나중에 \`items\`에 상품이 추가되어도 \`checkedIds\`는 따라가지 않습니다. 새 상품도 기본 선택되어야 한다면 "선택 해제한 id"를 state로 두는 식으로 모델을 바꾸는 것도 방법입니다.`,
      checklist: [
        'state로 둔 값이 다른 props · state로 계산할 수 있는 값은 아닌가?',
        '`useEffect` 안에서 다른 값으로 계산한 결과를 `setState`만 하고 있지 않은가?',
        '같은 정보를 두 곳 이상의 state에 저장하고 있지 않은가?',
        '`useMemo`는 실제로 느린 계산에만 썼는가?',
      ],
    },
    {
      id: 'react-p-stale-closure',
      framework: 'react',
      category: 'state',
      difficulty: 3,
      title: 'useEffect 의존성 누락과 오래된 클로저(stale closure)',
      summary: '의존성 배열에서 빠진 값은 effect 안에서 첫 렌더링 시점의 값으로 고정됩니다. 경고를 끄지 말고 의존성을 채우거나 함수형 업데이트로 바꿉니다.',
      problem: `주문 현황을 5초마다 새로 고치는 화면입니다. 상태 탭(결제 완료 · 배송 중 …)을 바꿀 수 있고, 몇 번 새로 고쳤는지도 보여 줍니다.

- 의존성이 \`[]\`라 effect는 첫 렌더링에서 한 번만 실행됩니다. \`setInterval\` 콜백은 **첫 렌더링의 \`status\`('PAID')와 \`refreshCount\`(0)를 계속 사용**합니다.
- 탭을 "배송 중"으로 바꿔도 계속 결제 완료 주문만 조회합니다. 탭을 바꾼 직후 바로 조회하지도 않습니다.
- \`setRefreshCount(refreshCount + 1)\`은 매번 \`0 + 1\`을 계산하므로 화면의 횟수가 1에서 멈춥니다.
- \`exhaustive-deps\` 경고를 주석으로 꺼서 린트가 알려 줄 기회도 없앴습니다.`,
      before: {
        language: 'tsx',
        filename: 'OrderMonitor.tsx',
        source: `import { useEffect, useState } from 'react';
import { fetchOrders, type Order, type OrderStatus } from '@/api/orders';
import { OrderTable } from './OrderTable';
import { StatusTabs } from './StatusTabs';

export function OrderMonitor() {
  const [status, setStatus] = useState<OrderStatus>('PAID');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // 이 콜백은 첫 렌더링의 status('PAID')와 refreshCount(0)를 계속 사용
    const id = setInterval(async () => {
      const data = await fetchOrders(status);
      setOrders(data);
      setRefreshCount(refreshCount + 1);
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <StatusTabs value={status} onChange={setStatus} />
      <p>자동 새로고침 {refreshCount}회</p>
      <OrderTable orders={orders} />
    </section>
  );
}`,
      },
      after: {
        language: 'tsx',
        filename: 'OrderMonitor.tsx',
        source: `import { useEffect, useState } from 'react';
import { fetchOrders, type Order, type OrderStatus } from '@/api/orders';
import { OrderTable } from './OrderTable';
import { StatusTabs } from './StatusTabs';

export function OrderMonitor() {
  const [status, setStatus] = useState<OrderStatus>('PAID');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    // effect에서만 쓰는 함수는 effect 안에 선언
    async function load() {
      try {
        const data = await fetchOrders(status);
        if (ignore) return; // 탭을 바꾼 뒤 도착한 이전 status의 응답은 버림
        setOrders(data);
        setRefreshCount((count) => count + 1); // 이전 값 기준 함수형 업데이트
      } catch {
        // 일시적인 실패는 다음 주기에 다시 시도
      }
    }

    load(); // 탭을 바꾸면 5초를 기다리지 않고 바로 조회
    const id = setInterval(load, 5000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [status]); // effect가 읽는 반응형 값을 모두 의존성에

  return (
    <section>
      <StatusTabs value={status} onChange={setStatus} />
      <p>자동 새로고침 {refreshCount}회</p>
      <OrderTable orders={orders} />
    </section>
  );
}`,
      },
      explanation: `### 왜 오래된 값이 보일까?
컴포넌트 함수는 렌더링마다 다시 실행되고, 그 안에서 만든 함수는 **그 렌더링의 props · state를 캡처**합니다(클로저). effect는 의존성이 바뀔 때만 다시 실행되므로, 의존성에서 빠진 값은 effect가 마지막으로 실행된 렌더링의 값에 묶여 있습니다.

### 개선 포인트
- effect가 읽는 \`status\`를 의존성에 넣습니다. \`status\`가 바뀌면 React가 cleanup으로 이전 타이머를 정리하고 새 값으로 effect를 다시 실행합니다.
- 이전 값으로 다음 값을 만드는 업데이트는 \`setRefreshCount((count) => count + 1)\`처럼 **함수형 업데이트**로 씁니다. \`refreshCount\`를 의존성에 넣지 않아도 항상 최신 값 기준으로 계산됩니다.
- effect에서만 쓰는 함수(\`load\`)는 effect 안에 선언합니다. 컴포넌트 본문에 두면 렌더링마다 새 함수가 되어 의존성에 넣기 곤란해집니다.
- \`ignore\` 플래그로 탭을 바꾼 뒤 늦게 도착한 이전 탭의 응답을 버립니다.

### exhaustive-deps 경고를 끄지 마세요
\`eslint-plugin-react-hooks\`의 \`exhaustive-deps\` 경고는 대부분 실제 버그를 가리킵니다. 주석으로 끄지 말고 경고가 사라지도록 코드를 바꿉니다.
- 값은 최신으로 읽고 싶지만 그 값이 바뀔 때 effect를 다시 실행하고 싶지는 않다면, React 19.2에 추가된 \`useEffectEvent\`나 \`useRef\`에 최신 값을 담아 두는 방법을 씁니다.

### 서버 데이터라면
TanStack Query v5의 \`refetchInterval\`을 쓰면 폴링, 늦게 온 응답 처리, 정리를 라이브러리가 맡습니다.

\`\`\`tsx
const { data: orders = [] } = useQuery({
  queryKey: ['orders', status],
  queryFn: () => fetchOrders(status),
  refetchInterval: 5000,
});
\`\`\``,
      checklist: [
        'effect 안에서 읽는 props · state · 함수가 모두 의존성 배열에 있는가?',
        '`exhaustive-deps` 경고를 주석으로 끄고 있지 않은가?',
        '이전 값으로 다음 값을 만드는 업데이트가 함수형(`setX((prev) => ...)`)인가?',
        '타이머 · 구독 콜백이 첫 렌더링의 값에 묶여 있지 않은가?',
      ],
    },
  ],
  challenges: [
    {
      id: 'react-c01',
      framework: 'react',
      difficulty: 1,
      title: '상품 검색 화면 리뷰',
      context: `쇼핑몰의 상품 검색 화면입니다.

- 검색어를 입력하면 \`GET /api/products?q=검색어\`로 상품을 조회하고, 선택한 기준으로 정렬해 보여 줍니다. 검색어가 비어 있으면 추천 상품을 돌려줍니다.
- \`ProductCard\`는 내부에 "수량 선택" state를 가진 컴포넌트입니다.
- 검색 API는 평소 100~800ms가 걸리고, 트래픽이 몰리면 가끔 503을 응답합니다.
- 환경: React 18, TypeScript. 프로젝트에 TanStack Query v5가 설치되어 있지만 이 화면에서는 아직 쓰지 않습니다.`,
      code: {
        language: 'tsx',
        filename: 'ProductSearch.tsx',
        source: `import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
}

type SortKey = 'price' | 'name';

export function ProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [products, setProducts] = useState<Product[]>([]);
  const [sorted, setSorted] = useState<Product[]>([]);

  useEffect(() => {
    fetch(\`/api/products?q=\${encodeURIComponent(keyword)}\`)
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data));
  }, [keyword]);

  useEffect(() => {
    const next = [...products].sort((a, b) =>
      sortKey === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
    );
    setSorted(next);
  }, [products, sortKey]);

  return (
    <div>
      <label>
        검색어
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </label>
      <label>
        정렬
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="price">낮은 가격순</option>
          <option value="name">이름순</option>
        </select>
      </label>
      <ul>
        {sorted.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </ul>
    </div>
  );
}`,
      },
      issues: [
        {
          lines: [
            19,
            21,
          ],
          category: 'concurrency',
          severity: 'major',
          title: '검색어를 빠르게 바꾸면 늦게 온 이전 응답이 결과를 덮어씀',
          description: `검색어가 바뀔 때마다 요청을 보내지만, 이전 요청을 취소하거나 그 응답을 무시하지 않습니다.

- 응답 시간이 100~800ms로 들쭉날쭉해서 \`"노트"\` 다음에 \`"노트북"\`을 검색해도 \`"노트"\`의 응답이 나중에 도착할 수 있습니다.
- 마지막에 도착한 응답이 이기므로 **입력창은 "노트북"인데 목록은 "노트" 결과**가 됩니다.`,
          suggestion: `effect cleanup에서 이전 요청을 취소합니다. TanStack Query를 쓴다면 검색어를 \`queryKey\`에 넣는 것만으로 결과가 검색어별로 분리됩니다.

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then(setProducts)
    .catch(() => {});
  return () => controller.abort(); // 다음 검색어로 바뀌면 취소
}, [keyword]);
\`\`\``,
        },
        {
          lines: [
            16,
            24,
            28,
          ],
          category: 'state',
          severity: 'minor',
          title: '정렬 결과를 state로 복제하고 effect로 동기화함',
          description: `\`sorted\`는 \`products\`와 \`sortKey\`로 언제든 계산할 수 있는 값인데, 별도 state로 두고 effect로 맞추고 있습니다.

- 응답이 올 때마다, 정렬 기준을 바꿀 때마다 렌더링이 한 번 더 일어납니다.
- effect가 실행되기 전 렌더링에서는 \`sorted\`가 이전 값이라 이전 결과가 그려질 수 있습니다.
- 같은 정보가 두 state에 있어, 나중에 \`products\`만 고치는 코드가 추가되면 화면과 어긋나기 쉽습니다.`,
          suggestion: `렌더링 중에 계산합니다. 목록이 커서 정렬 비용이 신경 쓰인다면 \`useMemo\`로 감쌉니다.

\`\`\`tsx
const sorted = useMemo(
  () =>
    [...products].sort((a, b) =>
      sortKey === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
    ),
  [products, sortKey],
);
\`\`\``,
        },
        {
          lines: [
            48,
            49,
          ],
          category: 'state',
          severity: 'major',
          title: '정렬 · 검색으로 순서가 바뀌는 목록에 index를 key로 사용',
          description: `\`ProductCard\`는 내부에 수량 선택 state를 가지고 있습니다. key가 index라서 정렬 기준이나 검색 결과가 바뀌면, React는 **같은 자리의 컴포넌트를 재사용하고 state도 그대로** 둡니다.

- "A 상품 3개"를 골라 둔 뒤 이름순으로 바꾸면, 같은 자리에 온 다른 상품이 수량 3을 가진 것처럼 보입니다.
- 사용자가 고르지 않은 상품 · 수량이 장바구니에 담기는 주문 오류로 이어질 수 있습니다.`,
          suggestion: `데이터의 고유 id를 key로 씁니다.

\`\`\`tsx
{sorted.map((product) => (
  <ProductCard key={product.id} product={product} />
))}
\`\`\``,
        },
        {
          lines: [
            20,
            21,
          ],
          category: 'error-handling',
          severity: 'major',
          title: '로딩 · 실패 상태가 없고 에러 응답을 상품 목록으로 처리함',
          description: `- \`fetch\`는 503 같은 에러 응답에서도 reject하지 않습니다. \`res.ok\`를 확인하지 않아 에러 응답 body(예: \`{ "message": "..." }\`)가 \`products\`에 들어가고, 정렬 effect의 \`[...products]\`에서 에러가 나 Error Boundary가 없으면 화면 전체가 사라집니다.
- \`catch\`가 없어 네트워크 오류는 처리되지 않은 Promise 거부로 끝나고, 사용자는 아무 안내도 받지 못합니다.
- 조회 중 표시가 없어 결과가 없는 것인지 아직 불러오는 중인지 구분할 수 없습니다.`,
          suggestion: `\`res.ok\`를 확인해 실패를 throw하고, 로딩 · 에러 상태를 화면에 표현합니다. TanStack Query를 쓰면 \`isPending\` · \`isError\` · \`refetch\`를 그대로 활용할 수 있습니다.

\`\`\`tsx
if (!res.ok) throw new Error(\`상품 검색 실패 (\${res.status})\`);
\`\`\``,
        },
      ],
      question: {
        prompt: '이 코드에서 개선이 필요한 점을 모두 고르세요.',
        options: [
          {
            text: '검색어를 빠르게 바꾸면 늦게 도착한 이전 검색 결과가 화면에 남을 수 있다',
            correct: true,
          },
          {
            text: '정렬할 때 원본 `products` 배열을 직접 변경한다',
            correct: false,
          },
          {
            text: '정렬 결과를 별도 state로 두고 `useEffect`로 동기화해 렌더링이 한 번 더 일어난다',
            correct: true,
          },
          {
            text: '정렬 기준을 바꾸면 `ProductCard`의 수량 선택 값이 다른 상품에 붙는다',
            correct: true,
          },
          {
            text: '검색어 입력창과 정렬 선택에 레이블이 연결되어 있지 않다',
            correct: false,
          },
          {
            text: '로딩 · 실패 상태가 없고 503 응답 body가 상품 목록으로 처리된다',
            correct: true,
          },
        ],
      },
      improved: {
        language: 'tsx',
        filename: 'ProductSearch.tsx',
        source: `import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
}

type SortKey = 'price' | 'name';

async function searchProducts(keyword: string, signal: AbortSignal) {
  const q = encodeURIComponent(keyword);
  const res = await fetch(\`/api/products?q=\${q}\`, { signal });
  // fetch는 4xx · 5xx에서 reject하지 않으므로 직접 확인
  if (!res.ok) throw new Error(\`상품 검색 실패 (\${res.status})\`);
  return (await res.json()) as Product[];
}

export function ProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('price');

  // 검색어별로 캐시되므로 늦게 온 응답이 다른 검색어의 결과를 덮어쓰지 않음
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['products', keyword],
    queryFn: ({ signal }) => searchProducts(keyword, signal),
    placeholderData: keepPreviousData, // 새 결과가 올 때까지 이전 목록 유지
  });

  // 파생 값은 렌더링 중에 계산 (목록이 클 수 있어 useMemo)
  const sorted = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) =>
        sortKey === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
      ),
    [data, sortKey],
  );

  return (
    <div>
      <label>
        검색어
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </label>
      <label>
        정렬
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="price">낮은 가격순</option>
          <option value="name">이름순</option>
        </select>
      </label>
      {isPending && <p>불러오는 중...</p>}
      {isError && (
        <p role="alert">
          검색에 실패했습니다.{' '}
          <button type="button" onClick={() => refetch()}>
            다시 시도
          </button>
        </p>
      )}
      <ul>
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}`,
      },
      summary: `### 총평
검색 화면은 **입력이 빠르게 바뀌고 응답이 비동기로 온다**는 특성 때문에 문제가 겹치기 쉽습니다. 아래 순서로 확인하면 빠짐없이 리뷰할 수 있습니다.

1. 요청: 이전 요청을 취소하거나 무시하는가? 실패를 실패로 처리하는가?
2. 상태: state가 최소한인가? 계산할 수 있는 값을 복제하지 않았는가?
3. 렌더링: key가 데이터의 id인가? 로딩 · 에러 · 빈 상태가 있는가?

개선안처럼 서버 데이터를 TanStack Query에 맡기면 경쟁 상태 · 로딩 · 에러 처리를 직접 구현하지 않아도 되고, 컴포넌트에는 화면에 필요한 state(\`keyword\`, \`sortKey\`)만 남습니다.

### 리뷰 코멘트 작성 팁
"key가 index라서 이름순으로 바꾸면 \`ProductCard\`의 수량 state가 다른 상품에 붙습니다. \`product.id\`로 바꿔 주세요."처럼 **재현 방법과 영향**을 함께 적으면 작성자가 바로 이해하고 고칠 수 있습니다.`,
    },
  ],
};

export default content;
