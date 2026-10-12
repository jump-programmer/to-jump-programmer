// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'binary-search-parametric-min',
  topicId: 'binary-search',
  order: 2,
  title: '파라메트릭 서치 — 조건을 만족하는 최솟값',
  summary: '"최솟값은?"을 "이 값이면 가능한가?"로 바꾸고, 가능해지는 첫 값을 답의 범위에서 이분 탐색합니다.',
  difficulty: 2,
  whenToUse: [
    '"조건을 만족하는 **최솟값**", "최소 얼마 이상이어야 하는가" 같은 표현이 있을 때',
    '답을 하나 정하면 **가능 / 불가능**을 쉽게 판정할 수 있고, 답이 커질수록 가능해지기만 할 때',
    '답의 범위가 10⁹ 처럼 커서 하나씩 시도할 수 없을 때',
  ],
  approach: `"적재 한도를 **최소** 얼마로 해야 하는가"를 바로 계산하기는 어렵습니다. 대신 질문을 뒤집어 **"한도가 C 이면 trips 번 안에 옮길 수 있는가?"** 라고 물으면, 앞에서부터 꽉 채워 실어 보는 것만으로 O(N)에 답할 수 있습니다.

이 판정의 답은 C 가 커질수록 **불가능 → 가능**으로 딱 한 번만 바뀝니다. 한도가 클수록 운항 횟수는 줄거나 같기 때문입니다. 예제 1(\`[3, 2, 5, 4, 1, 6]\`, trips = 3)에서는 다음과 같습니다.

| C | 7 | 8 | 9 | 10 |
|---|---|---|---|---|
| 운항 횟수 | 4 | 4 | 3 | 3 |
| 가능? | F | F | **T** | T |

그래서 답의 범위 \`[max(weights), sum(weights)]\` 에서 **처음 T 가 되는 C** 를 이분 탐색으로 찾습니다. 이것이 파라메트릭 서치(Parametric Search)입니다. 판정 O(N)을 log(무게 합)번 하므로 전체 O(N log S)입니다.

구현은 "정렬된 배열에서 경계 찾기"와 같은 두 템플릿으로 합니다. 배열 원소 대신 **판정 함수의 결과**를 보고 범위를 좁힌다는 점만 다릅니다.`,
  example: {
    description: `차량들이 줄 선 순서대로 무게 \`weights\` 가 주어집니다. 배는 **줄 선 순서대로만** 차량을 싣고, 한 번 운항할 때 실은 무게 합이 적재 한도 이하여야 합니다(차량을 나눠 실을 수는 없습니다). 최대 \`trips\` 번 운항해 모든 차량을 옮기려면 적재 한도가 **최소** 얼마여야 하는지 return 하세요.

- \`weights\` 의 길이는 1 이상 50,000 이하, 원소는 1 이상 10,000 이하의 정수입니다.
- \`trips\` 는 1 이상 \`weights\` 의 길이 이하입니다.`,
    signature: {
      params: [
        {
          name: 'weights',
          type: 'int[]',
        },
        {
          name: 'trips',
          type: 'int',
        },
      ],
      returns: 'int',
    },
    examples: [
      {
        input: [
          [
            3,
            2,
            5,
            4,
            1,
            6,
          ],
          3,
        ],
        output: 9,
      },
      {
        input: [
          [
            7,
            7,
            7,
          ],
          1,
        ],
        output: 21,
      },
      {
        input: [
          [
            4,
            9,
            2,
            8,
          ],
          4,
        ],
        output: 9,
      },
    ],
    tests: [
      {
        input: [
          [
            5,
          ],
          1,
        ],
        output: 5,
      },
      {
        input: [
          [
            1,
            1,
            1,
            1,
            1,
          ],
          5,
        ],
        output: 1,
      },
      {
        input: [
          [
            1,
            1,
            1,
            1,
            1,
          ],
          1,
        ],
        output: 5,
      },
      {
        input: [
          [
            1,
            1,
            10000,
            1,
            1,
          ],
          2,
        ],
        output: 10002,
      },
      {
        input: [
          [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
          ],
          5,
        ],
        output: 15,
      },
      {
        input: [
          [
            9,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            9,
          ],
          3,
        ],
        output: 9,
      },
      {
        input: [
          [
            12,
            11,
            12,
            5,
            11,
            4,
            15,
            19,
            13,
            6,
            11,
            17,
          ],
          4,
        ],
        output: 35,
      },
      {
        input: [
          [
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
            10000,
          ],
          3,
        ],
        output: 70000,
      },
    ],
  },
  implementations: [
    {
      title: '`lo < hi` + 가능하면 `hi = mid`',
      summary: '정답이 항상 `[lo, hi]` 안에 있도록 좁히다가 `lo == hi` 가 되면 그 값이 답입니다. primer 의 파라메트릭 서치 템플릿과 같습니다.',
      complexity: {
        time: 'O(N log S)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(weights, trips):
    lo = max(weights)  # 가장 무거운 차량은 실을 수 있어야 한다
    hi = sum(weights)  # 한 번에 모두 싣는 경우 — 항상 가능
    while lo < hi:
        mid = (lo + hi) // 2
        if trips_needed(weights, mid) <= trips:
            hi = mid  # mid 로 가능하면 더 작은 한도도 시도
        else:
            lo = mid + 1  # 불가능하면 mid 이하는 모두 불가능
    return lo


# 적재 한도가 capacity 일 때 필요한 운항 횟수
def trips_needed(weights, capacity):
    count = 1
    load = 0
    for w in weights:
        if load + w > capacity:  # 이 차량은 다음 운항으로
            count += 1
            load = 0
        load += w
    return count
`,
        javascript: `function solution(weights, trips) {
    let lo = 0;
    let hi = 0;
    for (const w of weights) {
        lo = Math.max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
        hi += w; // 한 번에 모두 싣는 경우 — 항상 가능
    }
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (tripsNeeded(weights, mid) <= trips) {
            hi = mid; // mid 로 가능하면 더 작은 한도도 시도
        } else {
            lo = mid + 1; // 불가능하면 mid 이하는 모두 불가능
        }
    }
    return lo;
}

// 적재 한도가 capacity 일 때 필요한 운항 횟수
function tripsNeeded(weights, capacity) {
    let count = 1;
    let load = 0;
    for (const w of weights) {
        if (load + w > capacity) { // 이 차량은 다음 운항으로
            count++;
            load = 0;
        }
        load += w;
    }
    return count;
}
`,
        java: `class Solution {
    public int solution(int[] weights, int trips) {
        int lo = 0;
        int hi = 0;
        for (int w : weights) {
            lo = Math.max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
            hi += w; // 한 번에 모두 싣는 경우 — 항상 가능
        }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (tripsNeeded(weights, mid) <= trips) {
                hi = mid; // mid 로 가능하면 더 작은 한도도 시도
            } else {
                lo = mid + 1; // 불가능하면 mid 이하는 모두 불가능
            }
        }
        return lo;
    }

    // 적재 한도가 capacity 일 때 필요한 운항 횟수
    private int tripsNeeded(int[] weights, int capacity) {
        int count = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > capacity) { // 이 차량은 다음 운항으로
                count++;
                load = 0;
            }
            load += w;
        }
        return count;
    }
}
`,
        kotlin: `class Solution {
    fun solution(weights: IntArray, trips: Int): Int {
        var lo = 0
        var hi = 0
        for (w in weights) {
            lo = maxOf(lo, w) // 가장 무거운 차량은 실을 수 있어야 한다
            hi += w // 한 번에 모두 싣는 경우 — 항상 가능
        }
        while (lo < hi) {
            val mid = lo + (hi - lo) / 2
            if (tripsNeeded(weights, mid) <= trips) {
                hi = mid // mid 로 가능하면 더 작은 한도도 시도
            } else {
                lo = mid + 1 // 불가능하면 mid 이하는 모두 불가능
            }
        }
        return lo
    }

    // 적재 한도가 capacity 일 때 필요한 운항 횟수
    private fun tripsNeeded(weights: IntArray, capacity: Int): Int {
        var count = 1
        var load = 0
        for (w in weights) {
            if (load + w > capacity) { // 이 차량은 다음 운항으로
                count++
                load = 0
            }
            load += w
        }
        return count
    }
}
`,
        cpp: `#include <algorithm>
