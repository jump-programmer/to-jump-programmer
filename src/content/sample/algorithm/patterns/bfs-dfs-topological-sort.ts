// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'bfs-dfs-topological-sort',
  topicId: 'bfs-dfs',
  order: 3,
  title: '위상 정렬 (선후 관계)',
  summary: '선후 관계를 방향 그래프로 보고, 앞선 일이 모두 끝난 일부터 처리합니다. 순환이 있으면 모든 일을 끝낼 수 없습니다.',
  difficulty: 3,
  whenToUse: [
    '"선수 과목", "작업 순서", "먼저 끝나야 하는 일" 처럼 **선후 관계**가 주어질 때',
    '방향 그래프에서 **순환(사이클)이 있는지** 판별해야 할 때',
    '선후 관계를 지키며 걸리는 **최소 단계 수**(가장 긴 사슬)를 구할 때',
  ],
  approach: `선수 관계 \`[a, b]\` 를 \`a → b\` 간선으로 그리면 강의들은 **방향 그래프**가 됩니다. 간선 방향을 거스르지 않고 모든 정점을 늘어놓은 순서가 **위상 정렬**이고, 그래프에 순환이 있으면 위상 정렬은 불가능합니다.

- **Kahn 알고리즘(BFS)**: 들어오는 간선 수(**진입 차수**)가 0인 정점부터 꺼내고, 꺼낸 정점의 간선을 지우며 새로 0이 된 정점을 큐에 넣습니다. 큐를 학기(레벨) 단위로 끊으면 학기 수가 나옵니다.
- **DFS 후위 순서**: 한 정점에서 이어지는 정점을 모두 탐색한 **뒤에** 그 정점을 확정합니다. 확정되는 순서를 뒤집으면 위상 정렬이고, 확정할 때 "뒤따르는 가장 긴 사슬" 을 함께 계산할 수 있습니다.

최소 학기 수는 그래프에서 **가장 긴 선수 관계 사슬**에 들어 있는 강의 수와 같습니다. 두 방법 모두 정점과 간선을 한 번씩 보므로 O(N + M) 입니다.`,
  example: {
    description: `강의가 \`n\` 개 있고 1번부터 \`n\` 번까지 번호가 붙어 있습니다. \`prerequisites\` 의 각 원소 \`[a, b]\` 는 **a번 강의를 먼저 수료해야 b번 강의를 들을 수 있다**는 뜻입니다. 한 학기에 들을 수 있는 강의 수에는 제한이 없지만, 선수 강의는 이전 학기까지 수료해야 합니다.

모든 강의를 수료하는 데 필요한 **최소 학기 수**를 return 하세요. 선수 관계가 순환해서 수료할 수 없는 강의가 있다면 -1 을 return 합니다.

- \`n\` 은 1 이상 1,000 이하, \`prerequisites\` 의 길이는 0 이상 5,000 이하입니다.
- \`a ≠ b\` 이고, 같은 \`[a, b]\` 는 두 번 이상 주어지지 않습니다.`,
    signature: {
      params: [
        {
          name: 'n',
          type: 'int',
        },
        {
          name: 'prerequisites',
          type: 'int[][]',
        },
      ],
      returns: 'int',
    },
    examples: [
      {
        input: [
          5,
          [
            [
              1,
              3,
            ],
            [
              2,
              3,
            ],
            [
              3,
              4,
            ],
            [
              2,
              5,
            ],
          ],
        ],
        output: 3,
      },
      {
        input: [
          3,
          [
            [
              1,
              2,
            ],
            [
              2,
              3,
            ],
            [
              3,
              1,
            ],
          ],
        ],
        output: -1,
      },
    ],
    tests: [
      {
        input: [
          3,
          [],
        ],
        output: 1,
      },
      {
        input: [
          1,
          [],
        ],
        output: 1,
      },
      {
        input: [
          10,
          [
            [
              1,
              2,
            ],
            [
              2,
              3,
            ],
            [
              3,
              4,
            ],
            [
              4,
              5,
            ],
            [
              5,
              6,
            ],
            [
              6,
              7,
            ],
            [
              7,
              8,
            ],
            [
              8,
              9,
            ],
            [
              9,
              10,
            ],
          ],
        ],
        output: 10,
      },
      {
        input: [
          10,
          [
            [
              10,
              9,
            ],
            [
              9,
              8,
            ],
            [
              8,
              7,
            ],
            [
              7,
              6,
            ],
            [
              6,
              5,
            ],
            [
              5,
              4,
            ],
            [
              4,
              3,
            ],
            [
              3,
              2,
            ],
            [
              2,
              1,
            ],
          ],
        ],
        output: 10,
      },
      {
        input: [
          2,
          [
            [
              1,
              2,
            ],
            [
              2,
              1,
            ],
          ],
        ],
        output: -1,
      },
      {
        input: [
          4,
          [
            [
              1,
              2,
            ],
            [
              1,
              3,
            ],
            [
              2,
              4,
            ],
            [
              3,
              4,
            ],
          ],
        ],
        output: 3,
      },
      {
        input: [
          8,
          [
            [
              4,
              5,
            ],
            [
              1,
              2,
            ],
            [
              6,
              7,
            ],
            [
              2,
              3,
            ],
            [
              5,
              6,
            ],
            [
              7,
              8,
            ],
          ],
        ],
        output: 5,
      },
      {
        input: [
          6,
          [
            [
              1,
              2,
            ],
            [
              2,
              3,
            ],
            [
              4,
              5,
            ],
            [
              5,
              6,
            ],
            [
              6,
              4,
            ],
          ],
        ],
        output: -1,
      },
      {
        input: [
          5,
          [
            [
              1,
              2,
            ],
            [
              2,
              3,
            ],
            [
              3,
              4,
            ],
            [
              4,
              2,
            ],
            [
              5,
              1,
            ],
          ],
        ],
        output: -1,
      },
      {
        input: [
          7,
          [
            [
              1,
              2,
            ],
            [
              1,
              3,
            ],
            [
              2,
              4,
            ],
            [
              3,
              4,
            ],
            [
              4,
              5,
            ],
            [
              4,
              6,
            ],
            [
              5,
              7,
            ],
            [
              6,
              7,
            ],
            [
              1,
              7,
            ],
          ],
        ],
        output: 5,
      },
      {
        input: [
          6,
          [
            [
              6,
              5,
            ],
            [
              6,
              4,
            ],
            [
              5,
              1,
            ],
            [
              4,
              1,
            ],
            [
              1,
              2,
            ],
            [
              3,
              2,
            ],
          ],
        ],
        output: 4,
      },
      {
        input: [
          30,
          [
            [
              25,
              30,
            ],
            [
              20,
              28,
            ],
            [
              29,
              5,
            ],
            [
              12,
              30,
            ],
            [
              26,
              12,
            ],
            [
              7,
              20,
            ],
            [
              17,
              8,
            ],
            [
              25,
              9,
            ],
            [
              13,
              9,
            ],
            [
              23,
              20,
            ],
            [
              29,
              8,
            ],
            [
              3,
              26,
            ],
            [
              29,
              10,
            ],
            [
              18,
              30,
            ],
            [
              26,
              13,
            ],
            [
              11,
              12,
            ],
            [
              28,
              30,
            ],
            [
              27,
              25,
            ],
            [
              28,
              29,
            ],
            [
              17,
              1,
            ],
            [
              10,
              15,
            ],
            [
              17,
              21,
            ],
            [
              13,
              15,
            ],
            [
              13,
              4,
            ],
            [
              11,
              1,
            ],
            [
              23,
              25,
            ],
            [
              20,
              5,
            ],
            [
              27,
              12,
            ],
            [
              10,
              24,
            ],
            [
              3,
              28,
            ],
            [
              17,
              30,
            ],
            [
              7,
              1,
            ],
            [
              28,
              25,
            ],
            [
              28,
              15,
            ],
            [
              5,
              30,
            ],
            [
              27,
              9,
            ],
            [
              25,
              12,
            ],
            [
              23,
              22,
            ],
            [
              20,
              30,
            ],
            [
              27,
              4,
            ],
            [
              10,
              5,
            ],
            [
              12,
              19,
            ],
            [
              14,
              22,
            ],
            [
              17,
              7,
            ],
            [
              3,
              22,
            ],
            [
              20,
              22,
            ],
            [
              29,
              1,
            ],
            [
              3,
              23,
            ],
            [
              21,
              18,
            ],
            [
              28,
              22,
            ],
            [
              23,
              9,
            ],
            [
              6,
              24,
            ],
            [
              28,
              5,
            ],
            [
              22,
              18,
            ],
            [
              29,
              18,
            ],
            [
              3,
              7,
            ],
            [
              16,
              19,
            ],
            [
              27,
              28,
            ],
            [
              29,
              21,
            ],
            [
              10,
              18,
            ],
          ],
        ],
        output: 8,
      },
    ],
  },
  implementations: [
    {
      title: '진입 차수 + 큐 (Kahn)',
      summary: '선수 강의가 남지 않은(진입 차수 0) 강의를 큐에 넣고, 큐를 학기 단위로 끊어 꺼내며 다음 강의의 진입 차수를 줄입니다.',
      complexity: {
        time: 'O(N + M)',
        space: 'O(N + M)',
      },
      code: {
        python: `from collections import deque


def solution(n, prerequisites):
    graph = [[] for _ in range(n + 1)]
    indegree = [0] * (n + 1)  # 아직 수료하지 않은 선수 강의 수
    for a, b in prerequisites:
        graph[a].append(b)
        indegree[b] += 1

    # 선수 강의가 없는 강의는 1학기에 바로 들을 수 있다
    queue = deque(v for v in range(1, n + 1) if indegree[v] == 0)
    semesters = 0
    taken = 0
    while queue:
        semesters += 1
        for _ in range(len(queue)):  # 이번 학기에 들을 수 있는 강의만 꺼낸다
            course = queue.popleft()
            taken += 1
            for nxt in graph[course]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:  # 선수 강의를 모두 들었다 → 다음 학기 후보
                    queue.append(nxt)
    # 순환에 걸린 강의는 진입 차수가 0이 되지 않아 끝까지 남는다
    return semesters if taken == n else -1
`,
        javascript: `function solution(n, prerequisites) {
    const graph = Array.from({ length: n + 1 }, () => []);
    const indegree = new Array(n + 1).fill(0); // 아직 수료하지 않은 선수 강의 수
    for (const [a, b] of prerequisites) {
        graph[a].push(b);
        indegree[b]++;
    }

    // 선수 강의가 없는 강의는 1학기에 바로 들을 수 있다
    const queue = [];
    for (let v = 1; v <= n; v++) {
        if (indegree[v] === 0) queue.push(v);
    }
    let head = 0;
    let semesters = 0;
    let taken = 0;
    while (head < queue.length) {
        semesters++;
        const size = queue.length - head; // 이번 학기에 들을 수 있는 강의 수
        for (let i = 0; i < size; i++) {
            const course = queue[head++];
            taken++;
            for (const nxt of graph[course]) {
                indegree[nxt]--;
                if (indegree[nxt] === 0) queue.push(nxt); // 선수 강의를 모두 들었다 → 다음 학기 후보
            }
        }
    }
    // 순환에 걸린 강의는 진입 차수가 0이 되지 않아 끝까지 남는다
    return taken === n ? semesters : -1;
}
`,
        java: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

class Solution {
    public int solution(int n, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        int[] indegree = new int[n + 1]; // 아직 수료하지 않은 선수 강의 수
        for (int[] p : prerequisites) {
            graph.get(p[0]).add(p[1]);
            indegree[p[1]]++;
        }

        // 선수 강의가 없는 강의는 1학기에 바로 들을 수 있다
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        for (int v = 1; v <= n; v++) {
            if (indegree[v] == 0) queue.add(v);
        }
        int semesters = 0;
        int taken = 0;
        while (!queue.isEmpty()) {
            semesters++;
            int size = queue.size(); // 이번 학기에 들을 수 있는 강의 수
            for (int i = 0; i < size; i++) {
                int course = queue.poll();
                taken++;
                for (int nxt : graph.get(course)) {
                    indegree[nxt]--;
                    if (indegree[nxt] == 0) queue.add(nxt); // 선수 강의를 모두 들었다 → 다음 학기 후보
                }
            }
        }
        // 순환에 걸린 강의는 진입 차수가 0이 되지 않아 끝까지 남는다
        return taken == n ? semesters : -1;
    }
}
`,
        kotlin: `class Solution {
    fun solution(n: Int, prerequisites: Array<IntArray>): Int {
        val graph = Array(n + 1) { mutableListOf<Int>() }
        val indegree = IntArray(n + 1) // 아직 수료하지 않은 선수 강의 수
        for ((a, b) in prerequisites) {
            graph[a].add(b)
            indegree[b]++
        }

        // 선수 강의가 없는 강의는 1학기에 바로 들을 수 있다
        val queue = ArrayDeque<Int>()
        for (v in 1..n) {
            if (indegree[v] == 0) queue.addLast(v)
        }
        var semesters = 0
        var taken = 0
        while (queue.isNotEmpty()) {
            semesters++
            val size = queue.size // 이번 학기에 들을 수 있는 강의 수
            for (i in 0 until size) {
                val course = queue.removeFirst()
                taken++
                for (nxt in graph[course]) {
                    indegree[nxt]--
                    if (indegree[nxt] == 0) queue.addLast(nxt) // 선수 강의를 모두 들었다 → 다음 학기 후보
                }
            }
        }
        // 순환에 걸린 강의는 진입 차수가 0이 되지 않아 끝까지 남는다
        return if (taken == n) semesters else -1
    }
}
`,
        cpp: `#include <queue>
#include <vector>

using namespace std;

int solution(int n, vector<vector<int>> prerequisites) {
    vector<vector<int>> graph(n + 1);
    vector<int> indegree(n + 1, 0); // 아직 수료하지 않은 선수 강의 수
    for (const auto& p : prerequisites) {
        graph[p[0]].push_back(p[1]);
        indegree[p[1]]++;
    }

    // 선수 강의가 없는 강의는 1학기에 바로 들을 수 있다
    queue<int> q;
    for (int v = 1; v <= n; v++) {
        if (indegree[v] == 0) q.push(v);
    }
    int semesters = 0;
    int taken = 0;
    while (!q.empty()) {
        semesters++;
        int size = q.size(); // 이번 학기에 들을 수 있는 강의 수
        for (int i = 0; i < size; i++) {
            int course = q.front();
            q.pop();
            taken++;
            for (int nxt : graph[course]) {
                indegree[nxt]--;
                if (indegree[nxt] == 0) q.push(nxt); // 선수 강의를 모두 들었다 → 다음 학기 후보
            }
        }
    }
    // 순환에 걸린 강의는 진입 차수가 0이 되지 않아 끝까지 남는다
    return taken == n ? semesters : -1;
}
`,
      },
      keyPoints: [
        {
          title: '진입 차수 = 남은 선수 강의 수',
          explanation: '`indegree[b]` 는 b 로 들어오는 간선 수, 즉 아직 수료하지 않은 선수 강의 수입니다. 0이면 지금 바로 들을 수 있습니다. 처음에는 선수 관계에 한 번도 나오지 않은 강의를 포함해 진입 차수가 0인 강의를 **모두** 큐에 넣습니다.',
          lines: {
            python: [
              6,
              9,
              12,
            ],
            javascript: [
              3,
              6,
              11,
              12,
            ],
            java: [
              9,
              12,
              17,
              18,
            ],
            kotlin: [
              4,
              7,
              12,
              13,
            ],
            cpp: [
              8,
              11,
              16,
              17,
            ],
          },
        },
        {
          title: '학기 = 큐의 한 묶음',
          explanation: '격자 BFS 의 레벨 단위 처리와 같습니다. 학기를 시작할 때 큐에 든 강의가 이번 학기에 들을 수 있는 강의이므로, 그 개수만큼만 꺼내고 학기 수를 1 늘립니다. 그동안 새로 들어온 강의는 다음 학기 몫입니다. 강의를 하나 꺼낼 때마다 학기를 늘리면 답이 커집니다.',
          lines: {
            python: [
              16,
              17,
            ],
            javascript: [
              18,
              19,
              20,
            ],
            java: [
              23,
              24,
              25,
            ],
            kotlin: [
              18,
              19,
              20,
            ],
            cpp: [
              22,
              23,
              24,
            ],
          },
        },
        {
          title: '0이 되는 순간에만 넣기',
          explanation: '강의를 수료하면 그 강의를 선수로 둔 강의들의 진입 차수를 1씩 줄이고, **0이 되는 순간** 큐에 넣습니다. 선수 강의가 여럿이면 마지막 선수 강의를 들은 다음 학기에야 들어가므로 학기 계산이 맞고, 강의마다 큐에 정확히 한 번 들어가 O(N + M) 입니다.',
          lines: {
            python: [
              21,
              22,
              23,
            ],
            javascript: [
              24,
              25,
            ],
            java: [
              29,
              30,
            ],
            kotlin: [
              24,
              25,
            ],
            cpp: [
              29,
              30,
            ],
          },
        },
        {
          title: '순환 판별',
          explanation: '순환에 속한 강의들은 서로를 기다리므로 진입 차수가 끝내 0이 되지 않고, 큐에 한 번도 들어가지 못합니다(순환 뒤에 이어진 강의들도 마찬가지입니다). 그래서 큐가 빈 뒤 수료한 강의 수 `taken` 이 `n` 보다 적으면 순환이 있다는 뜻입니다. 이 확인을 빠뜨리고 학기 수를 그대로 돌려주는 실수가 많습니다.',
          lines: {
            python: [
              25,
            ],
            javascript: [
              30,
            ],
            java: [
              35,
            ],
            kotlin: [
              30,
            ],
            cpp: [
              35,
            ],
          },
        },
      ],
    },
    {
      title: 'DFS 후위 순서 + 메모',
      summary: '강의마다 "뒤따르는 가장 긴 사슬" 을 DFS 로 구해 기록합니다. 탐색 중인 강의로 되돌아오면 순환입니다.',
      complexity: {
        time: 'O(N + M)',
        space: 'O(N + M)',
      },
      code: {
        python: `import sys

sys.setrecursionlimit(10**6)  # 선수 관계가 한 줄로 길면 재귀가 n 단계까지 깊어진다


def solution(n, prerequisites):
    graph = [[] for _ in range(n + 1)]
    for a, b in prerequisites:
        graph[a].append(b)

    state = [0] * (n + 1)  # 0: 아직 안 봄, 1: 탐색 중(현재 경로 위), 2: 끝남
    chain = [0] * (n + 1)  # chain[v]: v 부터 시작하는 가장 긴 수강 사슬의 강의 수

    # v 에서 이어지는 강의를 모두 확인한다. 순환을 만나면 False
    def dfs(v):
        state[v] = 1
        longest = 0
        for nxt in graph[v]:
            if state[nxt] == 1:  # 지금 경로 위의 강의로 돌아왔다 = 순환
                return False
            if state[nxt] == 0 and not dfs(nxt):
                return False
            longest = max(longest, chain[nxt])
        chain[v] = longest + 1  # 뒤따르는 강의를 모두 본 뒤(후위)에 확정
        state[v] = 2
        return True

    answer = 0
    for v in range(1, n + 1):
        if state[v] == 0 and not dfs(v):
            return -1
        answer = max(answer, chain[v])
    return answer
`,
        javascript: `function solution(n, prerequisites) {
    const graph = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of prerequisites) {
        graph[a].push(b);
    }

    const state = new Array(n + 1).fill(0); // 0: 아직 안 봄, 1: 탐색 중(현재 경로 위), 2: 끝남
    const chain = new Array(n + 1).fill(0); // chain[v]: v 부터 시작하는 가장 긴 수강 사슬의 강의 수

    // v 에서 이어지는 강의를 모두 확인한다. 순환을 만나면 false
    function dfs(v) {
        state[v] = 1;
        let longest = 0;
        for (const nxt of graph[v]) {
            if (state[nxt] === 1) return false; // 지금 경로 위의 강의로 돌아왔다 = 순환
            if (state[nxt] === 0 && !dfs(nxt)) return false;
            longest = Math.max(longest, chain[nxt]);
        }
        chain[v] = longest + 1; // 뒤따르는 강의를 모두 본 뒤(후위)에 확정
        state[v] = 2;
        return true;
    }

    let answer = 0;
    for (let v = 1; v <= n; v++) {
        if (state[v] === 0 && !dfs(v)) return -1;
        answer = Math.max(answer, chain[v]);
    }
    return answer;
}
`,
        java: `import java.util.ArrayList;
import java.util.List;

class Solution {
    private List<List<Integer>> graph;
    private int[] state; // 0: 아직 안 봄, 1: 탐색 중(현재 경로 위), 2: 끝남
    private int[] chain; // chain[v]: v 부터 시작하는 가장 긴 수강 사슬의 강의 수

    public int solution(int n, int[][] prerequisites) {
        graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            graph.get(p[0]).add(p[1]);
        }
        state = new int[n + 1];
        chain = new int[n + 1];

        int answer = 0;
        for (int v = 1; v <= n; v++) {
            if (state[v] == 0 && !dfs(v)) return -1;
            answer = Math.max(answer, chain[v]);
        }
        return answer;
    }

    // v 에서 이어지는 강의를 모두 확인한다. 순환을 만나면 false
    private boolean dfs(int v) {
        state[v] = 1;
        int longest = 0;
        for (int nxt : graph.get(v)) {
            if (state[nxt] == 1) return false; // 지금 경로 위의 강의로 돌아왔다 = 순환
            if (state[nxt] == 0 && !dfs(nxt)) return false;
            longest = Math.max(longest, chain[nxt]);
        }
        chain[v] = longest + 1; // 뒤따르는 강의를 모두 본 뒤(후위)에 확정
        state[v] = 2;
        return true;
    }
}
`,
        kotlin: `class Solution {
    fun solution(n: Int, prerequisites: Array<IntArray>): Int {
        val graph = Array(n + 1) { mutableListOf<Int>() }
        for ((a, b) in prerequisites) {
            graph[a].add(b)
        }

        val state = IntArray(n + 1) // 0: 아직 안 봄, 1: 탐색 중(현재 경로 위), 2: 끝남
        val chain = IntArray(n + 1) // chain[v]: v 부터 시작하는 가장 긴 수강 사슬의 강의 수

        // v 에서 이어지는 강의를 모두 확인한다. 순환을 만나면 false
        fun dfs(v: Int): Boolean {
            state[v] = 1
            var longest = 0
            for (nxt in graph[v]) {
                if (state[nxt] == 1) return false // 지금 경로 위의 강의로 돌아왔다 = 순환
                if (state[nxt] == 0 && !dfs(nxt)) return false
                longest = maxOf(longest, chain[nxt])
            }
            chain[v] = longest + 1 // 뒤따르는 강의를 모두 본 뒤(후위)에 확정
            state[v] = 2
            return true
        }

        var answer = 0
        for (v in 1..n) {
            if (state[v] == 0 && !dfs(v)) return -1
            answer = maxOf(answer, chain[v])
        }
        return answer
    }
}
`,
        cpp: `#include <algorithm>
#include <functional>
#include <vector>

using namespace std;

int solution(int n, vector<vector<int>> prerequisites) {
    vector<vector<int>> graph(n + 1);
    for (const auto& p : prerequisites) {
        graph[p[0]].push_back(p[1]);
    }

    vector<int> state(n + 1, 0); // 0: 아직 안 봄, 1: 탐색 중(현재 경로 위), 2: 끝남
    vector<int> chain(n + 1, 0); // chain[v]: v 부터 시작하는 가장 긴 수강 사슬의 강의 수

    // v 에서 이어지는 강의를 모두 확인한다. 순환을 만나면 false
    function<bool(int)> dfs = [&](int v) {
        state[v] = 1;
        int longest = 0;
        for (int nxt : graph[v]) {
            if (state[nxt] == 1) return false; // 지금 경로 위의 강의로 돌아왔다 = 순환
            if (state[nxt] == 0 && !dfs(nxt)) return false;
            longest = max(longest, chain[nxt]);
        }
        chain[v] = longest + 1; // 뒤따르는 강의를 모두 본 뒤(후위)에 확정
        state[v] = 2;
        return true;
    };

    int answer = 0;
    for (int v = 1; v <= n; v++) {
        if (state[v] == 0 && !dfs(v)) return -1;
        answer = max(answer, chain[v]);
    }
    return answer;
}
`,
      },
      keyPoints: [
        {
          title: '세 가지 상태로 순환 찾기',
          explanation: '방문 여부만으로는 부족합니다. 1 → 2 → 4, 1 → 3 → 4 처럼 두 갈래가 다시 만나면, 3 에서 이미 방문한 4 를 다시 만나지만 순환은 아닙니다. 그래서 **탐색 중(1)** 과 **끝남(2)** 을 구분합니다. 지금 재귀 경로 위에 있는 강의(상태 1)로 되돌아올 때만 순환이고, 상태 2 인 강의는 이미 계산이 끝난 안전한 강의입니다.',
          lines: {
            python: [
              11,
              16,
              19,
              25,
            ],
            javascript: [
              7,
              12,
              15,
              20,
            ],
            java: [
              6,
              28,
              31,
              36,
            ],
            kotlin: [
              8,
              13,
              16,
              21,
            ],
            cpp: [
              13,
              18,
              21,
              26,
            ],
          },
        },
        {
          title: '후위 순서로 확정',
          explanation: '`chain[v]` 는 v 를 듣고 이어서 들어야 하는 가장 긴 사슬의 강의 수입니다. 뒤따르는 강의들의 값을 **모두 구한 뒤에야** 정할 수 있으므로, 반복문이 끝난 뒤(후위)에 `1 + 최댓값` 으로 확정합니다. 이렇게 확정되는 순서를 뒤집으면 그대로 위상 정렬 순서가 됩니다. 답은 모든 강의의 `chain` 중 최댓값입니다.',
          lines: {
            python: [
              23,
              24,
              32,
            ],
            javascript: [
              17,
              19,
              27,
            ],
            java: [
              21,
              33,
              35,
            ],
            kotlin: [
              18,
              20,
              28,
            ],
            cpp: [
              23,
              25,
              33,
            ],
          },
        },
        {
          title: '메모로 한 번씩만',
          explanation: '상태가 2인 강의는 다시 탐색하지 않고 기록해 둔 `chain` 값을 그대로 씁니다. 그래서 강의와 간선을 한 번씩만 보아 O(N + M) 입니다. 메모 없이 매번 끝까지 따라가면 갈래가 많은 그래프에서 경로 수만큼 지수적으로 느려집니다.',
          lines: {
            python: [
              21,
              30,
            ],
            javascript: [
              16,
              26,
            ],
            java: [
              20,
              32,
            ],
            kotlin: [
              17,
              27,
            ],
            cpp: [
              22,
              32,
            ],
          },
        },
        {
          title: '재귀 깊이',
          explanation: '선수 관계가 한 줄(1 → 2 → … → n)이면 재귀가 n 단계까지 깊어집니다. Python 은 기본 한도 1,000 을 넘을 수 있으므로 `sys.setrecursionlimit` 로 늘립니다. 강의가 10만 개 이상처럼 매우 많다면 Java · Kotlin · JavaScript 도 스택이 부족할 수 있으니 재귀가 없는 Kahn 알고리즘이 안전합니다.',
          lines: {
            python: [
              3,
              21,
            ],
            javascript: [
              16,
            ],
            java: [
              32,
            ],
            kotlin: [
              17,
            ],
            cpp: [
              22,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '간선 방향을 반대로(`b → a`) 넣으면 진입 차수가 뒤바뀌어 엉뚱한 결과가 나옵니다. `[a, b]` 가 무엇을 뜻하는지 먼저 확인하세요.',
    '방향 그래프에서 `visited` 하나로 순환을 판별하면, 두 갈래가 다시 만나는 그래프를 순환으로 잘못 판단합니다.',
    '선수 관계에 한 번도 나오지 않는 강의도 1학기에 들어야 하는 강의입니다. 1부터 n 까지 모두 확인하세요.',
  ],
};

export default content;
