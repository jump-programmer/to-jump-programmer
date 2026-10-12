// 공개 저장소용 샘플 콘텐츠 — `npm run content:sample` 로 생성. 전체 콘텐츠는 비공개 저장소에 있습니다.
import type { AlgoPattern } from '@/content/types';

const content: AlgoPattern = {
  id: 'bfs-dfs-connected-components',
  topicId: 'bfs-dfs',
  order: 1,
  title: '연결 요소 세기 (격자 섬 개수)',
  summary: '아직 방문하지 않은 칸에서 탐색을 시작할 때마다 덩어리 하나를 찾은 것으로 세고, 이어진 칸을 모두 방문 처리합니다.',
  difficulty: 1,
  whenToUse: [
    '"이어진 영역의 개수", "덩어리 수", "그룹 수" 를 셀 때',
    '격자에서 **상하좌우로 맞닿은 칸**을 하나로 묶을 때',
    '그래프에서 서로 오갈 수 있는 정점끼리 묶을 때 (**연결 요소**)',
  ],
  approach: `섬은 땅 칸들이 상하좌우로 이어진 덩어리, 즉 그래프의 **연결 요소**입니다. 칸을 정점, 맞닿은 두 땅 칸 사이를 간선으로 보면 "섬의 개수 = 연결 요소의 개수" 입니다.

1. 모든 칸을 위에서부터 차례로 확인합니다.
2. 아직 방문하지 않은 땅을 만나면 새 섬이므로 개수를 1 늘립니다.
3. 그 칸에서 DFS 나 BFS 로 이어진 땅을 **모두** 방문 처리합니다. 이 땅들은 다시 세지 않습니다.

모든 칸을 한 번씩만 방문하므로 O(R × C) 입니다. "모두 방문" 이 목적이라 DFS 와 BFS 중 무엇을 써도 답은 같습니다. 다만 재귀 DFS 는 섬이 크면 재귀가 그만큼 깊어지므로, 격자가 크면 BFS(또는 스택을 쓰는 반복 DFS)가 안전합니다.

네 방향은 \`DR\`, \`DC\` 배열로 두고 반복문 하나로 처리합니다. 대각선까지 이어진 것으로 보는 문제라면 방향을 8개로 늘리면 됩니다.`,
  example: {
    description: `지도가 문자열 배열 \`grid\` 로 주어집니다. \`'#'\` 은 땅, \`'.'\` 은 바다입니다. 상하좌우로 맞닿은 땅은 같은 섬이고, 대각선으로만 닿은 땅은 서로 다른 섬입니다. 지도에 있는 섬의 개수를 return 하세요.

- \`grid\` 의 세로 · 가로 길이는 1 이상 100 이하이고, 모든 문자열의 길이는 같습니다.`,
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
            '##..#',
            '#...#',
            '..#..',
            '...##',
          ],
        ],
        output: 4,
      },
      {
        input: [
          [
            '#####',
            '#...#',
            '#.#.#',
            '#...#',
            '#####',
          ],
        ],
        output: 2,
      },
    ],
    tests: [
      {
        input: [
          [
            '....',
            '....',
          ],
        ],
        output: 0,
      },
      {
        input: [
          [
            '#',
          ],
        ],
        output: 1,
      },
      {
        input: [
          [
            '.',
          ],
        ],
        output: 0,
      },
      {
        input: [
          [
            '#.#.#',
          ],
        ],
        output: 3,
      },
      {
        input: [
          [
            '#',
            '#',
            '.',
            '#',
          ],
        ],
        output: 2,
      },
      {
        input: [
          [
            '#.#.#.',
            '.#.#.#',
            '#.#.#.',
            '.#.#.#',
          ],
        ],
        output: 12,
      },
      {
        input: [
          [
            '##.##',
            '#...#',
            '.....',
            '#...#',
            '##.##',
          ],
        ],
        output: 4,
      },
      {
        input: [
          [
            '#########',
            '........#',
            '#########',
            '#........',
            '#########',
            '........#',
            '#########',
            '#........',
            '#########',
          ],
        ],
        output: 1,
      },
      {
        input: [
          [
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
            '########################################',
          ],
        ],
        output: 1,
      },
    ],
  },
  implementations: [
    {
      title: '재귀 DFS',
      summary: '`dfs(r, c)` 가 자신을 방문 처리하고, 아직 방문하지 않은 이웃 땅으로 재귀 호출합니다. 코드가 가장 짧습니다.',
      complexity: {
        time: 'O(R × C)',
        space: 'O(R × C)',
      },
      code: {
        python: `import sys

sys.setrecursionlimit(10**6)  # 섬이 크면 재귀가 칸 수만큼 깊어진다

DR = (1, -1, 0, 0)
DC = (0, 0, 1, -1)


def solution(grid):
    rows, cols = len(grid), len(grid[0])
    visited = [[False] * cols for _ in range(rows)]

    # (r, c) 와 이어진 땅을 모두 방문한다
    def dfs(r, c):
        visited[r][c] = True
        for d in range(4):
            nr, nc = r + DR[d], c + DC[d]
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == '#' and not visited[nr][nc]:
                dfs(nr, nc)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '#' and not visited[r][c]:
                dfs(r, c)  # 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands += 1
    return islands
`,
        javascript: `const DR = [1, -1, 0, 0];
const DC = [0, 0, 1, -1];

function solution(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

    // (r, c) 와 이어진 땅을 모두 방문한다
    function dfs(r, c) {
        visited[r][c] = true;
        for (let d = 0; d < 4; d++) {
            const nr = r + DR[d];
            const nc = c + DC[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] === '#' && !visited[nr][nc]) {
                dfs(nr, nc);
            }
        }
    }

    let islands = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '#' && !visited[r][c]) {
                dfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands++;
            }
        }
    }
    return islands;
}
`,
        java: `class Solution {
    private static final int[] DR = {1, -1, 0, 0};
    private static final int[] DC = {0, 0, 1, -1};
    private String[] grid;
    private boolean[][] visited;
    private int rows;
    private int cols;

    public int solution(String[] grid) {
        this.grid = grid;
        rows = grid.length;
        cols = grid[0].length();
        visited = new boolean[rows][cols];
        int islands = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r].charAt(c) == '#' && !visited[r][c]) {
                    dfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                    islands++;
                }
            }
        }
        return islands;
    }

    // (r, c) 와 이어진 땅을 모두 방문한다
    private void dfs(int r, int c) {
        visited[r][c] = true;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d];
            int nc = c + DC[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr].charAt(nc) == '#' && !visited[nr][nc]) {
                dfs(nr, nc);
            }
        }
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

        // (r, c) 와 이어진 땅을 모두 방문한다
        fun dfs(r: Int, c: Int) {
            visited[r][c] = true
            for (d in 0 until 4) {
                val nr = r + DR[d]
                val nc = c + DC[d]
                if (nr !in 0 until rows || nc !in 0 until cols) continue
                if (grid[nr][nc] == '#' && !visited[nr][nc]) {
                    dfs(nr, nc)
                }
            }
        }

        var islands = 0
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (grid[r][c] == '#' && !visited[r][c]) {
                    dfs(r, c) // 새 섬 발견: 이어진 땅을 모두 방문 처리
                    islands++
                }
            }
        }
        return islands
    }
}
`,
        cpp: `#include <functional>
#include <string>
#include <vector>

using namespace std;

const int DR[4] = {1, -1, 0, 0};
const int DC[4] = {0, 0, 1, -1};

int solution(vector<string> grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    vector<vector<bool>> visited(rows, vector<bool>(cols, false));

    // (r, c) 와 이어진 땅을 모두 방문한다
    function<void(int, int)> dfs = [&](int r, int c) {
        visited[r][c] = true;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d];
            int nc = c + DC[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == '#' && !visited[nr][nc]) {
                dfs(nr, nc);
            }
        }
    };

    int islands = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '#' && !visited[r][c]) {
                dfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands++;
            }
        }
    }
    return islands;
}
`,
      },
      keyPoints: [
        {
          title: '새 땅을 만날 때만 센다',
          explanation: '바깥 이중 반복문이 모든 칸을 훑다가 **아직 방문하지 않은 땅**을 만나면 새 섬입니다. `dfs` 가 그 섬의 땅을 모두 방문 처리하므로, 같은 섬의 다른 칸은 다시 세지 않습니다. 모든 칸은 한 번씩만 방문되어 O(R × C) 입니다.',
          lines: {
            python: [
              26,
              27,
              28,
            ],
            javascript: [
              25,
              26,
              27,
            ],
            java: [
              17,
              18,
              19,
            ],
            kotlin: [
              26,
              27,
              28,
            ],
            cpp: [
              31,
              32,
              33,
            ],
          },
        },
        {
          title: '들어오자마자 방문 표시',
          explanation: '`dfs` 의 첫 줄에서 방문 표시를 해야, 이웃 칸이 다시 나를 호출하는 일이 없습니다. 표시를 재귀 호출 뒤로 미루면 두 칸이 서로를 끝없이 호출해 무한 재귀에 빠집니다.',
          lines: {
            python: [
              15,
            ],
            javascript: [
              11,
            ],
            java: [
              28,
            ],
            kotlin: [
              12,
            ],
            cpp: [
              17,
            ],
          },
        },
        {
          title: '범위 검사가 먼저',
          explanation: '이웃 좌표가 격자 밖이면 `grid` 에 접근하기 전에 건너뜁니다. 특히 Python 은 `grid[-1]` 이 에러 없이 **마지막 행**을 돌려주므로, 범위 검사를 빠뜨리면 위쪽 끝과 아래쪽 끝(왼쪽 끝과 오른쪽 끝)이 이어진 것처럼 잘못 계산합니다. 다른 언어는 범위를 벗어나면 예외가 나거나(Java · Kotlin · JavaScript) 정의되지 않은 동작(C++)이 됩니다.',
          lines: {
            python: [
              18,
            ],
            javascript: [
              15,
            ],
            java: [
              32,
            ],
            kotlin: [
              16,
            ],
            cpp: [
              21,
            ],
          },
        },
        {
          title: '재귀 깊이',
          explanation: '섬 하나가 크면 재귀가 그 섬의 칸 수만큼 깊어집니다(100 × 100 이면 최대 1만 단계). Python 의 기본 재귀 한도는 1,000 이라 `RecursionError` 가 나므로 `sys.setrecursionlimit` 로 늘립니다. Java · Kotlin · JavaScript 도 기본 스택으로는 수만 단계에서 스택 오버플로가 날 수 있어, 격자가 더 크면 BFS 나 스택을 쓰는 반복 DFS 로 바꿉니다.',
          lines: {
            python: [
              3,
              21,
            ],
            javascript: [
              17,
            ],
            java: [
              34,
            ],
            kotlin: [
              18,
            ],
            cpp: [
              23,
            ],
          },
        },
      ],
    },
    {
      title: 'BFS (큐)',
      summary: '시작 칸을 큐에 넣고, 꺼낸 칸의 이웃 땅을 방문 표시하며 큐에 넣습니다. 재귀가 없어 큰 섬에서도 안전합니다.',
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

    # (sr, sc) 와 이어진 땅을 모두 방문한다
    def bfs(sr, sc):
        visited[sr][sc] = True
        queue = deque([(sr, sc)])
        while queue:
            r, c = queue.popleft()
            for d in range(4):
                nr, nc = r + DR[d], c + DC[d]
                if not (0 <= nr < rows and 0 <= nc < cols):
                    continue
                if grid[nr][nc] == '#' and not visited[nr][nc]:
                    visited[nr][nc] = True  # 큐에 넣을 때 방문 표시
                    queue.append((nr, nc))

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '#' and not visited[r][c]:
                bfs(r, c)  # 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands += 1
    return islands
`,
        javascript: `const DR = [1, -1, 0, 0];
const DC = [0, 0, 1, -1];

function solution(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

    // (sr, sc) 와 이어진 땅을 모두 방문한다
    function bfs(sr, sc) {
        visited[sr][sc] = true;
        const queue = [[sr, sc]];
        let head = 0; // shift() 는 O(N) 이므로 꺼낼 위치만 옮긴다
        while (head < queue.length) {
            const [r, c] = queue[head++];
            for (let d = 0; d < 4; d++) {
                const nr = r + DR[d];
                const nc = c + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] === '#' && !visited[nr][nc]) {
                    visited[nr][nc] = true; // 큐에 넣을 때 방문 표시
                    queue.push([nr, nc]);
                }
            }
        }
    }

    let islands = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '#' && !visited[r][c]) {
                bfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands++;
            }
        }
    }
    return islands;
}
`,
        java: `import java.util.ArrayDeque;