#include <vector>

using namespace std;

// 적재 한도가 capacity 일 때 필요한 운항 횟수
int tripsNeeded(const vector<int>& weights, int capacity) {
    int count = 1;
    int load = 0;
    for (int w : weights) {
        if (load + w > capacity) { // 이 차량은 다음 운항으로
            count++;
            load = 0;
        }
        load += w;
    }
    return count;
}

int solution(vector<int> weights, int trips) {
    int lo = 0;
    int hi = 0;
    for (int w : weights) {
        lo = max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
        hi += w; // 한 번에 모두 싣는 경우 — 항상 가능
    }
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (tripsNeeded(weights, mid) <= trips) {
            hi = mid; // mid 로 가능하면 더 작은 한도도 시도
        } else {
            lo = mid + 1; // 불가능하면 mid 이하는 모두 불가능
        }
    }
    return lo;
}
`,
      },
      keyPoints: [
        {
          title: '판정 함수: 앞에서부터 꽉 채우기',
          explanation: '한도가 정해지면 앞에서부터 실을 수 있을 만큼 싣다가, 다음 차량이 넘치면 출항시키고 새로 싣습니다. 더 실을 수 있는데 일찍 출항해서 이득을 보는 경우는 없으므로 이 그리디가 운항 횟수를 최소로 만듭니다. 차량을 한 번씩 보므로 O(N)입니다.',
          lines: {
            python: [
              18,
              19,
              20,
              21,
            ],
            javascript: [
              24,
              25,
              26,
              28,
            ],
            java: [
              25,
              26,
              27,
              29,
            ],
            kotlin: [
              25,
              26,
              27,
              29,
            ],
            cpp: [
              11,
              12,
              13,
              15,
            ],
          },
        },
        {
          title: '탐색 범위: 가장 무거운 차량 ~ 무게 합',
          explanation: '한도가 가장 무거운 차량보다 작으면 그 차량을 실을 수 없으니 `lo` 는 `max(weights)` 입니다. 판정 함수는 차량 한 대가 한도를 넘는지 따로 검사하지 않으므로, 하한을 0이나 1로 잡으면 불가능한 한도를 "가능"으로 잘못 판단합니다. `hi` 는 한 번에 모두 싣는 `sum(weights)` 로, 항상 가능한 값입니다. 정답이 반드시 `[lo, hi]` 안에 있어야 이 템플릿이 맞게 동작합니다.',
          lines: {
            python: [
              2,
              3,
            ],
            javascript: [
              5,
              6,
            ],
            java: [
              6,
              7,
            ],
            kotlin: [
              6,
              7,
            ],
            cpp: [
              24,
              25,
            ],
          },
        },
        {
          title: '가능하면 hi = mid',
          explanation: '`mid` 로 가능하면 `mid` 자신이 정답일 수 있으므로 `hi = mid - 1` 이 아니라 `hi = mid` 로 줄입니다. 불가능하면 판정이 단조롭기 때문에 `mid` 이하도 모두 불가능하므로 `lo = mid + 1` 입니다. `lo == hi` 가 되면 처음으로 가능해지는 값 하나만 남습니다.',
          lines: {
            python: [
              6,
              7,
              9,
              10,
            ],
            javascript: [
              10,
              11,
              13,
              16,
            ],
            java: [
              11,
              12,
              14,
              17,
            ],
            kotlin: [
              11,
              12,
              14,
              17,
            ],
            cpp: [
              29,
              30,
              32,
              35,
            ],
          },
        },
        {
          title: '중간값은 내림, 오버플로 주의',
          explanation: '`hi = mid` 로 갱신하는 템플릿은 **내림** 중간값과 짝입니다. `lo + 1 == hi` 일 때 내림 `mid` 는 `lo` 라서 어느 쪽으로 가든 구간이 반드시 줄어듭니다. Java · Kotlin · C++ 은 `lo + hi` 가 `int` 범위를 넘지 않도록 `lo + (hi - lo) / 2` 로 씁니다. 이 문제는 무게 합이 최대 5억이라 `int` 로 충분하지만, 원소가 10⁹ 까지 커지면 `hi` 와 `load` 를 `long` 으로 바꿔야 합니다.',
          lines: {
            python: [
              5,
            ],
            javascript: [
              9,
            ],
            java: [
              10,
            ],
            kotlin: [
              10,
            ],
            cpp: [
              28,
            ],
          },
        },
      ],
    },
    {
      title: '닫힌 구간 [lo, hi] + 정답 변수',
      summary: '`lo <= hi` 동안 반복하며 가능한 `mid` 를 `answer` 에 기록하고 더 작은 쪽을 계속 찾습니다.',
      complexity: {
        time: 'O(N log S)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(weights, trips):
    lo = max(weights)  # 가장 무거운 차량은 실을 수 있어야 한다
    hi = sum(weights)  # 한 번에 모두 싣는 경우
    answer = hi  # 한 번에 모두 싣는 한도는 항상 가능
    while lo <= hi:
        mid = (lo + hi) // 2
        if trips_needed(weights, mid) <= trips:
            answer = mid  # 가능한 한도를 기록하고 더 작은 쪽을 찾는다
            hi = mid - 1
        else:
            lo = mid + 1
    return answer


# 적재 한도가 capacity 일 때 필요한 운항 횟수
def trips_needed(weights, capacity):
    count = 1
    load = 0
    for w in weights:
        if load + w > capacity:  # 이 차량은 다음 운항으로
            count += 1
            load = 0
        load += w
    return count
`,
        javascript: `function solution(weights, trips) {
    let lo = 0;
    let hi = 0;
    for (const w of weights) {
        lo = Math.max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
        hi += w; // 한 번에 모두 싣는 경우
    }
    let answer = hi; // 한 번에 모두 싣는 한도는 항상 가능
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (tripsNeeded(weights, mid) <= trips) {
            answer = mid; // 가능한 한도를 기록하고 더 작은 쪽을 찾는다
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}

// 적재 한도가 capacity 일 때 필요한 운항 횟수
function tripsNeeded(weights, capacity) {
    let count = 1;
    let load = 0;
    for (const w of weights) {
        if (load + w > capacity) { // 이 차량은 다음 운항으로
            count++;
            load = 0;
        }
        load += w;
    }
    return count;
}
`,
        java: `class Solution {
    public int solution(int[] weights, int trips) {
        int lo = 0;
        int hi = 0;
        for (int w : weights) {
            lo = Math.max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
            hi += w; // 한 번에 모두 싣는 경우
        }
        int answer = hi; // 한 번에 모두 싣는 한도는 항상 가능
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (tripsNeeded(weights, mid) <= trips) {
                answer = mid; // 가능한 한도를 기록하고 더 작은 쪽을 찾는다
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        }
        return answer;
    }

    // 적재 한도가 capacity 일 때 필요한 운항 횟수
    private int tripsNeeded(int[] weights, int capacity) {
        int count = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > capacity) { // 이 차량은 다음 운항으로
                count++;
                load = 0;
            }
            load += w;
        }
        return count;
    }
}
`,
        kotlin: `class Solution {
    fun solution(weights: IntArray, trips: Int): Int {
        var lo = 0
        var hi = 0
        for (w in weights) {
            lo = maxOf(lo, w) // 가장 무거운 차량은 실을 수 있어야 한다
            hi += w // 한 번에 모두 싣는 경우
        }
        var answer = hi // 한 번에 모두 싣는 한도는 항상 가능
        while (lo <= hi) {
            val mid = lo + (hi - lo) / 2
            if (tripsNeeded(weights, mid) <= trips) {
                answer = mid // 가능한 한도를 기록하고 더 작은 쪽을 찾는다
                hi = mid - 1
            } else {
                lo = mid + 1
            }
        }
        return answer
    }

    // 적재 한도가 capacity 일 때 필요한 운항 횟수
    private fun tripsNeeded(weights: IntArray, capacity: Int): Int {
        var count = 1
        var load = 0
        for (w in weights) {
            if (load + w > capacity) { // 이 차량은 다음 운항으로
                count++
                load = 0
            }
            load += w
        }
        return count
    }
}
`,
        cpp: `#include <algorithm>
#include <vector>

using namespace std;

// 적재 한도가 capacity 일 때 필요한 운항 횟수
int tripsNeeded(const vector<int>& weights, int capacity) {
    int count = 1;
    int load = 0;
    for (int w : weights) {
        if (load + w > capacity) { // 이 차량은 다음 운항으로
            count++;
            load = 0;
        }
        load += w;
    }
    return count;
}

int solution(vector<int> weights, int trips) {
    int lo = 0;
    int hi = 0;
    for (int w : weights) {
        lo = max(lo, w); // 가장 무거운 차량은 실을 수 있어야 한다
        hi += w; // 한 번에 모두 싣는 경우
    }
    int answer = hi; // 한 번에 모두 싣는 한도는 항상 가능
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (tripsNeeded(weights, mid) <= trips) {
            answer = mid; // 가능한 한도를 기록하고 더 작은 쪽을 찾는다
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}
`,
      },
      keyPoints: [
        {
          title: '가능하면 기록하고 왼쪽으로',
          explanation: '`mid` 로 가능하면 `answer` 에 기록하고, 더 작은 한도도 되는지 `hi = mid - 1` 로 왼쪽을 계속 찾습니다. 기록은 갈수록 작은 값으로만 바뀌므로, 반복이 끝났을 때 `answer` 에는 가능한 가장 작은 한도가 남습니다.',
          lines: {
            python: [
              7,
              8,
              9,
            ],
            javascript: [
              11,
              12,
              13,
            ],
            java: [
              12,
              13,
              14,
            ],
            kotlin: [
              12,
              13,
              14,
            ],
            cpp: [
              30,
              31,
              32,
            ],
          },
        },
        {
          title: '닫힌 구간은 lo <= hi, mid ± 1',
          explanation: '`[lo, hi]` 의 모든 값이 아직 확인할 후보이므로 `lo == hi` 인 값도 확인하도록 `lo <= hi` 로 반복합니다. `mid` 는 확인을 마쳤으니 양쪽 모두 `mid` 를 빼고(`mid - 1`, `mid + 1`) 좁혀야 무한 루프가 생기지 않습니다. 이 템플릿은 내림이든 올림이든 `mid` 를 그대로 써도 됩니다.',
          lines: {
            python: [
              5,
              9,
              11,
            ],
            javascript: [
              9,
              13,
              15,
            ],
            java: [
              10,
              14,
              16,
            ],
            kotlin: [
              10,
              14,
              16,
            ],
            cpp: [
              28,
              32,
              34,
            ],
          },
        },
        {
          title: 'answer 의 초깃값',
          explanation: '`answer` 는 반복 안에서 한 번도 기록되지 않을 때 돌려줄 값입니다. 이 문제는 무게 합(한 번에 모두 싣기)이 항상 가능하므로 `hi` 로 둡니다. 범위 안에 가능한 값이 없을 수도 있는 문제라면 -1 처럼 답이 될 수 없는 값으로 두고 "불가능"을 알립니다.',
          lines: {
            python: [
              4,
              12,
            ],
            javascript: [
              8,
              18,
            ],
            java: [
              9,
              19,
            ],
            kotlin: [
              9,
              19,
            ],
            cpp: [
              27,
              37,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '탐색 하한을 0이나 1로 잡으면 판정 함수가 한도보다 무거운 차량도 그대로 실어 불가능한 한도를 가능하다고 판단합니다.',
    '`while lo < hi` 와 `hi = mid - 1` 처럼 두 템플릿을 섞으면 정답을 건너뛰거나 무한 루프에 빠집니다.',
    '판정 함수의 누적 값(실은 무게, 처리 인원 등)이 커질 수 있으면 `long` 을 쓰세요. 값의 최대 범위를 먼저 계산하는 습관이 중요합니다.',
  ],
};

export default content;
