# 콘텐츠 작성 가이드

앱의 학습 콘텐츠는 TypeScript 파일로 번들에 포함됩니다.
전체 콘텐츠는 **비공개 저장소 `to-jump-content`** 에서 작성하고, `npm run content:sync` 로 앱의 `src/content/data/` 에 가져옵니다.
(공개 저장소에는 `src/content/sample/` 의 샘플만 있습니다.)
타입 정의는 [`src/content/types.ts`](../src/content/types.ts)에 있습니다. 콘텐츠 파일은 `import type { … } from '@/content/types'` 로 타입을 가져옵니다.

| 콘텐츠 | 비공개 저장소 경로 |
| --- | --- |
| 알고리즘 토픽 개념 + 퀴즈 | `algorithm/quiz/<토픽 id>.ts` |
| 알고리즘 문제 유형 + 구현 예제 | `algorithm/patterns/<유형 id>.ts` (파일 1개 = 유형 1개) |
| CS 퀴즈 + 면접 카드 | `cs/<카테고리 id>.ts` |
| 코드 리뷰 패턴 + 리뷰 퀴즈 | `review/<spring\|nest\|django>.ts` |
| 코드 리뷰의 다른 언어 버전 (Spring Boot Kotlin) | `review/spring-kotlin.ts` = `spring-kotlin-patterns.ts` + `spring-kotlin-challenges.ts` |

CS 카테고리를 새로 만들면 앱의 `src/content/cs/categories.ts` 에 등록하고, `src/content/index.ts` 의 `CS_CONTENT` 에도 추가합니다. 언어 카테고리(`group: 'language'`, 예: Kotlin)라면 같은 파일의 `FRAMEWORK_LANGUAGE_CATEGORIES` 에서 그 언어를 쓰는 프레임워크에 넣어야 오늘의 퀴즈에 나옵니다. 빠뜨리면 `npm test` 가 실패합니다.

콘텐츠를 추가/수정한 뒤에는 반드시 동기화하고 검증 스크립트를 실행하세요.

```bash
npm run content:sync        # 비공개 콘텐츠 → src/content/data
npm run validate            # 구조 검증 + 알고리즘 구현 예제 실행 검증(Python/JS/Java/Kotlin/C++)
npm run validate -- --quick # 구조 검증만
```

## 1. 공통 원칙

- **한국어**로 작성합니다. 기술 용어는 실무에서 쓰는 표기를 따릅니다. (예: 트랜잭션, 인덱스, 커넥션 풀)
  처음 등장하는 용어는 필요하면 영문을 괄호로 병기합니다. 예: 격리 수준(Isolation Level)
- 문장은 `~합니다/~입니다` 체를 사용합니다. 면접 모범 답변은 실제로 말하듯 자연스럽게 씁니다.
- 사실 관계가 정확해야 합니다. 버전에 따라 달라지는 내용은 버전을 명시합니다. (예: Java 21의 가상 스레드)
- 외부 문제 사이트(프로그래머스, 백준, LeetCode 등)의 지문을 복제하지 않습니다. 모든 지문은 직접 창작합니다.
- ID는 전역에서 유일해야 합니다.

## 2. RichText (markdown-lite) 문법

`RichText`로 표시된 필드는 아래 문법만 지원합니다. 지원하지 않는 문법은 그대로 글자로 보입니다.

| 문법 | 예시 | 설명 |
| --- | --- | --- |
| 문단 | 빈 줄로 구분 | 문단 안의 줄바꿈은 그대로 줄바꿈 |
| 굵게 | `**중요**` | |
| 인라인 코드 | `` `HashMap` `` | |
| 글머리 목록 | `- 항목` | 줄 맨 앞, 중첩 불가 |
| 번호 목록 | `1. 항목` | 줄 맨 앞, 중첩 불가 |
| 소제목 | `### 제목` | `###`만 지원 |
| 팁 박스 | `> 내용` | 연속된 `>` 줄은 하나의 박스 |
| 코드 블록 | ` ```java ` ... ` ``` ` | 언어: java, kotlin, python, cpp, javascript, typescript, sql, json, yaml, bash, text |
| 표 | `\| a \| b \|` + `\|---\|---\|` | 헤더 1줄 + 구분선 + 본문 (셀 안에는 인라인 문법만) |

**지원하지 않는 문법**: 링크, 이미지, 기울임(`*a*`), 중첩 목록, HTML, `#`/`##` 제목.