class Solution {
    private static final int[] DR = {1, -1, 0, 0};
    private static final int[] DC = {0, 0, 1, -1};
    private String[] grid;
    private boolean[][] visited;
    private int rows;
    private int cols;

    public int solution(String[] grid) {
        this.grid = grid;
        rows = grid.length;
        cols = grid[0].length();
        visited = new boolean[rows][cols];
        int islands = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r].charAt(c) == '#' && !visited[r][c]) {
                    bfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                    islands++;
                }
            }
        }
        return islands;
    }

    // (sr, sc) 와 이어진 땅을 모두 방문한다
    private void bfs(int sr, int sc) {
        visited[sr][sc] = true;
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[]{sr, sc});
        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            for (int d = 0; d < 4; d++) {
                int nr = cur[0] + DR[d];
                int nc = cur[1] + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr].charAt(nc) == '#' && !visited[nr][nc]) {
                    visited[nr][nc] = true; // 큐에 넣을 때 방문 표시
                    queue.add(new int[]{nr, nc});
                }
            }
        }
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

        // (sr, sc) 와 이어진 땅을 모두 방문한다
        fun bfs(sr: Int, sc: Int) {
            visited[sr][sc] = true
            val queue = ArrayDeque<IntArray>()
            queue.addLast(intArrayOf(sr, sc))
            while (queue.isNotEmpty()) {
                val (r, c) = queue.removeFirst()
                for (d in 0 until 4) {
                    val nr = r + DR[d]
                    val nc = c + DC[d]
                    if (nr !in 0 until rows || nc !in 0 until cols) continue
                    if (grid[nr][nc] == '#' && !visited[nr][nc]) {
                        visited[nr][nc] = true // 큐에 넣을 때 방문 표시
                        queue.addLast(intArrayOf(nr, nc))
                    }
                }
            }
        }

        var islands = 0
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (grid[r][c] == '#' && !visited[r][c]) {
                    bfs(r, c) // 새 섬 발견: 이어진 땅을 모두 방문 처리
                    islands++
                }
            }
        }
        return islands
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

    // (sr, sc) 와 이어진 땅을 모두 방문한다
    auto bfs = [&](int sr, int sc) {
        visited[sr][sc] = true;
        queue<pair<int, int>> q;
        q.push({sr, sc});
        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d];
                int nc = c + DC[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == '#' && !visited[nr][nc]) {
                    visited[nr][nc] = true; // 큐에 넣을 때 방문 표시
                    q.push({nr, nc});
                }
            }
        }
    };

    int islands = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '#' && !visited[r][c]) {
                bfs(r, c); // 새 섬 발견: 이어진 땅을 모두 방문 처리
                islands++;
            }
        }
    }
    return islands;
}
`,
      },
      keyPoints: [
        {
          title: '큐에 넣을 때 방문 표시',
          explanation: '이웃을 큐에 **넣는 순간** 방문 표시를 합니다. 꺼낼 때 표시하면, 큐에 들어 있지만 아직 꺼내지 않은 칸이 미방문으로 보여 여러 이웃이 같은 칸을 중복으로 넣습니다. 넣을 때 표시하면 각 칸은 큐에 정확히 한 번만 들어갑니다. 시작 칸도 같은 이유로 넣기 전에 표시합니다.',
          lines: {
            python: [
              13,
              22,
            ],
            javascript: [
              11,
              21,
            ],
            java: [
              30,
              40,
            ],
            kotlin: [
              12,
              22,
            ],
            cpp: [
              18,
              29,
            ],
          },
        },
        {
          title: '언어별 큐',
          explanation: 'Python 은 `collections.deque` 의 `popleft()` 가 O(1) 입니다(`list.pop(0)` 은 O(N)). JavaScript 배열의 `shift()` 도 O(N) 이라 읽을 위치 `head` 만 옮깁니다. Java 는 `ArrayDeque`, Kotlin 은 표준 라이브러리의 `ArrayDeque`, C++ 은 `std::queue` 를 씁니다.',
          lines: {
            python: [
              14,
              16,
            ],
            javascript: [
              12,
              13,
              15,
            ],
            java: [
              31,
              34,
            ],
            kotlin: [
              13,
              16,
            ],
            cpp: [
              19,
              22,
              23,
            ],
          },
        },
        {
          title: '재귀 깊이 걱정이 없다',
          explanation: '반복문으로 큐를 비울 때까지 돌므로 섬이 아무리 커도 호출 스택이 깊어지지 않습니다. 대신 큐가 최대 O(R × C) 칸을 담습니다. 방문 순서만 DFS 와 다를 뿐, 섬마다 한 번씩 `bfs` 가 불리는 구조는 같아서 답도 같습니다.',
          lines: {
            python: [
              15,
            ],
            javascript: [
              14,
            ],
            java: [
              33,
            ],
            kotlin: [
              15,
            ],
            cpp: [
              21,
            ],
          },
        },
      ],
    },
  ],
  pitfalls: [
    '대각선까지 연결로 보는지(8방향) 문제를 꼭 확인하세요. 방향을 잘못 잡으면 섬이 합쳐지거나 나뉩니다.',
    'BFS 에서 큐에서 **꺼낼 때** 방문 표시를 하면 같은 칸이 큐에 여러 번 들어가 시간과 메모리가 크게 늘어납니다.',
    '재귀 DFS 에서 방문 표시를 재귀 호출 뒤에 하면 두 칸이 서로를 계속 호출하는 무한 재귀가 됩니다.',
  ],
};

export default content;
