// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'bfs-dfs-grid-shortest-path',
  topicId: 'bfs-dfs',
  order: 2,
  title: '격자 최단 거리 (BFS)',
  summary: '이동 비용이 모두 같을 때 BFS 로 가까운 칸부터 방문해, 처음 도착한 순간의 거리를 최단 거리로 얻습니다.',
  difficulty: 2,
  whenToUse: [
    '"최소 이동 횟수", "최단 거리", "최소 몇 번 만에" 를 물을 때',
    '모든 이동의 비용이 **같을 때** (가중치 없는 그래프 · 격자)',
    '도착할 수 없으면 -1 처럼 **도달 가능 여부**도 함께 물을 때',
  ],
  approach: `모든 이동의 비용이 1로 같다면 **BFS** 로 최단 거리를 구합니다. BFS 는 시작점에서 거리 0인 칸, 거리 1인 칸, 거리 2인 칸… 순서로 방문하므로, 어떤 칸에 **처음 도착했을 때의 거리가 곧 최단 거리**입니다. 칸마다 한 번만 방문하므로 O(R × C) 입니다.

거리를 기록하는 방법은 두 가지입니다.

- **거리 배열**: \`dist[r][c]\` 에 칸마다 거리를 적습니다. -1 로 초기화해 두면 방문 표시도 겸합니다.
- **레벨 단위**: 큐에 든 칸 수만큼씩 끊어서 처리하고, 한 묶음(레벨)을 끝낼 때마다 거리 \`steps\` 를 1 늘립니다.

DFS 는 한 방향으로 깊이 들어가므로 처음 찾은 경로가 최단이라는 보장이 없습니다. 이동 비용이 서로 다르면 BFS 가 아니라 다익스트라를 써야 합니다.`,
  example: {
    description: `창고 지도가 문자열 배열 \`grid\` 로 주어집니다. \`'S'\` 는 출발 칸, \`'E'\` 는 도착 칸, \`'.'\` 은 지나갈 수 있는 칸, \`'#'\` 은 지나갈 수 없는 칸입니다. 한 번에 상하좌우로 한 칸씩 움직일 때, \`S\` 에서 \`E\` 까지 가는 **최소 이동 횟수**를 return 하세요. 도착할 수 없다면 -1 을 return 합니다.

- \`grid\` 의 세로 · 가로 길이는 1 이상 100 이하이고, 모든 문자열의 길이는 같습니다.
- \`S\` 와 \`E\` 는 정확히 하나씩 있습니다.`,
    signature: {
      params: [
        {
          name: 'grid',
          type: 'string[]',
        },
      ],
      returns: 'int',
    },
    examples: [
      {
        input: [
          [
            'S.#.',
            '..#E',
            '#...',
          ],
        ],
        output: 6,
      },
      {
        input: [
          [
            'S#.',
            '##.',
            '..E',
          ],
        ],
        output: -1,
      },
    ],
    tests: [
      {
        input: [
          [
            'S....',
            '####.',
            'E....',
          ],
        ],
        output: 10,
      },
      {
        input: [
          [
            'SE',
          ],
        ],
        output: 1,
      },
      {
        input: [
          [
            'S',
            'E',
          ],
        ],
        output: 1,
      },
      {
        input: [
          [
            'S#E',
          ],
        ],
        output: -1,
      },
      {
        input: [
          [
            'E.....S',
          ],
        ],
        output: 6,
      },
      {
        input: [
          [
            'S......',
            '######.',
            '.......',
            '.######',
            '.......',
            '######.',
            'E......',
          ],
        ],
        output: 30,
      },
      {
        input: [
          [
            'S.........',
            '..........',
            '..........',
            '..........',
            '..........',
            '..........',
            '..........',
            '..........',
            '..........',
            '.........E',
          ],
        ],
        output: 18,
      },
      {
        input: [
          [
            '.....',
            '.###.',
            '.#S#.',
            '.###.',
            '....E',
          ],
        ],
        output: -1,
      },
      {
        input: [
          [
            'S.#...',
            '..#.#.',
            '.##.#.',
            '....#E',
          ],
        ],
        output: 14,
      },
    ],
  },
  implementations: [
    {
      title: '거리 배열',
      summary: '`dist` 를 -1 로 채워 두고, 칸을 큐에 넣을 때 `현재 거리 + 1` 을 기록합니다. `E` 를 처음 꺼낸 순간의 거리가 답입니다.',
      complexity: {
        time: 'O(R × C)',
        space: 'O(R × C)',
      },
      code: {
        python: `from collections import deque

DR = (1, -1, 0, 0)
DC = (0, 0, 1, -1)


def solution(grid):
    rows, cols = len(grid), len(grid[0])
    # dist[r][c]: S 에서 (r, c) 까지의 최소 이동 횟수, -1 은 아직 도착하지 않은 칸
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'S':
                dist[r][c] = 0
                queue.append((r, c))

    while queue:
        r, c = queue.popleft()
        if grid[r][c] == 'E':
            return dist[r][c]  # 처음 꺼낸 E 까지의 거리가 최단 거리
        for d in range(4):
            nr, nc = r + DR[d], c + DC[d]
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == '#' or dist[nr][nc] != -1:
                continue
            dist[nr][nc] = dist[r][c] + 1  # 넣을 때 거리 기록 = 방문 표시
            queue.append((nr, nc))
    return -1
`,
        javascript: `const DR = [1, -1, 0, 0];
const DC = [0, 0, 1, -1];

function solution(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    // dist[r][c]: S 에서 (r, c) 까지의 최소 이동 횟수, -1 은 아직 도착하지 않은 칸
    const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
    const queue = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 'S') {
                dist[r][c] = 0;
                queue.push([r, c]);
            }
        }
    }

    let head = 0;
    while (head < queue.length) {
        const [r, c] = queue[head++];
        if (grid[r][c] === 'E') return dist[r][c]; // 처음 꺼낸 E 까지의 거리가 최단 거리
        for (let d = 0; d < 4; d++) {
            const nr = r + DR[d];
            const nc = c + DC[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
            dist[nr][nc] = dist[r][c] + 1; // 넣을 때 거리 기록 = 방문 표시
            queue.push([nr, nc]);
        }
    }
    return -1;
}
`,
        java: `import java.util.ArrayDeque;
import java.util.Arrays;

class Solution {
    private static final int[] DR = {1, -1, 0, 0};
    private static final int[] DC = {0, 0, 1, -1};

    public int solution(String[] grid) {
        int rows = grid.length;
        int cols = grid[0].length();
        // dist[r][c]: S 에서 (r, c) 까지의 최소 이동 횟수, -1 은 아직 도착하지 않은 칸
        int[][] dist = new int[rows][cols];
        for (int[] row : dist) Arrays.fill(row, -1);
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r].charAt(c) == 'S') {
                    dist[r][c] = 0;
                    queue.add(new int[]{r, c});
                }
            }
        }

        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            int r = cur[0];
            int c = cur[1];
            if (grid[r].charAt(c) == 'E') return dist[r][c]; // 처음 꺼낸 E 까지의 거리가 최단 거리
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d];
                int nc = c + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr].charAt(nc) == '#' || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1; // 넣을 때 거리 기록 = 방문 표시
                queue.add(new int[]{nr, nc});
            }
        }
        return -1;
    }
}
`,
        kotlin: `private val DR = intArrayOf(1, -1, 0, 0)
private val DC = intArrayOf(0, 0, 1, -1)

class Solution {
    fun solution(grid: Array<String>): Int {
        val rows = grid.size
        val cols = grid[0].length
        // dist[r][c]: S 에서 (r, c) 까지의 최소 이동 횟수, -1 은 아직 도착하지 않은 칸
        val dist = Array(rows) { IntArray(cols) { -1 } }
        val queue = ArrayDeque<IntArray>()
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (grid[r][c] == 'S') {
                    dist[r][c] = 0
                    queue.addLast(intArrayOf(r, c))
                }
            }
        }

        while (queue.isNotEmpty()) {
            val (r, c) = queue.removeFirst()
            if (grid[r][c] == 'E') return dist[r][c] // 처음 꺼낸 E 까지의 거리가 최단 거리
            for (d in 0 until 4) {
                val nr = r + DR[d]
                val nc = c + DC[d]
                if (nr !in 0 until rows || nc !in 0 until cols) continue
                if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue
                dist[nr][nc] = dist[r][c] + 1 // 넣을 때 거리 기록 = 방문 표시
                queue.addLast(intArrayOf(nr, nc))
            }
        }
        return -1
    }
}
`,
        cpp: `#include <queue>
#include <string>
#include <utility>
#include <vector>

using namespace std;

const int DR[4] = {1, -1, 0, 0};
const int DC[4] = {0, 0, 1, -1};

int solution(vector<string> grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    // dist[r][c]: S 에서 (r, c) 까지의 최소 이동 횟수, -1 은 아직 도착하지 않은 칸
    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    queue<pair<int, int>> q;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 'S') {
                dist[r][c] = 0;
                q.push({r, c});
            }
        }
    }

    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        if (grid[r][c] == 'E') return dist[r][c]; // 처음 꺼낸 E 까지의 거리가 최단 거리
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d];
            int nc = c + DC[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1; // 넣을 때 거리 기록 = 방문 표시
            q.push({nr, nc});
        }
    }
    return -1;
}
`,
      },
      keyPoints: [
        {
          title: 'dist 가 방문 표시를 겸한다',
          explanation: '`dist` 를 -1 로 채워 두면 "-1 = 아직 도착하지 않은 칸" 이 되어 따로 `visited` 배열이 필요 없습니다. 이웃을 큐에 **넣는 순간** 거리를 기록하므로 각 칸은 큐에 한 번만 들어갑니다. 꺼낼 때 기록하면 같은 칸이 여러 번 들어가 느려집니다.',
          lines: {
            python: [
              10,
              26,
              28,
            ],
            javascript: [
              8,
              27,
              28,
            ],
            java: [
              12,
              13,
              33,
              34,
            ],
            kotlin: [
              9,
              27,
              28,
            ],
            cpp: [
              15,
              34,
              35,
            ],
          },
        },
        {
          title: '처음 꺼낸 E 가 최단',
          explanation: 'BFS 는 거리 순서대로 칸을 꺼내므로, `E` 를 처음 꺼낸 순간의 거리가 최단 거리입니다. 바로 return 해서 남은 칸은 보지 않습니다. 큐가 빌 때까지 `E` 를 못 만났다면 벽에 막혀 도착할 수 없다는 뜻이므로 -1 을 돌려줍니다.',
          lines: {
            python: [
              20,
              21,
              30,
            ],
            javascript: [
              22,
              32,
            ],
            java: [
              28,
              38,
            ],
            kotlin: [
              22,
              32,
            ],
            cpp: [
              29,
              39,
            ],
          },
        },
        {
          title: '시작 칸은 0',
          explanation: '구하는 것은 **이동 횟수**이므로 출발 칸의 거리는 0이고, 이웃은 `dist[r][c] + 1` 입니다. 지나간 칸 수(출발 칸 포함)를 세면 답이 1 크게 나오는 실수가 자주 생깁니다.',
          lines: {
            python: [
              15,
              28,
            ],
            javascript: [
              13,
              28,
            ],
            java: [
              18,
              34,
            ],
            kotlin: [
              14,
              28,
            ],
            cpp: [
              20,
              35,
            ],
          },
        },
        {
          title: '시작점이 여러 개라면',
          explanation: '출발 칸을 찾아 거리 0으로 큐에 넣는 반복문은 `S` 가 여러 개여도 그대로 동작합니다. 시작점을 모두 거리 0으로 넣고 BFS 를 한 번 돌리면 각 칸에 **가장 가까운 시작점까지의 거리**가 기록됩니다(다중 시작점 BFS). 시작점마다 BFS 를 따로 돌리는 것보다 훨씬 빠릅니다.',
          lines: {
            python: [
              12,
              14,
              16,
            ],
            javascript: [
              10,
              12,
              14,
            ],
            java: [
              15,
              17,
              19,
            ],
            kotlin: [
              11,
              13,
              15,
            ],
            cpp: [
              17,
              19,
              21,
            ],
          },
        },
      ],
    },
    {
      title: '레벨 단위 BFS',
      summary: '거리 배열 없이 방문 표시만 하고, 큐에 든 칸 수만큼씩 끊어 처리하며 단계가 끝날 때마다 `steps` 를 1 늘립니다.',
      complexity: {
        time: 'O(R × C)',
        space: 'O(R × C)',
      },
      code: {
        python: `from collections import deque

DR = (1, -1, 0, 0)
DC = (0, 0, 1, -1)


def solution(grid):
    rows, cols = len(grid), len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'S':
                visited[r][c] = True
                queue.append((r, c))

    steps = 0  # 지금 큐에 든 칸들까지의 이동 횟수
    while queue:
        for _ in range(len(queue)):  # 이번 단계(거리 steps)의 칸만 꺼낸다
            r, c = queue.popleft()
            if grid[r][c] == 'E':
                return steps
            for d in range(4):
                nr, nc = r + DR[d], c + DC[d]
                if not (0 <= nr < rows and 0 <= nc < cols):
                    continue
                if grid[nr][nc] == '#' or visited[nr][nc]:
                    continue
                visited[nr][nc] = True
                queue.append((nr, nc))
        steps += 1  # 한 단계를 다 처리하면 거리가 1 늘어난다
    return -1
`,
        javascript: `const DR = [1, -1, 0, 0];
const DC = [0, 0, 1, -1];

function solution(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 'S') {
                visited[r][c] = true;
                queue.push([r, c]);
            }
        }
    }

    let head = 0;
    let steps = 0; // 지금 큐에 든 칸들까지의 이동 횟수
    while (head < queue.length) {
        const size = queue.length - head; // 이번 단계(거리 steps)의 칸 수
        for (let i = 0; i < size; i++) {
            const [r, c] = queue[head++];
            if (grid[r][c] === 'E') return steps;
            for (let d = 0; d < 4; d++) {
                const nr = r + DR[d];
                const nc = c + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] === '#' || visited[nr][nc]) continue;
                visited[nr][nc] = true;
                queue.push([nr, nc]);
            }
        }
        steps++; // 한 단계를 다 처리하면 거리가 1 늘어난다
    }
    return -1;
}
`,
        java: `import java.util.ArrayDeque;

class Solution {
    private static final int[] DR = {1, -1, 0, 0};
    private static final int[] DC = {0, 0, 1, -1};

    public int solution(String[] grid) {
        int rows = grid.length;
        int cols = grid[0].length();
        boolean[][] visited = new boolean[rows][cols];
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r].charAt(c) == 'S') {
                    visited[r][c] = true;
                    queue.add(new int[]{r, c});
                }
            }
        }

        int steps = 0; // 지금 큐에 든 칸들까지의 이동 횟수
        while (!queue.isEmpty()) {
            int size = queue.size(); // 이번 단계(거리 steps)의 칸 수
            for (int i = 0; i < size; i++) {
                int[] cur = queue.poll();
                int r = cur[0];
                int c = cur[1];
                if (grid[r].charAt(c) == 'E') return steps;
                for (int d = 0; d < 4; d++) {
                    int nr = r + DR[d];
                    int nc = c + DC[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (grid[nr].charAt(nc) == '#' || visited[nr][nc]) continue;
                    visited[nr][nc] = true;
                    queue.add(new int[]{nr, nc});
                }
            }
            steps++; // 한 단계를 다 처리하면 거리가 1 늘어난다
        }
        return -1;
    }
}
`,
        kotlin: `private val DR = intArrayOf(1, -1, 0, 0)
private val DC = intArrayOf(0, 0, 1, -1)

class Solution {
    fun solution(grid: Array<String>): Int {
        val rows = grid.size
        val cols = grid[0].length
        val visited = Array(rows) { BooleanArray(cols) }
        val queue = ArrayDeque<IntArray>()
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (grid[r][c] == 'S') {
                    visited[r][c] = true
                    queue.addLast(intArrayOf(r, c))
                }
            }
        }

        var steps = 0 // 지금 큐에 든 칸들까지의 이동 횟수
        while (queue.isNotEmpty()) {
            val size = queue.size // 이번 단계(거리 steps)의 칸 수
            for (i in 0 until size) {
                val (r, c) = queue.removeFirst()
                if (grid[r][c] == 'E') return steps
                for (d in 0 until 4) {
                    val nr = r + DR[d]
                    val nc = c + DC[d]
                    if (nr !in 0 until rows || nc !in 0 until cols) continue
                    if (grid[nr][nc] == '#' || visited[nr][nc]) continue
                    visited[nr][nc] = true
                    queue.addLast(intArrayOf(nr, nc))
                }
            }
            steps++ // 한 단계를 다 처리하면 거리가 1 늘어난다
        }
        return -1
    }
}
`,
        cpp: `#include <queue>
#include <string>
#include <utility>
#include <vector>

using namespace std;

const int DR[4] = {1, -1, 0, 0};
const int DC[4] = {0, 0, 1, -1};

int solution(vector<string> grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    vector<vector<bool>> visited(rows, vector<bool>(cols, false));
    queue<pair<int, int>> q;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 'S') {
                visited[r][c] = true;
                q.push({r, c});
            }
        }
    }

    int steps = 0; // 지금 큐에 든 칸들까지의 이동 횟수
    while (!q.empty()) {
        int size = q.size(); // 이번 단계(거리 steps)의 칸 수
        for (int i = 0; i < size; i++) {
            auto [r, c] = q.front();
            q.pop();
            if (grid[r][c] == 'E') return steps;
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d];
                int nc = c + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == '#' || visited[nr][nc]) continue;
                visited[nr][nc] = true;
                q.push({nr, nc});
            }
        }
        steps++; // 한 단계를 다 처리하면 거리가 1 늘어난다
    }
    return -1;
}
`,
      },
      keyPoints: [
        {
          title: '큐 크기만큼 끊기',
          explanation: '한 단계를 시작할 때 큐에 든 칸은 모두 거리가 `steps` 인 칸입니다. 그 개수만큼만 꺼내면 정확히 한 단계를 처리하고, 그동안 새로 넣은 칸(거리 `steps + 1`)은 다음 단계로 넘어갑니다. 그래서 크기를 **미리 변수에 저장**해야 합니다. `for (i < queue.size())` 처럼 매번 크기를 다시 읽으면 새로 넣은 칸까지 섞입니다. (Python 의 `range(len(queue))` 는 시작할 때 한 번만 계산되므로 괜찮습니다.)',
          lines: {
            python: [
              19,
            ],
            javascript: [
              21,
              22,
            ],
            java: [
              23,
              24,
            ],
            kotlin: [
              21,
              22,
            ],
            cpp: [
              27,
              28,
            ],
          },
        },
        {
          title: 'steps 를 올리는 위치',
          explanation: '한 단계를 모두 처리한 뒤에 `steps` 를 1 늘립니다. 칸을 하나 꺼낼 때마다 늘리면 이동 횟수가 아니라 방문한 칸 수가 됩니다. `E` 를 꺼낸 순간의 `steps` 가 답입니다.',
          lines: {
            python: [
              17,
              21,
              22,
              31,
            ],
            javascript: [
              19,
              24,
              34,
            ],
            java: [
              21,
              28,
              38,
            ],
            kotlin: [
              19,
              24,
              34,
            ],
            cpp: [
              25,
              31,
              41,
            ],
          },
        },
        {
          title: '거리 배열이 필요 없다',
          explanation: '거리는 단계 수 `steps` 하나로 알 수 있으므로, 칸마다는 방문 여부만 기록합니다. "1초마다 불이 번지고 그다음 사람이 움직인다" 처럼 **단계마다 할 일**이 있는 시뮬레이션 문제에서 이 형태가 특히 편합니다.',
          lines: {
            python: [
              9,
              29,
            ],
            javascript: [
              7,
              30,
            ],
            java: [
              10,
              34,
            ],
            kotlin: [
              8,
              30,
            ],
            cpp: [
              14,
              37,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '이동 횟수가 아니라 지나간 칸 수(출발 칸 포함)를 세면 답이 1 커집니다.',
    'DFS 로 처음 찾은 경로를 답으로 하면 안 됩니다. 멀리 돌아가는 경로를 먼저 찾을 수 있습니다.',
    '이동 비용이 칸마다 다르면 "처음 도착 = 최단" 이 성립하지 않습니다. 다익스트라를 쓰세요.',
    'Python 에서 큐로 `list.pop(0)` 을 쓰면 꺼낼 때마다 O(N) 이라 큰 격자에서 시간 초과가 납니다.',
  ],
  quizIds: [
    'algo-bfs-dfs-q01',
  ],
};

export default content;
