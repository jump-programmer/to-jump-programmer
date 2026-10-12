// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'binary-search-parametric-max',
  topicId: 'binary-search',
  order: 3,
  title: '파라메트릭 서치 — 조건을 만족하는 최댓값',
  summary: '답이 커질수록 불가능해지는 판정에서 마지막으로 가능한 값을 찾습니다. 올림 중간값과 오버플로가 핵심입니다.',
  difficulty: 3,
  whenToUse: [
    '"조건을 만족하는 **최댓값**", "최대 얼마까지 가능한가" 같은 표현이 있을 때',
    '답을 하나 정하면 가능 여부를 쉽게 판정할 수 있고, 답이 **커질수록 불가능해지기만** 할 때',
    '같은 길이로 잘라 개수 맞추기, 최소 간격을 최대로 벌리며 배치하기 같은 문제',
  ],
  approach: `"조각 길이의 **최댓값**"도 판정 질문으로 뒤집습니다. **"길이 L 로 자르면 k 개 이상 나오는가?"** 는 케이블마다 \`c / L\` 을 더해 O(N)에 답할 수 있습니다.

이번에는 L 이 길어질수록 조각 수가 줄어들므로 판정 결과가 **가능 → 불가능**으로 바뀝니다. 예제 1(\`[9, 7, 5]\`, k = 5)에서는 다음과 같습니다.

| L | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 조각 수 | 21 | 9 | 6 | 4 |
| 가능? | T | T | **T** | F |

찾는 값은 **마지막 T** 입니다. 최솟값을 찾을 때와 방향이 반대이므로 갱신도 반대로 합니다.

- 가능하면 \`mid\` 를 정답 후보로 남기고 **더 긴 쪽**을 찾습니다.
- 불가능하면 \`mid\` 를 포함해 더 긴 쪽을 모두 버립니다.

\`lo < hi\` 템플릿으로 쓸 때는 \`lo = mid\` 갱신 때문에 **올림 중간값**이 필요합니다. 또 답의 범위와 조각 수가 커서 중간값 계산과 조각 수 합에서 \`int\` 오버플로가 나기 쉬운 유형입니다.`,
  example: {
    description: `길이가 제각각인 케이블 \`cables\` 를 잘라 **길이가 같은 조각을 \`k\` 개 이상** 만들려고 합니다. 조각 길이는 양의 정수이고, 자르고 남은 토막은 버립니다(이어 붙일 수 없습니다). 만들 수 있는 조각 길이의 최댓값을 return 하세요. \`k\` 개를 만들 수 없으면 0을 return 합니다.

- \`cables\` 의 길이는 1 이상 10,000 이하, 원소는 1 이상 2,000,000,000 이하입니다.
- \`k\` 는 1 이상 1,000,000,000 이하입니다.`,
    signature: {
      params: [
        {
          name: 'cables',
          type: 'int[]',
        },
        {
          name: 'k',
          type: 'int',
        },
      ],
      returns: 'int',
    },
    examples: [
      {
        input: [
          [
            9,
            7,
            5,
          ],
          5,
        ],
        output: 3,
      },
      {
        input: [
          [
            3,
            3,
          ],
          7,
        ],
        output: 0,
      },
    ],
    tests: [
      {
        input: [
          [
            1,
          ],
          1,
        ],
        output: 1,
      },
      {
        input: [
          [
            1,
          ],
          2,
        ],
        output: 0,
      },
      {
        input: [
          [
            10,
          ],
          3,
        ],
        output: 3,
      },
      {
        input: [
          [
            5,
            5,
            5,
          ],
          3,
        ],
        output: 5,
      },
      {
        input: [
          [
            5,
            5,
            5,
          ],
          4,
        ],
        output: 2,
      },
      {
        input: [
          [
            2000000000,
          ],
          1,
        ],
        output: 2000000000,
      },
      {
        input: [
          [
            2000000000,
            1000000000,
          ],
          1000000000,
        ],
        output: 2,
      },
      {
        input: [
          [
            1999999999,
            1,
            1,
          ],
          3,
        ],
        output: 666666666,
      },
      {
        input: [
          [
            1000000000,
            2000000000,
            1999999999,
          ],
          2000,
        ],
        output: 2499999,
      },
    ],
  },
  implementations: [
    {
      title: '닫힌 구간 [lo, hi] + 정답 변수',
      summary: '가능한 `mid` 를 `answer` 에 기록하고 더 긴 쪽을 찾습니다. `answer` 를 0으로 시작하면 "만들 수 없음"도 자연스럽게 처리됩니다.',
      complexity: {
        time: 'O(N log M) (M = 가장 긴 케이블)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(cables, k):
    lo, hi = 1, max(cables)  # 조각은 가장 긴 케이블보다 길 수 없다
    answer = 0  # k개를 만들 수 없으면 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if count_pieces(cables, mid) >= k:
            answer = mid  # 가능한 길이를 기록하고 더 긴 쪽을 찾는다
            lo = mid + 1
        else:
            hi = mid - 1
    return answer


# 길이 length 로 잘랐을 때 나오는 조각 수
def count_pieces(cables, length):
    total = 0
    for c in cables:
        total += c // length
    return total
`,
        javascript: `function solution(cables, k) {
    let lo = 1;
    let hi = 0;
    for (const c of cables) {
        hi = Math.max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
    }
    let answer = 0; // k개를 만들 수 없으면 0
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (countPieces(cables, mid) >= k) {
            answer = mid; // 가능한 길이를 기록하고 더 긴 쪽을 찾는다
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return answer;
}

// 길이 length 로 잘랐을 때 나오는 조각 수
function countPieces(cables, length) {
    let total = 0;
    for (const c of cables) {
        total += Math.floor(c / length);
    }
    return total;
}
`,
        java: `class Solution {
    public int solution(int[] cables, int k) {
        int lo = 1;
        int hi = 0;
        for (int c : cables) {
            hi = Math.max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
        }
        int answer = 0; // k개를 만들 수 없으면 0
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2; // (lo + hi) / 2 는 int 범위를 넘을 수 있다
            if (countPieces(cables, mid) >= k) {
                answer = mid; // 가능한 길이를 기록하고 더 긴 쪽을 찾는다
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return answer;
    }

    // 길이 length 로 잘랐을 때 나오는 조각 수
    private long countPieces(int[] cables, int length) {
        long total = 0; // 조각 수 합은 int 범위를 넘을 수 있다
        for (int c : cables) {
            total += c / length;
        }
        return total;
    }
}
`,
        kotlin: `class Solution {
    fun solution(cables: IntArray, k: Int): Int {
        var lo = 1
        var hi = 0
        for (c in cables) {
            hi = maxOf(hi, c) // 조각은 가장 긴 케이블보다 길 수 없다
        }
        var answer = 0 // k개를 만들 수 없으면 0
        while (lo <= hi) {
            val mid = lo + (hi - lo) / 2 // (lo + hi) / 2 는 Int 범위를 넘을 수 있다
            if (countPieces(cables, mid) >= k) {
                answer = mid // 가능한 길이를 기록하고 더 긴 쪽을 찾는다
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
        return answer
    }

    // 길이 length 로 잘랐을 때 나오는 조각 수
    private fun countPieces(cables: IntArray, length: Int): Long {
        var total = 0L // 조각 수 합은 Int 범위를 넘을 수 있다
        for (c in cables) {
            total += c / length
        }
        return total
    }
}
`,
        cpp: `#include <algorithm>
#include <vector>

using namespace std;

// 길이 length 로 잘랐을 때 나오는 조각 수
long long countPieces(const vector<int>& cables, int length) {
    long long total = 0; // 조각 수 합은 int 범위를 넘을 수 있다
    for (int c : cables) {
        total += c / length;
    }
    return total;
}

int solution(vector<int> cables, int k) {
    int lo = 1;
    int hi = 0;
    for (int c : cables) {
        hi = max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
    }
    int answer = 0; // k개를 만들 수 없으면 0
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2; // (lo + hi) / 2 는 int 범위를 넘을 수 있다
        if (countPieces(cables, mid) >= k) {
            answer = mid; // 가능한 길이를 기록하고 더 긴 쪽을 찾는다
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return answer;
}
`,
      },
      keyPoints: [
        {
          title: '판정: 조각 수가 k 이상인가',
          explanation: '길이 L 로 자르면 케이블 하나에서 `c / L`(내림) 개가 나옵니다. 모두 더해 k 이상이면 가능합니다. L 이 길수록 조각 수는 줄어들기만 하므로 판정 결과가 `T T T F F F` 처럼 한 번만 바뀌고, 이분 탐색을 쓸 수 있습니다.',
          lines: {
            python: [
              6,
              18,
            ],
            javascript: [
              10,
              24,
            ],
            java: [
              11,
              25,
            ],
            kotlin: [
              11,
              25,
            ],
            cpp: [
              10,
              24,
            ],
          },
        },
        {
          title: '가능하면 기록하고 오른쪽으로',
          explanation: '최솟값을 찾을 때와 방향이 반대입니다. 가능하면 `answer` 에 기록하고 더 긴 길이도 되는지 `lo = mid + 1` 로 오른쪽을 찾습니다. 불가능하면 더 긴 길이는 모두 불가능하므로 `hi = mid - 1` 입니다.',
          lines: {
            python: [
              7,
              8,
              10,
            ],
            javascript: [
              11,
              12,
              14,
            ],
            java: [
              12,
              13,
              15,
            ],
            kotlin: [
              12,
              13,
              15,
            ],
            cpp: [
              25,
              26,
              28,
            ],
          },
        },
        {
          title: '범위는 1 ~ 가장 긴 케이블, 못 만들면 0',
          explanation: '조각 길이는 1 이상이어야 하고(0이면 `c / 0` 으로 나누게 됩니다), 가장 긴 케이블보다 길 수 없습니다. 길이 1로도 k 개가 안 나오면 `answer` 가 한 번도 기록되지 않아 초깃값 0이 그대로 답이 됩니다.',
          lines: {
            python: [
              2,
              3,
            ],
            javascript: [
              2,
              5,
              7,
            ],
            java: [
              3,
              6,
              8,
            ],
            kotlin: [
              3,
              6,
              8,
            ],
            cpp: [
              16,
              19,
              21,
            ],
          },
        },
        {
          title: '조각 수 합은 long',
          explanation: '케이블 하나의 조각 수는 `int` 에 들어가지만, 1만 개를 더하면 최대 2 × 10¹³ 까지 커집니다. `[2000000000, 1000000000]`, k = 10억에서 길이 1의 조각 수는 30억이라 `int` 로 더하면 음수가 되고, "불가능"으로 판정해 정답 2 대신 0을 돌려줍니다. Java · Kotlin · C++ 은 합을 `long` 으로 받습니다. JavaScript 는 2^53 까지 정확하고 Python 은 크기 제한이 없습니다. 합이 k 이상이 되는 순간 반복을 멈추는 방법도 있습니다.',
          lines: {
            python: [
              16,
              18,
            ],
            javascript: [
              22,
              24,
            ],
            java: [
              22,
              23,
            ],
            kotlin: [
              22,
              23,
            ],
            cpp: [
              7,
              8,
            ],
          },
        },
        {
          title: '중간값 오버플로',
          explanation: '`hi` 가 최대 20억이므로 `lo` 가 커지면 `lo + hi` 가 `int` 최댓값(약 21.4억)을 넘습니다. `[2000000000]`, k = 1 처럼 답이 큰 경우 `(lo + hi) / 2` 가 음수가 되어 탐색이 망가집니다. Java · Kotlin · C++ 은 `lo + (hi - lo) / 2` 로 씁니다.',
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
              23,
            ],
          },
        },
      ],
    },
    {
      title: '`lo < hi` + 올림 중간값',
      summary: '가능하면 `lo = mid` 로 정답 후보를 남깁니다. 그래서 중간값을 **올림**으로 구해야 구간이 항상 줄어듭니다.',
      complexity: {
        time: 'O(N log M) (M = 가장 긴 케이블)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(cables, k):
    lo, hi = 0, max(cables)  # lo = 0 은 "만들 수 없음" 자리
    while lo < hi:
        mid = (lo + hi + 1) // 2  # 올림
        if count_pieces(cables, mid) >= k:
            lo = mid  # mid 도 정답 후보
        else:
            hi = mid - 1
    return lo


# 길이 length 로 잘랐을 때 나오는 조각 수
def count_pieces(cables, length):
    total = 0
    for c in cables:
        total += c // length
    return total
`,
        javascript: `function solution(cables, k) {
    let lo = 0; // "만들 수 없음" 자리
    let hi = 0;
    for (const c of cables) {
        hi = Math.max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
    }
    while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2); // 올림
        if (countPieces(cables, mid) >= k) {
            lo = mid; // mid 도 정답 후보
        } else {
            hi = mid - 1;
        }
    }
    return lo;
}

// 길이 length 로 잘랐을 때 나오는 조각 수
function countPieces(cables, length) {
    let total = 0;
    for (const c of cables) {
        total += Math.floor(c / length);
    }
    return total;
}
`,
        java: `class Solution {
    public int solution(int[] cables, int k) {
        int lo = 0; // "만들 수 없음" 자리
        int hi = 0;
        for (int c : cables) {
            hi = Math.max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
        }
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2; // 올림
            if (countPieces(cables, mid) >= k) {
                lo = mid; // mid 도 정답 후보
            } else {
                hi = mid - 1;
            }
        }
        return lo;
    }

    // 길이 length 로 잘랐을 때 나오는 조각 수
    private long countPieces(int[] cables, int length) {
        long total = 0; // 조각 수 합은 int 범위를 넘을 수 있다
        for (int c : cables) {
            total += c / length;
        }
        return total;
    }
}
`,
        kotlin: `class Solution {
    fun solution(cables: IntArray, k: Int): Int {
        var lo = 0 // "만들 수 없음" 자리
        var hi = 0
        for (c in cables) {
            hi = maxOf(hi, c) // 조각은 가장 긴 케이블보다 길 수 없다
        }
        while (lo < hi) {
            val mid = lo + (hi - lo + 1) / 2 // 올림
            if (countPieces(cables, mid) >= k) {
                lo = mid // mid 도 정답 후보
            } else {
                hi = mid - 1
            }
        }
        return lo
    }

    // 길이 length 로 잘랐을 때 나오는 조각 수
    private fun countPieces(cables: IntArray, length: Int): Long {
        var total = 0L // 조각 수 합은 Int 범위를 넘을 수 있다
        for (c in cables) {
            total += c / length
        }
        return total
    }
}
`,
        cpp: `#include <algorithm>
#include <vector>

using namespace std;

// 길이 length 로 잘랐을 때 나오는 조각 수
long long countPieces(const vector<int>& cables, int length) {
    long long total = 0; // 조각 수 합은 int 범위를 넘을 수 있다
    for (int c : cables) {
        total += c / length;
    }
    return total;
}

int solution(vector<int> cables, int k) {
    int lo = 0; // "만들 수 없음" 자리
    int hi = 0;
    for (int c : cables) {
        hi = max(hi, c); // 조각은 가장 긴 케이블보다 길 수 없다
    }
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2; // 올림
        if (countPieces(cables, mid) >= k) {
            lo = mid; // mid 도 정답 후보
        } else {
            hi = mid - 1;
        }
    }
    return lo;
}
`,
      },
      keyPoints: [
        {
          title: '올림 중간값',
          explanation: '가능할 때 `lo = mid` 로 갱신하므로, `lo + 1 == hi` 에서 내림 중간값을 쓰면 `mid == lo` 가 되어 `lo` 가 그대로이고 **무한 루프**에 빠집니다. 올림을 쓰면 `mid` 가 항상 `lo` 보다 커서 어느 쪽으로 가든 구간이 줄어듭니다. 최솟값 템플릿(`hi = mid` + 내림)과 정확히 거울 대칭입니다.',
          lines: {
            python: [
              4,
            ],
            javascript: [
              8,
            ],
            java: [
              9,
            ],
            kotlin: [
              9,
            ],
            cpp: [
              22,
            ],
          },
        },
        {
          title: '가능하면 lo = mid, 불가능하면 hi = mid - 1',
          explanation: '가능한 `mid` 는 정답일 수 있으므로 버리지 않고 `lo = mid` 로 남깁니다. 불가능한 `mid` 는 정답이 아니고 그보다 긴 길이도 모두 불가능하므로 `hi = mid - 1` 입니다. 반복 내내 "`lo` 는 가능한 길이(또는 0), 정답은 `[lo, hi]` 안"이 유지되고, `lo == hi` 가 되면 그 값이 답입니다.',
          lines: {
            python: [
              5,
              6,
              8,
            ],
            javascript: [
              9,
              10,
              12,
            ],
            java: [
              10,
              11,
              13,
            ],
            kotlin: [
              10,
              11,
              13,
            ],
            cpp: [
              23,
              24,
              26,
            ],
          },
        },
        {
          title: 'lo = 0 에서 시작',
          explanation: '`lo` 를 0으로 두면 0이 "만들 수 없음"을 뜻하는 답 후보가 됩니다. 길이 1로도 k 개가 안 되면 `hi` 만 계속 줄어 `lo == hi == 0` 에서 끝나므로 0을 따로 처리하지 않아도 됩니다. 올림 덕분에 `mid` 는 항상 1 이상이라 0으로 나누는 일도 없습니다.',
          lines: {
            python: [
              2,
              9,
            ],
            javascript: [
              2,
              15,
            ],
            java: [
              3,
              16,
            ],
            kotlin: [
              3,
              16,
            ],
            cpp: [
              16,
              29,
            ],
          },
        },
        {
          title: '오버플로 두 군데',
          explanation: '올림 중간값을 `(lo + hi + 1) / 2` 로 쓰면 `lo + hi + 1` 이 `int` 범위를 넘을 수 있습니다(`[2000000000]`, k = 1). Java · Kotlin · C++ 은 `lo + (hi - lo + 1) / 2` 로 씁니다. 조각 수 합도 첫 번째 구현과 같은 이유로 `long` 입니다. Python 과 JavaScript 는 이 범위에서 넘치지 않아 식을 그대로 씁니다.',
          lines: {
            python: [
              4,
              14,
            ],
            javascript: [
              8,
              20,
            ],
            java: [
              9,
              21,
            ],
            kotlin: [
              9,
              21,
            ],
            cpp: [
              22,
              8,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '`lo = mid` 로 갱신하면서 내림 중간값을 쓰면 `lo + 1 == hi` 에서 범위가 줄지 않아 무한 루프에 빠집니다.',
    '길이 0부터 탐색하면 `c / 0` 으로 나누게 됩니다. 0은 "만들 수 없음"을 나타내는 답으로만 쓰세요.',
    '조각 수를 `int` 로 더하면 합이 21억을 넘어 음수가 되고, 가능한 길이를 불가능하다고 판단합니다.',
  ],
};

export default content;
