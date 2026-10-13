// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { ReviewFrameworkContent } from '@/content/types';

const content: ReviewFrameworkContent = {
  patterns: [
    {
      id: 'vue-p-store-destructure',
      framework: 'vue',
      subFramework: 'Pinia',
      category: 'state',
      difficulty: 1,
      title: 'Pinia 스토어 · reactive 객체를 구조 분해해 반응성 상실',
      summary: '구조 분해는 그 순간의 값을 지역 변수에 복사할 뿐입니다. Pinia 스토어는 storeToRefs, reactive 객체는 toRefs 로 ref 를 꺼내야 화면이 따라 바뀝니다.',
      problem: `장바구니 요약 컴포넌트입니다. 상품을 삭제해도 목록과 합계가 그대로이고, 다른 화면에서 상품을 담아도 개수가 바뀌지 않습니다.

- Vue 의 반응성은 **속성을 읽는 순간**(Proxy 의 get) 의존성을 기록하고, 그 속성이 바뀌면 다시 그립니다. 구조 분해는 setup 이 실행될 때 속성을 한 번 읽어 **지역 변수에 복사**하는 것이라 이후 변경과 연결이 끊깁니다.
- \`totalPrice\` 같은 getter · 원시값은 그 시점의 숫자로 고정됩니다.
- \`items\` 같은 배열은 그 시점의 배열을 가리킵니다. 이 스토어의 \`addItem\` · \`removeItem\` 은 \`items\` 에 **새 배열을 대입**하므로, 컴포넌트는 교체되기 전의 옛 배열을 계속 봅니다.
- Pinia 스토어는 \`reactive\` 로 감싼 객체라 \`reactive\` 를 구조 분해할 때와 같은 문제가 생깁니다.`,
      before: {
        language: 'vue',
        filename: 'CartSummary.vue',
        source: `<script setup lang="ts">
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
// 스토어를 구조 분해: 지금 이 순간의 값만 지역 변수에 복사됨
const { items, totalPrice, removeItem } = cart;
</script>

<template>
  <section class="cart-summary">
    <h2>장바구니 {{ items.length }}개</h2>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }} × {{ item.quantity }}
        <button type="button" @click="removeItem(item.id)">삭제</button>
      </li>
    </ul>
    <p>합계 {{ totalPrice.toLocaleString() }}원</p>
  </section>
</template>`,
      },
      after: {
        language: 'vue',
        filename: 'CartSummary.vue',
        source: `<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
// state · getter 는 storeToRefs 로: 스토어와 연결된 ref 를 꺼냄
const { items, totalPrice } = storeToRefs(cart);
// action 은 스토어에 바인딩된 함수라 그대로 꺼내도 됨
const { removeItem } = cart;
</script>

<template>
  <!-- 템플릿에서는 최상위 ref 가 자동으로 풀려 .value 없이 사용 -->
  <section class="cart-summary">
    <h2>장바구니 {{ items.length }}개</h2>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }} × {{ item.quantity }}
        <button type="button" @click="removeItem(item.id)">삭제</button>
      </li>
    </ul>
    <p>합계 {{ totalPrice.toLocaleString() }}원</p>
  </section>
</template>`,
      },
      explanation: `### 개선 포인트
- \`storeToRefs(store)\` 는 스토어의 state 와 getter 만 골라 **스토어와 연결된 ref** 로 만들고 action 은 건너뜁니다. \`items.value\` 를 읽는 것은 \`cart.items\` 를 읽는 것과 같습니다.
- action 은 스토어에 바인딩된 함수라 스토어에서 바로 구조 분해해도 됩니다.
- 스토어 전체에 \`toRefs\` 를 쓰면 action 과 내부 속성까지 ref 로 감싸게 되므로 Pinia 에서는 \`storeToRefs\` 를 씁니다.
- 꺼낼 값이 몇 개 안 되면 구조 분해하지 않고 \`cart.items\`, \`cart.totalPrice\` 처럼 스토어를 통해 읽는 것도 좋은 방법입니다. 어느 스토어의 값인지 코드에서 바로 보입니다.

### reactive 객체와 컴포저블
컴포저블이 \`reactive\` 객체를 반환하면 호출하는 쪽에서 같은 실수를 하기 쉽습니다. \`toRefs\` 로 각 속성을 원본과 연결된 ref 로 바꿔 반환합니다.

\`\`\`typescript
export function usePager() {
  const state = reactive({ page: 1, size: 20 });
  const next = () => state.page++;
  return { ...toRefs(state), next }; // page · size 를 ref 로 반환
}

const { page, next } = usePager(); // 구조 분해해도 반응성 유지
\`\`\`

> \`defineProps\` 구조 분해는 Vue 3.5 부터 반응성이 유지됩니다(컴파일러가 \`props.x\` 접근으로 바꿔 줌). 3.4 이하에서는 실험적 옵션을 켜지 않는 한 반응성이 끊기고, 3.5 에서도 \`watch\` 에 넘길 때는 \`watch(() => count, ...)\` 처럼 getter 로 감싸야 합니다.`,
      checklist: [
        'Pinia 스토어나 `reactive` 객체를 그대로 구조 분해하고 있지 않은가?',
        'state · getter 는 `storeToRefs()` 로, action 은 스토어에서 바로 꺼내는가?',
        '컴포저블이 `reactive` 객체 대신 ref 묶음(또는 `toRefs` 결과)을 반환하는가?',
        '`watch` 에 원시값이 아닌 ref 나 getter 를 넘기는가?',
      ],
    },
    {
      id: 'vue-p-computed-over-watch',
      framework: 'vue',
      category: 'state',
      difficulty: 1,
      title: '파생 상태를 watch + ref 로 동기화',
      summary: '다른 상태로 계산할 수 있는 값을 ref 에 복사해 두고 watch 로 맞추면 초깃값 누락과 동기화 누락이 생깁니다. computed 로 선언합니다.',
      problem: `상품 목록 필터 컴포넌트입니다. 화면에 처음 들어오면 목록이 비어 있고, 부모가 새 상품 목록을 내려줘도 검색어를 다시 입력하기 전까지 화면이 바뀌지 않습니다.

- \`watch\` 는 기본적으로 감시 대상이 **바뀔 때만** 실행됩니다(\`immediate\` 없음). 검색어를 입력하기 전까지 \`filtered\` 는 빈 배열입니다.
- 감시 대상에 \`props.products\` 가 빠져 있어 부모가 목록을 바꿔도 다시 계산되지 않습니다. 의존하는 값을 사람이 직접 나열하는 방식이라 하나를 빠뜨리기 쉽습니다.
- 같은 정보가 원본(\`products\`)과 복사본(\`filtered\`, \`totalPrice\`) 두 곳에 있어서, 둘을 맞추는 코드가 늘어날수록 어긋날 지점도 늘어납니다.`,
      before: {
        language: 'vue',
        filename: 'ProductFilter.vue',
        source: `<script setup lang="ts">
import { ref, watch } from 'vue';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const props = defineProps<{ products: Product[] }>();
const keyword = ref('');
const onlyInStock = ref(false);

// 파생 값을 별도 ref 에 복사해 두고 watch 로 맞춤
const filtered = ref<Product[]>([]);
const totalPrice = ref(0);

watch([keyword, onlyInStock], () => {
  filtered.value = props.products.filter(
    (p) => p.name.includes(keyword.value) && (!onlyInStock.value || p.stock > 0),
  );
});

watch(filtered, (list) => {
  totalPrice.value = list.reduce((sum, p) => sum + p.price, 0);
});
</script>

<template>
  <input v-model="keyword" type="search" aria-label="상품명 검색" />
  <label><input v-model="onlyInStock" type="checkbox" /> 재고 있는 상품만</label>
  <p>{{ filtered.length }}개 · 합계 {{ totalPrice.toLocaleString() }}원</p>
  <ul>
    <li v-for="p in filtered" :key="p.id">{{ p.name }}</li>
  </ul>
</template>`,
      },
      after: {
        language: 'vue',
        filename: 'ProductFilter.vue',
        source: `<script setup lang="ts">
import { computed, ref } from 'vue';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const props = defineProps<{ products: Product[] }>();
const keyword = ref('');
const onlyInStock = ref(false);

// 읽은 값(keyword, onlyInStock, props.products)을 자동으로 추적
const filtered = computed(() =>
  props.products.filter(
    (p) => p.name.includes(keyword.value) && (!onlyInStock.value || p.stock > 0),
  ),
);

// 파생 값에서 다시 파생: 의존 값이 그대로면 캐시된 값을 재사용
const totalPrice = computed(() => filtered.value.reduce((sum, p) => sum + p.price, 0));
</script>

<template>
  <input v-model="keyword" type="search" aria-label="상품명 검색" />
  <label><input v-model="onlyInStock" type="checkbox" /> 재고 있는 상품만</label>
  <p>{{ filtered.length }}개 · 합계 {{ totalPrice.toLocaleString() }}원</p>
  <ul>
    <li v-for="p in filtered" :key="p.id">{{ p.name }}</li>
  </ul>
</template>`,
      },
      explanation: `### 개선 포인트
- \`computed\` 는 getter 안에서 읽은 반응형 값(\`keyword\`, \`onlyInStock\`, \`props.products\`)을 **자동으로 추적**합니다. 의존성을 나열할 필요가 없어 빠뜨릴 일도 없습니다.
- 처음 읽을 때 계산되므로 첫 렌더링부터 올바른 값이 나옵니다.
- 결과를 **캐시**합니다. 의존하는 값이 바뀌지 않으면 여러 번 읽어도 다시 계산하지 않습니다. 템플릿에서 \`filterProducts()\` 같은 메서드를 호출하면 렌더링할 때마다 다시 계산되는 것과 다릅니다.

### computed 와 watch 고르기
| 하고 싶은 일 | 선택 |
|---|---|
| 다른 상태로 계산되는 값 (필터 결과, 합계, 표시용 문자열) | \`computed\` |
| 값이 바뀌면 바깥에 일을 시킴 (API 호출, 저장, 로그) | \`watch\` |
| 비동기로 얻는 값 | \`watch\` + \`ref\` (\`computed\` 는 동기 값만) |

> \`computed\` getter 는 순수해야 합니다. 안에서 다른 상태를 바꾸거나 비동기 요청을 보내면 언제 실행될지 예측하기 어려워집니다. 린트 규칙 \`vue/no-side-effects-in-computed-properties\`, \`vue/no-async-in-computed-properties\` 로 잡을 수 있습니다.`,
      checklist: [
        '다른 상태 · props 로 계산할 수 있는 값을 별도 `ref` 에 복사하고 있지 않은가?',
        '`watch` 콜백이 하는 일이 다른 ref 에 값을 대입하는 것뿐이지 않은가?',
        '`computed` getter 안에서 상태 변경이나 비동기 호출 같은 부수 효과를 하지 않는가?',
        '`watch` 는 API 호출 · 저장 · 로그처럼 바깥에 영향을 주는 일에만 쓰는가?',
      ],
    },
  ],
  challenges: [
    {
      id: 'vue-c01',
      framework: 'vue',
      difficulty: 1,
      title: '장바구니 목록 컴포넌트 리뷰',
      context: `장바구니 페이지의 목록 컴포넌트입니다.

- 부모 페이지가 Pinia 스토어의 \`items\` 를 props 로 내려줍니다. 품절 상품은 목록에서 숨기고 합계에서도 뺍니다.
- \`CartItemRow\` 는 수량 입력값을 **내부 상태(ref)** 로 들고 있다가 "변경" 버튼을 누르면 \`change-quantity\` 이벤트를 보냅니다.
- 스토어는 수량을 바꿀 때 해당 항목의 \`quantity\` 만 바꾸고, 삭제할 때는 \`items\` 에 새 배열을 대입합니다.
- 환경: Vue 3.4, TypeScript, Pinia`,
      code: {
        language: 'vue',
        filename: 'CartList.vue',
        source: `<script setup lang="ts">
import { ref, watch } from 'vue';
import CartItemRow from './CartItemRow.vue';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  soldOut: boolean;
}

const props = defineProps<{ items: CartItem[] }>();
const emit = defineEmits<{
  remove: [id: number];
  changeQuantity: [id: number, quantity: number];
  checkout: [];
}>();

const totalPrice = ref(0);

watch(
  () => props.items,
  (items) => {
    totalPrice.value = items
      .filter((item) => !item.soldOut)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
);
</script>

<template>
  <section class="cart">
    <h2>장바구니</h2>
    <ul>
      <CartItemRow
        v-for="(item, index) in items"
        v-if="!item.soldOut"
        :key="index"
        :item="item"
        @change-quantity="emit('changeQuantity', item.id, $event)"
        @remove="emit('remove', item.id)"
      />
    </ul>
    <p class="total">합계 {{ totalPrice.toLocaleString() }}원</p>
    <button type="button" :disabled="totalPrice === 0" @click="emit('checkout')">
      주문하기
    </button>
  </section>
</template>`,
      },
      issues: [
        {
          lines: [
            37,
            38,
          ],
          category: 'performance',
          severity: 'critical',
          title: 'v-for 와 v-if 를 같은 요소에 사용',
          description: `Vue 3 에서는 같은 요소에 있으면 **\`v-if\` 가 \`v-for\` 보다 먼저** 평가됩니다(Vue 2 와 반대).

- \`v-if\` 를 평가하는 시점에는 \`item\` 이 아직 정의되지 않아 TypeError 가 나고, 목록 렌더링이 실패합니다.
- 우선순위가 직관적이지 않아 읽는 사람도 어느 쪽이 먼저인지 헷갈립니다. Vue 스타일 가이드와 \`vue/no-use-v-if-with-v-for\` 린트 규칙도 금지하는 패턴입니다.`,
          suggestion: `보여 줄 목록을 \`computed\` 로 미리 걸러 \`v-for\` 에 넘깁니다. 렌더링할 때마다 거르지 않고, 원본이 바뀔 때만 다시 계산됩니다.

\`\`\`typescript
const visibleItems = computed(() => props.items.filter((item) => !item.soldOut));
\`\`\`

항목마다 표시 조건이 달라 미리 거르기 어렵다면 \`<template v-for>\` 로 감싸고 안쪽 요소에 \`v-if\` 를 둡니다.`,
        },
        {
          lines: [
            39,
          ],
          category: 'state',
          severity: 'major',
          title: 'index 를 key 로 써서 행의 내부 상태가 다른 상품에 붙음',
          description: `Vue 는 key 가 같은 요소 · 컴포넌트를 **같은 것으로 보고 재사용**합니다.

- 두 번째 상품을 삭제하면 세 번째 상품이 index 1 이 되어, 두 번째 상품이 쓰던 \`CartItemRow\` 인스턴스를 물려받습니다.
- props(\`item\`)는 새 상품으로 바뀌지만 \`CartItemRow\` 내부의 수량 입력값(ref)은 그대로 남아, **다른 상품의 수량이 입력된 채로** 보입니다. 이 상태에서 "변경"을 누르면 엉뚱한 수량이 저장됩니다.
- 품절 여부가 바뀌어 목록 구성이 달라질 때도 같은 문제가 생깁니다.`,
          suggestion: `항목마다 고유하고 바뀌지 않는 값(상품 id)을 key 로 씁니다.

\`\`\`vue
<CartItemRow v-for="item in visibleItems" :key="item.id" :item="item" />
\`\`\`

index key 는 순서가 바뀌지 않고 각 항목에 상태가 없는 정적 목록에서만 안전합니다.`,
        },
        {
          lines: [
            20,
            22,
            23,
          ],
          category: 'state',
          severity: 'major',
          title: '파생 값인 합계를 watch + ref 로 관리',
          description: `합계는 \`items\` 로 계산할 수 있는 **파생 값**인데 별도 ref 에 복사해 두고 \`watch\` 로 맞추고 있습니다.

- \`immediate\` 가 없어 첫 렌더링에 합계가 0원이고, 그래서 "주문하기" 버튼도 비활성화된 채로 시작합니다.
- getter(\`() => props.items\`)는 배열 **참조**가 바뀔 때만 콜백을 실행합니다. 스토어가 항목의 \`quantity\` 만 바꾸면 배열은 그대로라 합계가 갱신되지 않습니다.`,
          suggestion: `\`computed\` 로 바꾸면 처음부터 계산되고, 읽은 모든 반응형 값(배열, 각 항목의 \`price\` · \`quantity\` · \`soldOut\`)을 자동으로 추적합니다.

\`\`\`typescript
const totalPrice = computed(() =>
  visibleItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);
\`\`\``,
        },
      ],
      question: {
        prompt: '이 코드에서 개선이 필요한 점을 모두 고르세요.',
        options: [
          {
            text: '`v-for` 와 `v-if` 를 같은 요소에 써서 Vue 3 에서 렌더링 오류가 난다',
            correct: true,
          },
          {
            text: '자식 컴포넌트에서 `props.items` 를 직접 변경해 단방향 데이터 흐름을 어긴다',
            correct: false,
          },
          {
            text: '삭제할 때 index key 때문에 행 컴포넌트의 내부 상태가 다른 상품에 붙는다',
            correct: true,
          },
          {
            text: '`defineEmits` 에 타입이 없어 잘못된 인자를 넘겨도 알 수 없다',
            correct: false,
          },
          {
            text: '합계를 `watch` + `ref` 로 관리해 첫 렌더링과 수량 변경이 반영되지 않는다',
            correct: true,
          },
          {
            text: '상품명을 `v-html` 로 출력해 XSS 위험이 있다',
            correct: false,
          },
        ],
      },
      improved: {
        language: 'vue',
        filename: 'CartList.vue',
        source: `<script setup lang="ts">
import { computed } from 'vue';
import CartItemRow from './CartItemRow.vue';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  soldOut: boolean;
}

const props = defineProps<{ items: CartItem[] }>();
const emit = defineEmits<{
  remove: [id: number];
  changeQuantity: [id: number, quantity: number];
  checkout: [];
}>();

// 보여 줄 목록은 미리 걸러 둠 (템플릿에서 v-if 로 거르지 않음)
const visibleItems = computed(() => props.items.filter((item) => !item.soldOut));

// 파생 값은 computed: 첫 렌더링부터 계산되고 수량 변경도 추적
const totalPrice = computed(() =>
  visibleItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);
</script>

<template>
  <section class="cart">
    <h2>장바구니</h2>
    <ul>
      <!-- 고유 id 를 key 로: 삭제 · 재정렬에도 행 상태가 제자리를 지킴 -->
      <CartItemRow
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        @change-quantity="emit('changeQuantity', item.id, $event)"
        @remove="emit('remove', item.id)"
      />
    </ul>
    <p class="total">합계 {{ totalPrice.toLocaleString() }}원</p>
    <button type="button" :disabled="totalPrice === 0" @click="emit('checkout')">
      주문하기
    </button>
  </section>
</template>`,
      },
      summary: `### 총평
리스트를 그리는 컴포넌트는 세 가지를 확인하면 대부분의 문제를 잡을 수 있습니다.

1. **무엇을 그리는가**: 걸러낸 목록은 \`computed\` 로 만들고, \`v-for\` 와 \`v-if\` 를 한 요소에 두지 않습니다.
2. **어떻게 식별하는가**: key 는 데이터의 고유 id 로 지정합니다. 행 컴포넌트에 내부 상태가 있다면 특히 중요합니다.
3. **무엇을 계산하는가**: 합계 · 개수 같은 파생 값은 상태로 복사하지 않고 \`computed\` 로 선언합니다.

### 리뷰 코멘트 작성 팁
key 문제는 **재현 순서**를 적어 주면 작성자가 바로 이해합니다. 예: "두 번째 상품을 지우면 세 번째 행에 두 번째 상품의 수량 입력값이 남습니다. \`:key="item.id"\` 로 바꾸면 해결됩니다."`,
    },
  ],
};

export default content;