선택지(`choices`), 체크리스트, 제한사항(`constraints`), 키워드처럼 한 줄짜리 필드는 **인라인 문법(굵게, 인라인 코드)만** 사용합니다.

### TypeScript 문자열 작성 요령

- 여러 줄 텍스트와 코드는 템플릿 리터럴(백틱)로 작성합니다.
- 템플릿 리터럴 안에서 백틱은 `` \` ``, `${`는 `\${`로 이스케이프합니다.
- 코드(`source`, `solutions`)는 **들여쓰기 없이 첫 열부터** 작성합니다. 앞뒤 공백 줄은 화면에서 자동으로 제거됩니다.

```ts
explanation: `정렬 후 **투 포인터**로 탐색합니다.

- 왼쪽 포인터는 가장 작은 값
- 오른쪽 포인터는 가장 큰 값

\`\`\`python
nums.sort()
\`\`\``,
```

## 3. 퀴즈 (QuizQuestion)

- `mcq`: 선택지 4개를 권장(2~5개). 정답은 `answer`(0부터 시작하는 인덱스).
  - 정답 위치가 한쪽으로 쏠리지 않게 골고루 분포시킵니다.
  - "모두 정답", "정답 없음" 같은 선택지는 피합니다.
  - 오답도 그럴듯해야 합니다(실제로 자주 하는 오해를 오답으로).
- `ox`: `answer: true`는 O(맞는 설명), `false`는 X.
- `explanation`에는 정답 이유와 **오답이 왜 틀렸는지**를 함께 적습니다. 2~6문장 + 필요하면 목록/코드.
- 난이도: 1(신입 기본기) · 2(실무/중급) · 3(심화/경력).

## 4. 면접 질문 카드 (InterviewCard)

- `question`: 실제 면접에서 나오는 형태의 질문. 예: "프로세스와 스레드의 차이를 설명해주세요."
- `answer`: 30초~1분 분량으로 말할 수 있는 모범 답변. 핵심 → 근거 → 실무 예시 순서를 권장합니다.
- `keywords`: 답변에 반드시 들어가야 할 키워드 3~6개.
- `followUps`: 실제로 이어질 법한 꼬리 질문 1~3개.

## 5. 코드 리뷰

- **ReviewPattern(개선 패턴 학습)**: 실무 코드 리뷰에서 자주 지적되는 패턴 하나에 집중합니다.
  `before`/`after` 코드는 15~45줄 내외로, 핵심이 드러나도록 작성합니다.
- **ReviewChallenge(리뷰 실전 퀴즈)**: 실제 서비스 코드처럼 보이는 30~70줄 코드에 2~4개의 이슈를 숨깁니다.
  - `issues[].lines`는 `code.source` 기준 1부터 시작하는 라인 번호이며, 검증 스크립트가 범위를 확인합니다.
  - `question.options`는 5~6개, 그중 정답(`correct: true`) 2~4개. 오답 선택지는 코드에 실제로 없는 문제여야 합니다.
  - `improved`는 모든 이슈를 해결한 베스트 개선안입니다.

### 5-1. 다른 언어 버전 (Spring Boot 의 Kotlin)

Spring Boot 리뷰 콘텐츠는 Java(기본)와 Kotlin 두 언어로 제공합니다. 앱에서는 코드 언어를 바꾸면 코드와 설명이 함께 바뀌고, 학습 기록은 언어와 관계없이 하나로 유지됩니다.

- Kotlin 버전은 `review/spring-kotlin.ts`(`ReviewVariantContent`)에 패턴 · 리뷰 퀴즈 **id 별로** 작성합니다. `review/spring.ts`의 모든 항목에 Kotlin 버전이 있어야 합니다(검증 스크립트가 확인).
- **코드는 반드시 Kotlin 으로 새로** 씁니다. 설명(`problem`, `explanation`, `checklist`, 이슈 `description`/`suggestion`, `summary` 등)은 **Kotlin 에서 달라지는 것만** 덮어쓰고, 나머지는 Java 버전을 그대로 씁니다.
  - Java 코드 블록(` ```java `)이나 Java 전용 표현(Lombok, `final` 필드, `Optional.get()` 등)이 들어 있는 설명은 Kotlin 버전에서 덮어씁니다. 덮어쓰지 않은 필드에 Java 코드 블록이 있으면 검증 스크립트가 오류를 냅니다.
  - 제목(`title`)과 요약(`summary`)도 Java 전용 표현이 있으면 덮어씁니다. 목록 화면에도 선택한 언어의 제목이 보입니다.
- 리뷰 퀴즈의 `issues`는 Java 버전과 **같은 순서 · 같은 개수**로 작성하고, `lines`는 Kotlin `code` 기준 줄 번호입니다. 숨긴 문제 자체는 Java 버전과 같아야 합니다(같은 개념을 언어만 바꿔 연습).
- Kotlin 코드 기준: Spring Boot 3.x, Kotlin 1.9+, `kotlin-spring`(all-open) · `kotlin-jpa`(no-arg) 플러그인을 적용한 일반적인 프로젝트.
  - 의존성은 주 생성자의 `private val`로 주입합니다. Lombok 은 쓰지 않습니다.
  - Spring Data 조회는 `findByIdOrNull` + `?: throw` 처럼 Kotlin 다운 null 처리를 씁니다. (개선 전 코드에서는 의도적으로 `!!`, `Optional.get()` 등을 쓸 수 있음)
  - JPA 엔티티는 `data class`가 아닌 일반 `class`로 쓰고, DTO 는 `data class`로 씁니다.
  - Kotlin 문자열 템플릿의 `${…}` 는 TypeScript 템플릿 리터럴 안에서 `\${…}` 로 이스케이프합니다(`$id` 형태는 그대로 써도 됩니다). 코드 안의 `\n` 같은 백슬래시는 `\\n` 처럼 두 번 씁니다.

## 6. 알고리즘 문제 유형 · 구현 예제 (AlgoPattern)

알고리즘 토픽마다 **이론(개념 정리, `algorithm/quiz/<토픽>.ts` 의 `primer`) → 자주 출제되는 문제 유형 → 유형별 구현 예제** 순서로 공부합니다. 사용자가 코드를 직접 실행하지 않으므로, 예제 코드는 읽고 비교하며 배우기 좋게 작성하고 **작성자가 실행해서 검증**합니다.

### 구성
- 유형 1개 = 파일 1개: `algorithm/patterns/<토픽 id>-<이름>.ts`, `export default` 로 `AlgoPattern` 하나를 내보냅니다. 토픽 안 순서는 `order`(1부터)로 정합니다.
- 토픽마다 유형 2~4개를 둡니다. 이론만 있는 토픽(시간 복잡도)은 유형이 없어도 됩니다.
- `whenToUse`: 문제에서 이 유형을 알아보는 신호 2~4개 (예: "정렬된 배열", "~ 이상이 되는 최솟값")
- `approach`: 접근 방법. 왜 이 방법이 맞는지, 핵심 불변식이 무엇인지 설명합니다.
- `example`: 유형을 대표하는 **짧은 예제 문제**. 모든 구현 예제가 이 문제의 `solution` 함수를 구현합니다.
  - `examples`(화면에 보임, 1~3개)와 `tests`(검증용, 5개 이상)를 둡니다. 경계값(최소 입력, 중복, 음수, 답이 없는 경우)을 넣고, 데이터는 작게 유지합니다.
  - 지문은 직접 창작합니다. 외부 문제 사이트 지문을 옮기지 않습니다.
- `implementations`: 접근 방식이 다른 구현 **2~3개** (예: 재귀 vs 반복, 완전 탐색 vs 최적화, 정렬 + 투 포인터 vs 해시). 의미 있는 변형이 없으면 1개만 둡니다. 같은 알고리즘의 언어만 다른 버전은 변형이 아닙니다.
  - `code`: **5개 언어(Python · JavaScript · Java · Kotlin · C++) 모두 필수**입니다. 형식은 아래 "코드 형식"을 따릅니다.
  - `keyPoints`: 핵심 구현 해설 2~5개. 자료구조 선택, 경계 조건, 복잡도를 좌우하는 줄, 언어별 함정(오버플로, 정수 나눗셈 등)을 코드 줄에 연결해 설명합니다.
  - `keyPoints[].lines`: **언어마다 줄 번호가 다르므로 언어별로 지정**합니다. 빈 줄 · 닫는 괄호만 있는 줄은 가리키지 않습니다.
- `pitfalls`(선택): 자주 하는 실수. `quizIds`(선택): 같은 토픽의 관련 개념 퀴즈 id.

### 코드 형식
프로그래머스 스타일의 `solution` 함수 형식을 사용합니다. 예제 문제의 `signature` 타입은 언어별로 다음과 같이 대응합니다.

| ValueType | Python | JavaScript | Java | Kotlin | C++ |
| --- | --- | --- | --- | --- | --- |
| `int` | int | number | int | Int | int |
| `long` | int | number | long | Long | long long |
| `double` | float | number | double | Double | double |
| `bool` | bool | boolean | boolean | Boolean | bool |
| `string` | str | string | String | String | string |
| `int[]` | list[int] | number[] | int[] | IntArray | vector&lt;int&gt; |
| `long[]` | list[int] | number[] | long[] | LongArray | vector&lt;long long&gt; |
| `double[]` | list[float] | number[] | double[] | DoubleArray | vector&lt;double&gt; |
| `bool[]` | list[bool] | boolean[] | boolean[] | BooleanArray | vector&lt;bool&gt; |
| `string[]` | list[str] | string[] | String[] | Array&lt;String&gt; | vector&lt;string&gt; |
| `int[][]` | list[list[int]] | number[][] | int[][] | Array&lt;IntArray&gt; | vector&lt;vector&lt;int&gt;&gt; |
| `string[][]` | list[list[str]] | string[][] | String[][] | Array&lt;Array&lt;String&gt;&gt; | vector&lt;vector&lt;string&gt;&gt; |

- 함수 형식
  - Python: `def solution(...):` (보조 함수는 같은 파일에 정의)
  - JavaScript: `function solution(...) { }`
  - Java: `class Solution { public <반환타입> solution(...) { } }` (필요한 `import`는 맨 위에)
  - Kotlin: `class Solution { fun solution(...): <반환타입> { } }` (필요한 `import`는 맨 위에, `main` 함수 없이)
  - C++: `#include` + `using namespace std;` + `<반환타입> solution(...) { }`
- `long` 값은 JavaScript 안전 정수 범위(±9,007,199,254,740,991)를 넘지 않게 합니다.
- 코딩 테스트 사이트의 컴파일러 버전이 낮은 경우가 많아 **Java 15 · Kotlin 1.8 · JDK 8** 에서도 컴파일되는 문법만 씁니다.
  - Kotlin 1.9 이후 문법(`..<`, enum 의 `entries`, `data object`)과 JDK 9 이후 API(`List.of`, `Stream.toList()` 등)는 쓰지 않습니다. 범위는 `until`, 컬렉션은 Kotlin 표준 함수(`listOf`, `mutableListOf`)를 씁니다.
  - `java.util.PriorityQueue` 처럼 Java 클래스를 쓰면 `import` 를 명시합니다. (Kotlin 의 `ArrayDeque` 는 import 없이 쓸 수 있음)
  - 그 버전으로 직접 검증하려면 `KOTLINC=<kotlinc-1.8 경로> KOTLIN_JAVA_HOME=<JDK 8 경로> npm run validate`
- 예제 테스트 데이터도 앱 번들에 포함되므로 작게 유지합니다. `compare: 'unordered'`는 1차원 배열 반환에서 순서를 무시할 때만 사용합니다.

### 코드 작성 원칙
- 코딩 테스트에서 실제로 쓰는 관용적인 형태로 씁니다. 표준 라이브러리를 쓰고, 입출력은 `solution` 함수 형태로 통일합니다.
- 5개 언어의 **로직 · 함수 이름 · 변수 이름을 가능한 한 대응**시킵니다. 함수 순서도 맞춥니다(C++ 는 보조 함수를 `solution` 위에 둡니다). Python 은 snake_case, 나머지는 camelCase 를 씁니다.
- 주석은 한국어로, 핵심 줄에만 짧게 답니다. 해설은 `keyPoints` 에 씁니다.
- 한 줄은 100자 안쪽으로 씁니다. (휴대폰에서는 가로 스크롤 또는 줄바꿈으로 봅니다)

### 검증
```bash
npm run content:sync
npx tsx scripts/show-pattern.ts <유형 id> --lines   # 핵심 해설이 언어마다 맞는 줄을 가리키는지 확인
npm run validate -- --section patterns --only <토픽 id 또는 유형 id>   # 구조 검증 + 모든 구현을 5개 언어로 실행
```
비공개 저장소 폴더를 직접 검증하려면 `TJ_CONTENT_DATA=../to-jump-content` 를 앞에 붙입니다.
