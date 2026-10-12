// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'binary-search-lower-bound',
  topicId: 'binary-search',
  order: 1,
  title: '정렬된 배열에서 경계 찾기',
  summary: 'x 이상(초과)이 처음 나오는 위치를 찾아 범위의 개수와 위치를 O(log N)에 구합니다.',
  difficulty: 1,
  whenToUse: [
    '배열이 **정렬되어 있고** 특정 값의 위치나 개수를 여러 번 물어볼 때',
    '"x 이상인 첫 번째", "y 이하인 마지막" 처럼 **경계**를 묻는 표현이 있을 때',
    '구간 `[a, b]` 에 들어가는 값의 **개수**를 빠르게 세야 할 때',
  ],
  approach: `정렬된 배열은 "x보다 작은 값들 → x 이상인 값들" 순서로 나뉩니다. 이 **경계 위치**를 이분 탐색으로 찾는 것이 lower bound입니다.

- **lower bound(x)**: x **이상**이 처음 나오는 위치
- **upper bound(x)**: x **초과**가 처음 나오는 위치

두 경계를 알면 값이 \`[low, high]\` 안에 있는 원소의 개수는 \`upperBound(high) - lowerBound(low)\` 입니다. 값이 없더라도 두 함수는 "그 값을 끼워 넣을 위치"를 돌려주므로 따로 처리할 필요가 없습니다.

예제는 탐색 구간을 표현하는 두 가지 대표 템플릿으로 구현합니다. 한 가지를 골라 손에 익히는 것이 중요합니다.`,
  example: {
    description: `오름차순으로 정렬된 점수 목록 \`scores\` 와 두 정수 \`low\`, \`high\` 가 주어집니다. 점수가 \`low\` 이상 \`high\` 이하인 사람의 수를 return 하세요.

- \`scores\` 의 길이는 1 이상 100,000 이하이고, 같은 점수가 여러 번 나올 수 있습니다.
- \`low ≤ high\` 입니다.`,
    signature: {
      params: [
        {
          name: 'scores',
          type: 'int[]',
        },
        {
          name: 'low',
          type: 'int',
        },
        {
          name: 'high',
          type: 'int',
        },
      ],
      returns: 'int',
    },
    examples: [
      {
        input: [
          [
            1,
            3,
            3,
            5,
            7,
            9,
          ],
          3,
          7,
        ],
        output: 4,
      },
      {
        input: [
          [
            10,
            20,
            30,
          ],
          11,
          19,
        ],
        output: 0,
      },
    ],
    tests: [
      {
        input: [
          [
            5,
          ],
          5,
          5,
        ],
        output: 1,
      },
      {
        input: [
          [
            5,
          ],
          1,
          4,
        ],
        output: 0,
      },
      {
        input: [
          [
            5,
          ],
          6,
          10,
        ],
        output: 0,
      },
      {
        input: [
          [
            1,
            1,
            1,
            1,
          ],
          1,
          1,
        ],
        output: 4,
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
          0,
          100,
        ],
        output: 10,
      },
      {
        input: [
          [
            2,
            4,
            4,
            4,
            6,
            8,
            8,
            10,
          ],
          4,
          8,
        ],
        output: 6,
      },
      {
        input: [
          [
            -5,
            -3,
            0,
            0,
            2,
          ],
          -4,
          0,
        ],
        output: 3,
      },
      {
        input: [
          [
            1,
            3,
            5,
            7,
          ],
          2,
          6,
        ],
        output: 2,
      },
      {
        input: [
          [
            1,
            3,
            5,
            7,
          ],
          8,
          9,
        ],
        output: 0,
      },
    ],
  },
  implementations: [
    {
      title: '반열린 구간 [lo, hi)',
      summary: '`hi` 를 배열 길이로 두고 `lo == hi` 가 될 때까지 좁힙니다. 끝난 시점의 `lo` 가 곧 경계입니다.',
      complexity: {
        time: 'O(log N)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(scores, low, high):
    return upper_bound(scores, high) - lower_bound(scores, low)


# x 이상이 처음 나오는 위치 — 탐색 구간은 [lo, hi)
def lower_bound(arr, x):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo


# x 초과가 처음 나오는 위치
def upper_bound(arr, x):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
    return lo
`,
        javascript: `function solution(scores, low, high) {
    return upperBound(scores, high) - lowerBound(scores, low);
}

// x 이상이 처음 나오는 위치 — 탐색 구간은 [lo, hi)
function lowerBound(arr, x) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

// x 초과가 처음 나오는 위치
function upperBound(arr, x) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] <= x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}
`,
        java: `class Solution {
    public int solution(int[] scores, int low, int high) {
        return upperBound(scores, high) - lowerBound(scores, low);
    }

    // x 이상이 처음 나오는 위치 — 탐색 구간은 [lo, hi)
    private int lowerBound(int[] arr, int x) {
        int lo = 0;
        int hi = arr.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    // x 초과가 처음 나오는 위치
    private int upperBound(int[] arr, int x) {
        int lo = 0;
        int hi = arr.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] <= x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
}
`,
        kotlin: `class Solution {
    fun solution(scores: IntArray, low: Int, high: Int): Int {
        return upperBound(scores, high) - lowerBound(scores, low)
    }

    // x 이상이 처음 나오는 위치 — 탐색 구간은 [lo, hi)
    private fun lowerBound(arr: IntArray, x: Int): Int {
        var lo = 0
        var hi = arr.size
        while (lo < hi) {
            val mid = lo + (hi - lo) / 2
            if (arr[mid] < x) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        return lo
    }

    // x 초과가 처음 나오는 위치
    private fun upperBound(arr: IntArray, x: Int): Int {
        var lo = 0
        var hi = arr.size
        while (lo < hi) {
            val mid = lo + (hi - lo) / 2
            if (arr[mid] <= x) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        return lo
    }
}
`,
        cpp: `#include <vector>

using namespace std;

// x 이상이 처음 나오는 위치 — 탐색 구간은 [lo, hi)
int lowerBound(const vector<int>& arr, int x) {
    int lo = 0;
    int hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

// x 초과가 처음 나오는 위치
int upperBound(const vector<int>& arr, int x) {
    int lo = 0;
    int hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] <= x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

int solution(vector<int> scores, int low, int high) {
    return upperBound(scores, high) - lowerBound(scores, low);
}
`,
      },
      keyPoints: [
        {
          title: '탐색 구간 [lo, hi)',
          explanation: '`hi` 를 마지막 인덱스가 아니라 **배열 길이**로 둡니다. 모든 값이 x보다 작으면 경계는 "배열 끝"이어야 하는데, 이 위치(`len`)도 답이 될 수 있도록 구간에 포함하는 것입니다. `lo < hi` 동안 반복하고, 끝나면 `lo == hi` 가 경계입니다.',
          lines: {
            python: [
              7,
              8,
            ],
            javascript: [
              7,
              8,
              9,
            ],
            java: [
              8,
              9,
              10,
            ],
            kotlin: [
              8,
              9,
              10,
            ],
            cpp: [
              7,
              8,
              9,
            ],
          },
        },
        {
          title: '< 와 <= 하나 차이',
          explanation: 'lower bound는 `arr[mid] < x` 일 때, upper bound는 `arr[mid] <= x` 일 때 오른쪽으로 갑니다. x와 **같은 값**을 왼쪽에 남길지(lower) 지나칠지(upper)만 다릅니다.',
          lines: {
            python: [
              10,
              22,
            ],
            javascript: [
              11,
              26,
            ],
            java: [
              12,
              27,
            ],
            kotlin: [
              12,
              27,
            ],
            cpp: [
              11,
              26,
            ],
          },
        },
        {
          title: '조건이 거짓이면 hi = mid',
          explanation: '`arr[mid]` 가 이미 조건을 만족하면 `mid` 자신이 정답일 수 있으므로 `hi = mid - 1` 이 아니라 `hi = mid` 로 줄입니다. 반대쪽은 `mid` 가 정답이 될 수 없으니 `lo = mid + 1` 입니다.',
          lines: {
            python: [
              11,
              13,
            ],
            javascript: [
              12,
              14,
            ],
            java: [
              13,
              15,
            ],
            kotlin: [
              13,
              15,
            ],
            cpp: [
              12,
              14,
            ],
          },
        },
        {
          title: '개수 = upper - lower',
          explanation: '`[low, high]` 에 들어가는 원소는 인덱스 `lowerBound(low)` 부터 `upperBound(high) - 1` 까지입니다. 그래서 개수는 두 경계의 차이이고, 해당하는 값이 없으면 두 경계가 같아 0이 됩니다.',
          lines: {
            python: [
              2,
            ],
            javascript: [
              2,
            ],
            java: [
              3,
            ],
            kotlin: [
              3,
            ],
            cpp: [
              36,
            ],
          },
        },
        {
          title: '중간값 오버플로',
          explanation: 'Java · Kotlin · C++ 에서 `(lo + hi) / 2` 는 `lo + hi` 가 `int` 범위를 넘으면 음수가 됩니다. 배열 인덱스에서는 드물지만 습관처럼 `lo + (hi - lo) / 2` 로 씁니다. Python은 정수 크기 제한이 없어 `(lo + hi) // 2` 로 충분합니다.',
          lines: {
            python: [
              9,
            ],
            javascript: [
              10,
            ],
            java: [
              11,
            ],
            kotlin: [
              11,
            ],
            cpp: [
              10,
            ],
          },
        },
      ],
    },
    {
      title: '닫힌 구간 [lo, hi] + 정답 변수',
      summary: '`lo <= hi` 동안 반복하며 조건을 만족한 `mid` 를 정답 후보로 기록합니다. 템플릿이 직관적이라 많이 쓰입니다.',
      complexity: {
        time: 'O(log N)',
        space: 'O(1)',
      },
      code: {
        python: `def solution(scores, low, high):
    # 정수이므로 'high 초과' 는 'high + 1 이상' 과 같다
    return first_at_least(scores, high + 1) - first_at_least(scores, low)


# x 이상인 첫 위치. 없으면 len(arr)
def first_at_least(arr, x):
    lo, hi = 0, len(arr) - 1
    answer = len(arr)
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] >= x:
            answer = mid  # 후보를 기록하고 더 왼쪽을 찾는다
            hi = mid - 1
        else:
            lo = mid + 1
    return answer
`,
        javascript: `function solution(scores, low, high) {
    // 정수이므로 'high 초과' 는 'high + 1 이상' 과 같다
    return firstAtLeast(scores, high + 1) - firstAtLeast(scores, low);
}

// x 이상인 첫 위치. 없으면 arr.length
function firstAtLeast(arr, x) {
    let lo = 0;
    let hi = arr.length - 1;
    let answer = arr.length;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] >= x) {
            answer = mid; // 후보를 기록하고 더 왼쪽을 찾는다
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}
`,
        java: `class Solution {
    public int solution(int[] scores, int low, int high) {
        // 정수이므로 'high 초과' 는 'high + 1 이상' 과 같다
        return firstAtLeast(scores, high + 1) - firstAtLeast(scores, low);
    }

    // x 이상인 첫 위치. 없으면 arr.length
    private int firstAtLeast(int[] arr, int x) {
        int lo = 0;
        int hi = arr.length - 1;
        int answer = arr.length;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] >= x) {
                answer = mid; // 후보를 기록하고 더 왼쪽을 찾는다
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        }
        return answer;
    }
}
`,
        kotlin: `class Solution {
    fun solution(scores: IntArray, low: Int, high: Int): Int {
        // 정수이므로 'high 초과' 는 'high + 1 이상' 과 같다
        return firstAtLeast(scores, high + 1) - firstAtLeast(scores, low)
    }

    // x 이상인 첫 위치. 없으면 arr.size
    private fun firstAtLeast(arr: IntArray, x: Int): Int {
        var lo = 0
        var hi = arr.size - 1
        var answer = arr.size
        while (lo <= hi) {
            val mid = lo + (hi - lo) / 2
            if (arr[mid] >= x) {
                answer = mid // 후보를 기록하고 더 왼쪽을 찾는다
                hi = mid - 1
            } else {
                lo = mid + 1
            }
        }
        return answer
    }
}
`,
        cpp: `#include <vector>

using namespace std;

// x 이상인 첫 위치. 없으면 arr.size()
int firstAtLeast(const vector<int>& arr, int x) {
    int lo = 0;
    int hi = (int) arr.size() - 1;
    int answer = arr.size();
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] >= x) {
            answer = mid; // 후보를 기록하고 더 왼쪽을 찾는다
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}

int solution(vector<int> scores, int low, int high) {
    // 정수이므로 'high 초과' 는 'high + 1 이상' 과 같다
    return firstAtLeast(scores, high + 1) - firstAtLeast(scores, low);
}
`,
      },
      keyPoints: [
        {
          title: '정답 후보 변수',
          explanation: '조건을 만족하는 `mid` 를 찾을 때마다 `answer` 에 기록하고, 더 앞쪽에 또 있는지 계속 찾습니다. 반복이 끝났을 때 `answer` 에는 조건을 만족한 **가장 왼쪽** 위치가 남습니다. 끝까지 못 찾으면 초깃값(배열 길이)이 그대로 돌아옵니다.',
          lines: {
            python: [
              9,
              13,
            ],
            javascript: [
              10,
              14,
            ],
            java: [
              11,
              15,
            ],
            kotlin: [
              11,
              15,
            ],
            cpp: [
              9,
              13,
            ],
          },
        },
        {
          title: '닫힌 구간은 lo <= hi, mid ± 1',
          explanation: '`hi` 를 마지막 인덱스(`len - 1`)로 두는 닫힌 구간에서는 `lo == hi` 인 원소도 확인해야 하므로 `lo <= hi` 로 반복합니다. `mid` 는 이미 확인했으니 `hi = mid - 1`, `lo = mid + 1` 로 반드시 구간에서 빼야 무한 루프가 생기지 않습니다.',
          lines: {
            python: [
              8,
              10,
              14,
              16,
            ],
            javascript: [
              9,
              11,
              15,
              17,
            ],
            java: [
              10,
              12,
              16,
              18,
            ],
            kotlin: [
              10,
              12,
              16,
              18,
            ],
            cpp: [
              8,
              10,
              14,
              16,
            ],
          },
        },
        {
          title: 'upper bound 를 lower bound 로',
          explanation: '값이 정수라면 "high **초과**가 처음 나오는 위치"는 "high + 1 **이상**이 처음 나오는 위치"와 같습니다. 그래서 함수 하나로 두 경계를 모두 구합니다. 실수 배열에서는 이 방법을 쓸 수 없습니다.',
          lines: {
            python: [
              2,
              3,
            ],
            javascript: [
              2,
              3,
            ],
            java: [
              3,
              4,
            ],
            kotlin: [
              3,
              4,
            ],
            cpp: [
              23,
              24,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '`while lo <= hi` 템플릿에 `hi = mid` 를 섞어 쓰면 `lo == hi` 에서 구간이 줄지 않아 **무한 루프**가 생깁니다.',
    '정렬되지 않은 배열에 이분 탐색을 쓰면 틀린 답이 나옵니다. 입력이 정렬되어 있지 않다면 먼저 정렬하세요.',
    'Java의 `Arrays.binarySearch` 는 같은 값이 여러 개일 때 **어느 위치를 줄지 보장하지 않습니다.** 경계가 필요하면 직접 구현하세요.',
  ],
};

export default content;
