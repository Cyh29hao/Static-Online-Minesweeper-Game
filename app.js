const SIZE = 10;
const CELL_COUNT = SIZE * SIZE;
const VARIANT_LABELS = "ABCDEFGH".split("");
const LOCAL_SCORE_KEY = "static-minesweeper-v04-scores";
const SCORE_CONFIG = {
  supabaseUrl: "https://lsnynqzltxdodjnkbjyf.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbnlucXpsdHhkb2RqbmtianlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDQzMDUsImV4cCI6MjA4OTQyMDMwNX0.hLjB4DkI68DpQ_TzUKAHxHPhw3rVUPBO9E2peIulX0c",
  table: "minesweeper_scores"
};
const PROJECT_NAME = "Static-Online-Minesweeper-Game";
const VERSION_LABEL = "Ver 0.4.3";
const RELEASE_LABEL = "\u53d1\u5e03\u4e8e 2026-03-19";

const LEVELS = {
  kindergarten: {
    name: "幼儿园级",
    summary: "大面积的 0 和边角强提示会很快把局面打开，几乎属于读题就会做的热身图。",
    note: "适合第一次体验这套规则，主要练习把 0、满值和边线提示串起来。",
    board: "0000010000000101000000001000000000011010000000000000100000000000010100001100010000000010000000000000"
  },
  entry: {
    name: "入门级",
    summary: "明显格还很多，但已经开始出现需要来回对照两个局部区域的信息交叉。",
    note: "比幼儿园级更像正式解题，适合熟悉已知数字全开的思考方式。",
    board: "0000000100000100000000100011010010010000000000101000000010000101000010001001000000100000101010000000"
  },
  advanced: {
    name: "进阶级",
    summary: "中值数字增多，局部不能只看一眼，需要在几片区域之间反复核对。",
    note: "开始出现更像长链的中盘推理，建议先抓住边缘，再回收内部空间。",
    board: "0000001011000110000000000000011001010100011000010010000110100011001000000100010001010010000000011000"
  },
  expert: {
    name: "专家级",
    summary: "显然格明显减少，很多位置要等别处先落地，适合喜欢连续推演的人。",
    note: "如果卡住，先重新统计错旗风险，再找能同时约束多条边的数字串。",
    board: "1000100000010111100010100010000010101000000010010101000000100000101000100111011001100100100101001100"
  },
  top: {
    name: "顶尖人类级",
    summary: "几乎整盘都是中值数字，简单模式解不开，需要长段连锁逻辑才能稳定推进。",
    note: "这是刻意做得很密的图，读法更接近静态逻辑题而不是普通扫雷残局。",
    board: "1100000100010011000101100001111011011001010010000000101000001001000101000000110110000011110001010100"
  },
  impossible: {
    name: "\u6311\u6218\u4e0d\u53ef\u80fd\u7ea7",
    summary: "\u8fd9\u4e00\u6863\u4e0d\u518d\u662f\u5355\u5f20\u5e95\u56fe\u65cb\u8f6c\uff0c\u800c\u662f\u4e00\u7ec4\u547d\u540d\u7edd\u8c31\u3002\u5b83\u4eec\u96f7\u91cf\u3001\u9898\u98ce\u90fd\u4e0d\u540c\uff0c\u4f46\u90fd\u6545\u610f\u628a\u5165\u53e3\u85cf\u5f97\u5f88\u6df1\u3002",
    note: "\u8fd9\u4e9b\u9898\u4f1a\u5148\u7528\u5347\u7ea7\u540e\u7684\u68c0\u9a8c\u7a0b\u5e8f\u8dd1\u57fa\u7840\u5c42\uff0c\u518d\u8dd1\u5355\u70b9\u8bd5\u63a2\u5c42\uff1b\u53ea\u6709\u4ecd\u7136\u51e0\u4e4e\u6ca1\u6709\u81ea\u7136\u5165\u53e3\u7684\u9898\uff0c\u624d\u4f1a\u7559\u5728\u8fd9\u91cc\u3002",
    puzzles: [
      {
        key: "ge-yun-shou",
        code: "\u8c31\u4e00",
        title: "\u9694\u4e91\u624b",
        note: "\u5165\u53e3\u88ab\u62c6\u6563\u5728\u51e0\u7247\u533a\u57df\u91cc\uff0c\u5fc5\u987b\u628a\u8fdc\u5904\u6570\u5b57\u4e32\u8054\u8d77\u6765\u770b\uff0c\u624d\u80fd\u627e\u5230\u7b2c\u4e00\u53e3\u6c14\u3002",
        board: "1110000111010110111000001010001001101111010100000100100100011000101010110001110010100101111001000000"
      },
      {
        key: "kou-tian-guan",
        code: "\u8c31\u4e8c",
        title: "\u53e9\u5929\u5173",
        note: "\u51e0\u4e4e\u6574\u76d8\u90fd\u662f\u4e2d\u503c\u6570\u5b57\uff0c\u5c40\u90e8\u770b\u4f3c\u90fd\u80fd\u8bf4\u4e24\u53e5\uff0c\u771f\u6b63\u843d\u5b50\u65f6\u5374\u5e38\u5e38\u8981\u786c\u62f1\u4e2d\u76d8\u3002",
        board: "0001001100100101101001001000001101111101111100001101010111111011000001100100001100111010111101010001"
      },
      {
        key: "man-cheng-xue",
        code: "\u8c31\u4e09",
        title: "\u6ee1\u57ce\u96ea",
        note: "\u5168\u76d8\u8fd1\u4e4e\u88ab\u540c\u7c7b\u6570\u5b57\u8986\u76d6\uff0c\u8bfb\u8d77\u6765\u50cf\u4e00\u7247\u767d\u832b\u832b\u7684\u96ea\u5e55\uff0c\u771f\u6b63\u96be\u70b9\u5728\u4e8e\u5206\u8fa8\u7ec6\u5fae\u7834\u53e3\u3002",
        board: "1101010101101010101001010101011010101010110101010110101010100101010101101010101001010101011010101010"
      },
      {
        key: "duan-long-mai",
        code: "\u8c31\u56db",
        title: "\u65ad\u9f99\u8109",
        note: "\u9ad8\u5bc6\u5ea6\u76d8\u9762\u51e0\u4e4e\u4e0d\u7ed9\u660e\u663e\u5165\u53e3\uff0c\u5fc5\u987b\u5728\u591a\u4e2a\u6218\u573a\u95f4\u6765\u56de\u5207\u6362\uff0c\u624d\u80fd\u622a\u4f4f\u771f\u6b63\u7684\u4e3b\u7ebf\u3002",
        board: "1001101101010011001101100001001110110100111001101110101111000010110110110110111011010100010011011110"
      },
      {
        key: "wan-lei-hai",
        code: "\u8c31\u4e94",
        title: "\u4e07\u96f7\u6d77",
        note: "\u96f7\u91cf\u6781\u9ad8\uff0c\u5b89\u5168\u683c\u50cf\u5b64\u5c9b\u4e00\u6837\u96f6\u788e\u3002\u5f88\u591a\u65f6\u5019\u4e0d\u662f\u5728\u627e\u96f7\uff0c\u800c\u662f\u5728\u82e6\u82e6\u786e\u8ba4\u54ea\u4e00\u5c0f\u5757\u8fd8\u80fd\u6d3b\u3002",
        board: "0101000111001110100111110111011011111100100111000101010111111011100101101111101011011101011111100011"
      }
    ]
  }
};

const state = {
  levelKey: "kindergarten",
  board: [],
  clues: [],
  marks: [],
  mineCount: 0,
  safeTotal: 0,
  variantIndex: 0,
  variantPool: [],
  currentPuzzle: null,
  result: "playing",
  explodedIndex: -1,
  pendingMineIndex: -1,
  undoUsed: false,
  flashIndex: -1,
  flashType: "",
  flashToken: 0,
  boardBlast: false,
  boardBlastToken: 0,
  timerStartedAt: 0,
  finalElapsedMs: 0,
  timerIntervalId: 0,
  leaderboard: {
    mode: "local",
    loading: false,
    count: 0,
    fastestMs: null,
    top: [],
    note: "通关后可留下名字。",
    submitMessage: "",
    submitted: false,
    submitting: false
  },
  honors: {
    mode: "local",
    loading: false,
    recentFirsts: [],
    impossibleLeaders: [],
    note: "\u70b9\u51fb\u9898\u540d\u53ef\u76f4\u63a5\u8df3\u5230\u5bf9\u5e94\u9898\u3002"
  },
  touch: {
    timerId: 0,
    index: -1,
    mode: "none",
    startMark: "unknown",
    longTriggered: false,
    suppressClick: false,
    startX: 0,
    startY: 0,
    moved: false,
    suppressUntil: 0,
    armedButton: null
  }
};

let flashTimeoutId = 0;
let boardBlastTimeoutId = 0;

const refs = {
  difficultySelect: document.getElementById("difficulty-select"),
  puzzleSelect: document.getElementById("puzzle-select"),
  newGameBtn: document.getElementById("new-game-btn"),
  shuffleBtn: document.getElementById("shuffle-btn"),
  boardWrap: document.getElementById("board-wrap"),
  board: document.getElementById("board"),
  lossPanel: document.getElementById("loss-panel"),
  undoBtn: document.getElementById("undo-btn"),
  giveUpBtn: document.getElementById("give-up-btn"),
  undoNote: document.getElementById("undo-note"),
  statusText: document.getElementById("status-text"),
  timerText: document.getElementById("timer-text"),
  safeProgress: document.getElementById("safe-progress"),
  flagProgress: document.getElementById("flag-progress"),
  difficultyName: document.getElementById("difficulty-name"),
  difficultyCopy: document.getElementById("difficulty-copy"),
  difficultyNote: document.getElementById("difficulty-note"),
  mineCountText: document.getElementById("mine-count-text"),
  variantText: document.getElementById("variant-text"),
  clearCountText: document.getElementById("clear-count-text"),
  fastestText: document.getElementById("fastest-text"),
  rankMode: document.getElementById("rank-mode"),
  currentRankTitle: document.getElementById("current-rank-title"),
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardNote: document.getElementById("leaderboard-note"),
  gloryLabel: document.getElementById("glory-label"),
  gloryTitle: document.getElementById("glory-title"),
  gloryNote: document.getElementById("glory-note"),
  gloryList: document.getElementById("glory-list"),
  gloryPanel: document.getElementById("glory-panel"),
  impossibleHallLabel: document.getElementById("impossible-hall-label"),
  impossibleHallTitle: document.getElementById("impossible-hall-title"),
  impossibleHallNote: document.getElementById("impossible-hall-note"),
  impossibleHallList: document.getElementById("impossible-hall-list"),
  impossibleHallPanel: document.getElementById("impossible-hall-panel"),
  submitPanel: document.getElementById("submit-panel"),
  submitCopy: document.getElementById("submit-copy"),
  usernameInput: document.getElementById("username-input"),
  submitScoreBtn: document.getElementById("submit-score-btn"),
  submitStatus: document.getElementById("submit-status"),
  answerPanel: document.getElementById("answer-panel"),
  answerBoard: document.getElementById("answer-board"),
  answerTitle: document.getElementById("answer-title"),
  answerCaption: document.getElementById("answer-caption"),
  touchTip: document.getElementById("touch-tip"),
  creditsCopy: document.getElementById("credits-copy"),
  projectNameTop: document.getElementById("project-name-top"),
  projectNameBottom: document.getElementById("project-name-bottom"),
  versionCopy: document.getElementById("version-copy"),
  githubCopy: document.getElementById("github-copy")
};

function applyStaticCopy() {
  document.title = "静态扫雷 Ver0.4.3";
  const eyebrow = document.querySelector(".eyebrow");
  if (eyebrow) eyebrow.textContent = "Version 0.4.3 - HTML + JS";

  const guideData = [
    ["玩法", "数字表示周围 8 格里的雷数，整张图从开局就会全部显示。"],
    ["电脑", "左键确认安全，右键插旗；对着旗子再右键一次，就能取消。"],
    ["手机", "轻点确认安全；长按未判格插旗；从旗子上重新长按，可稳定撤旗。"],
    ["踩雷时", "可撤回一次。认输后只展示踩错点附近最多 5×5 的局部答案。"]
  ];
  document.querySelectorAll(".quick-guide .guide-card").forEach((card, index) => {
    const chip = card.querySelector(".key-chip");
    const copy = card.querySelector(".guide-copy");
    if (!chip || !copy || !guideData[index]) return;
    chip.textContent = guideData[index][0];
    copy.textContent = guideData[index][1];
  });

  const toolbarLabels = document.querySelectorAll(".toolbar .field .label");
  if (toolbarLabels[0]) toolbarLabels[0].textContent = "难度";
  if (toolbarLabels[1]) toolbarLabels[1].textContent = "图号 / 谱名";

  const statLabels = ["局面", "用时", "已确认安全", "已插旗"];
  document.querySelectorAll(".status-strip .label").forEach((node, index) => {
    if (statLabels[index]) node.textContent = statLabels[index];
  });

  const sideCards = document.querySelectorAll(".side-panel > .card");
  if (sideCards[0]) {
    const labels = sideCards[0].querySelectorAll(".label");
    if (labels[0]) labels[0].textContent = "当前难度";
    const miniLabels = sideCards[0].querySelectorAll(".mini-block .label");
    const miniCopy = ["隐藏雷数", "图号 / 题名", "通关人次", "最快用时"];
    miniLabels.forEach((node, index) => {
      if (miniCopy[index]) node.textContent = miniCopy[index];
    });
  }

  if (sideCards[1]) {
    const heading = sideCards[1].querySelector("h2");
    if (heading) heading.textContent = "本图前三";
  }

  const legendData = [
    ["关于", "这是一份把全部数字开局展示的静态扫雷。你要根据数字关系确认安全格、标出雷，并在唯一解里尽量少走弯路。"],
    ["版本速递", "0.4.3 把挑战绝谱、在线榜单、同题跳转和移动端长按撤旗整合到一页里，同时继续压缩状态噪音，让读盘更清楚。"],
    ["常见问题", "触屏端请尽量稳住手指再长按；GitHub 页面更新后若还是旧版，按 Ctrl+F5 强刷一次；如果还有异常，右下角邮箱可以直接联系我。"]
  ];
  document.querySelectorAll(".legend-card").forEach((card, index) => {
    const title = card.querySelector("h3");
    const copy = card.querySelector("p");
    if (!title || !copy || !legendData[index]) return;
    title.textContent = legendData[index][0];
    copy.textContent = legendData[index][1];
  });

  if (refs.touchTip) refs.touchTip.textContent = "";
  refs.usernameInput.placeholder = "输入一个名字";
  refs.creditsCopy.textContent = "Developed by Cyh29hao. 这是持续打磨中的开源静态逻辑题项目，欢迎试玩、反馈与在注明来源的前提下理性分享。";
  refs.githubCopy.textContent = "GitHub";
  refs.currentRankTitle.textContent = "本图前三";
  if (refs.gloryTitle) refs.gloryTitle.textContent = "妙手录";
  if (refs.impossibleHallTitle) refs.impossibleHallTitle.textContent = "绝谱榜";
  refs.projectNameTop.textContent = PROJECT_NAME;
  refs.projectNameBottom.textContent = PROJECT_NAME;
  refs.versionCopy.textContent = `${VERSION_LABEL} · ${RELEASE_LABEL}`;
}

function indexOf(row, col) {
  return row * SIZE + col;
}

function coordsOf(index) {
  return [Math.floor(index / SIZE), index % SIZE];
}

function neighborsOf(index) {
  const [row, col] = coordsOf(index);
  const list = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow >= 0 && nextRow < SIZE && nextCol >= 0 && nextCol < SIZE) {
        list.push(indexOf(nextRow, nextCol));
      }
    }
  }
  return list;
}

function bitstringToArray(bitstring) {
  return bitstring.split("").map((digit) => Number(digit));
}

function transformCoords(row, col, variantIndex) {
  switch (variantIndex) {
    case 0: return [row, col];
    case 1: return [SIZE - 1 - col, row];
    case 2: return [SIZE - 1 - row, SIZE - 1 - col];
    case 3: return [col, SIZE - 1 - row];
    case 4: return [row, SIZE - 1 - col];
    case 5: return [SIZE - 1 - row, col];
    case 6: return [col, row];
    case 7: return [SIZE - 1 - col, SIZE - 1 - row];
    default: return [row, col];
  }
}

function buildVariant(baseBoard, variantIndex) {
  const result = new Array(CELL_COUNT).fill(0);
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const sourceIndex = indexOf(row, col);
      const [targetRow, targetCol] = transformCoords(row, col, variantIndex);
      result[indexOf(targetRow, targetCol)] = baseBoard[sourceIndex];
    }
  }
  return result;
}

function buildVariantPool(levelKey) {
  const level = LEVELS[levelKey];
  if (Array.isArray(level.puzzles)) {
    return level.puzzles.map((puzzle, index) => ({
      board: bitstringToArray(puzzle.board),
      variantIndex: index,
      optionLabel: `${puzzle.code} \u00b7 \u300a${puzzle.title}\u300b`,
      shortLabel: puzzle.code,
      displayName: `\u300a${puzzle.title}\u300b`,
      detail: puzzle.note,
      rankName: `${level.name}\u300a${puzzle.title}\u300b`,
      key: `${levelKey}-${puzzle.key}`
    }));
  }

  const base = bitstringToArray(level.board);
  const variants = [];
  const seen = new Set();
  for (let variantIndex = 0; variantIndex < 8; variantIndex += 1) {
    const board = buildVariant(base, variantIndex);
    const signature = board.join("");
    if (!seen.has(signature)) {
      seen.add(signature);
      const label = VARIANT_LABELS[variantIndex] || String(variantIndex + 1);
      variants.push({
        board,
        variantIndex,
        optionLabel: `\u56fe ${label}`,
        shortLabel: label,
        displayName: `\u56fe ${label}`,
        detail: level.note,
        rankName: `${level.name} \u56fe ${label}`,
        key: `${levelKey}-${signature}`
      });
    }
  }
  return variants;
}

function selectVariant(levelKey, reshuffleOnly = false, preferredVariantIndex = null) {
  const variants = buildVariantPool(levelKey);
  const previousKey = state.currentPuzzle?.key || `${levelKey}-${state.board.join("")}`;
  if (preferredVariantIndex != null) {
    const exact = variants.find((variant) => variant.variantIndex === preferredVariantIndex);
    return { variants, selected: exact || variants[0] };
  }
  const candidates = reshuffleOnly
    ? variants.filter((variant) => variant.key !== previousKey)
    : variants;
  const pool = candidates.length > 0 ? candidates : variants;
  return { variants, selected: pool[Math.floor(Math.random() * pool.length)] };
}


function buildPuzzleRegistry() {
  const registry = new Map();
  Object.keys(LEVELS).forEach((levelKey) => {
    buildVariantPool(levelKey).forEach((variant) => {
      registry.set(variant.key, { ...variant, levelKey });
    });
  });
  return registry;
}

const PUZZLE_REGISTRY = buildPuzzleRegistry();
const IMPOSSIBLE_PUZZLE_KEYS = buildVariantPool("impossible").map((variant) => variant.key);

function computeClues(board) {
  return board.map((_, index) => neighborsOf(index).reduce((total, neighborIndex) => total + board[neighborIndex], 0));
}

function countSafeMarked() {
  return state.marks.reduce((total, mark, index) => total + (mark === "safe" && state.board[index] === 0 ? 1 : 0), 0);
}

function countFlags() {
  return state.marks.reduce((total, mark) => total + (mark === "flagged" ? 1 : 0), 0);
}

function countWrongFlags() {
  return state.marks.reduce((total, mark, index) => total + (mark === "flagged" && state.board[index] === 0 ? 1 : 0), 0);
}

function allMinesFlaggedCorrectly() {
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (state.board[index] === 1 && state.marks[index] !== "flagged") return false;
    if (state.board[index] === 0 && state.marks[index] === "flagged") return false;
  }
  return true;
}

function formatElapsed(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalTenths = Math.floor(safeMs / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(totalMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function formatPlayedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function getElapsedMs() {
  if (state.finalElapsedMs > 0) return state.finalElapsedMs;
  if (!state.timerStartedAt) return 0;
  return Date.now() - state.timerStartedAt;
}

function syncTimerText() {
  refs.timerText.textContent = formatElapsed(getElapsedMs());
}

function resetTimer() {
  window.clearInterval(state.timerIntervalId);
  state.timerIntervalId = 0;
  state.timerStartedAt = 0;
  state.finalElapsedMs = 0;
  syncTimerText();
}

function ensureTimerStarted() {
  if (state.timerStartedAt || state.finalElapsedMs > 0 || state.result !== "playing") return;
  state.timerStartedAt = Date.now();
  syncTimerText();
  state.timerIntervalId = window.setInterval(() => {
    syncTimerText();
    if (state.result === "pending_loss") {
      renderStatus();
    }
  }, 100);
}

function freezeTimer() {
  if (state.finalElapsedMs > 0) return;
  state.finalElapsedMs = getElapsedMs();
  window.clearInterval(state.timerIntervalId);
  state.timerIntervalId = 0;
  state.timerStartedAt = 0;
  syncTimerText();
}

function getPuzzleSignature() {
  return state.currentPuzzle?.key || `${state.levelKey}-${state.board.join("")}`;
}

function hasOnlineRanking() {
  return Boolean(SCORE_CONFIG.supabaseUrl && SCORE_CONFIG.anonKey && SCORE_CONFIG.table);
}

function readLocalScores() {
  try {
    const raw = window.localStorage.getItem(LOCAL_SCORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeLocalScores(entries) {
  window.localStorage.setItem(LOCAL_SCORE_KEY, JSON.stringify(entries));
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    if (left.elapsed_ms !== right.elapsed_ms) {
      return left.elapsed_ms - right.elapsed_ms;
    }
    return new Date(left.played_at).getTime() - new Date(right.played_at).getTime();
  });
}

function sortByPlayedAt(entries, newestFirst = false) {
  const ordered = [...entries].sort((left, right) => new Date(left.played_at).getTime() - new Date(right.played_at).getTime());
  return newestFirst ? ordered.reverse() : ordered;
}

function normalizeScoreEntries(entries) {
  return (entries || []).filter((entry) => entry && entry.puzzle_key && entry.username && entry.played_at).map((entry) => ({
    puzzle_key: String(entry.puzzle_key),
    puzzle_name: entry.puzzle_name || "",
    username: String(entry.username).slice(0, 32),
    elapsed_ms: Number(entry.elapsed_ms),
    played_at: entry.played_at
  })).filter((entry) => Number.isFinite(entry.elapsed_ms) && entry.elapsed_ms >= 0);
}

function summarizeEntries(entries, mode, note = "") {
  const ordered = sortEntries(entries);
  return {
    mode,
    loading: false,
    count: ordered.length,
    fastestMs: ordered.length > 0 ? ordered[0].elapsed_ms : null,
    top: ordered.slice(0, 3),
    note: note || (mode === "online" ? "\u901a\u5173\u540e\u53ef\u7559\u4e0b\u540d\u5b57\u3002" : "\u73b0\u5728\u663e\u793a\u7684\u662f\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u6210\u7ee9\u3002"),
    submitMessage: state.leaderboard.submitMessage,
    submitted: state.leaderboard.submitted,
    submitting: false
  };
}

function buildCurrentSummary(allEntries, mode, note = "") {
  const currentEntries = allEntries.filter((entry) => entry.puzzle_key === getPuzzleSignature());
  return summarizeEntries(currentEntries, mode, note);
}

function getPuzzleMeta(puzzleKey) {
  return PUZZLE_REGISTRY.get(puzzleKey) || null;
}

function getPuzzleDisplay(entry, shortOnly = false) {
  const meta = getPuzzleMeta(entry.puzzle_key);
  if (meta) {
    if (shortOnly && meta.levelKey === "impossible") return meta.displayName;
    return meta.rankName;
  }
  return entry.puzzle_name || entry.puzzle_key;
}

function computeRecentCrowns(entries) {
  const bestByPuzzle = new Map();
  const events = [];
  for (const entry of sortByPlayedAt(entries)) {
    const best = bestByPuzzle.get(entry.puzzle_key);
    if (!best || entry.elapsed_ms < best.elapsed_ms) {
      bestByPuzzle.set(entry.puzzle_key, entry);
      events.push({ ...entry, displayTitle: getPuzzleDisplay(entry, false) });
    }
  }
  return sortByPlayedAt(events, true).slice(0, 5);
}

function computeImpossibleLeaders(entries) {
  return IMPOSSIBLE_PUZZLE_KEYS.map((puzzleKey) => {
    const meta = getPuzzleMeta(puzzleKey);
    const ordered = sortEntries(entries.filter((entry) => entry.puzzle_key === puzzleKey));
    if (ordered.length > 0) {
      return {
        ...ordered[0],
        displayTitle: meta?.displayName || ordered[0].puzzle_name || puzzleKey,
        empty: false
      };
    }
    return {
      puzzle_key: puzzleKey,
      puzzle_name: meta?.rankName || puzzleKey,
      username: "\u865a\u4f4d\u4ee5\u5f85",
      elapsed_ms: null,
      played_at: "",
      displayTitle: meta?.displayName || puzzleKey,
      empty: true
    };
  });
}

function buildHonorState(entries, mode, note = "") {
  return {
    mode,
    loading: false,
    recentFirsts: computeRecentCrowns(entries),
    impossibleLeaders: computeImpossibleLeaders(entries),
    note: note || (mode === "online" ? "\u70b9\u51fb\u9898\u540d\u53ef\u76f4\u63a5\u8df3\u5230\u5bf9\u5e94\u9898\u3002" : "\u5f53\u524d\u663e\u793a\u7684\u662f\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u8363\u8000\u8bb0\u5f55\u3002")
  };
}

async function fetchRemoteEntries() {
  const baseUrl = `${SCORE_CONFIG.supabaseUrl.replace(/\/$/, "")}/rest/v1/${SCORE_CONFIG.table}`;
  const headers = {
    apikey: SCORE_CONFIG.anonKey,
    Authorization: `Bearer ${SCORE_CONFIG.anonKey}`
  };
  const url = new URL(baseUrl);
  url.searchParams.set("select", "puzzle_key,puzzle_name,username,elapsed_ms,played_at");
  url.searchParams.set("order", "played_at.asc");
  url.searchParams.set("limit", "5000");
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error("remote leaderboard unavailable");
  }
  return normalizeScoreEntries(await response.json());
}

async function loadLeaderboard() {
  state.leaderboard.loading = true;
  state.leaderboard.note = hasOnlineRanking() ? "\u6b63\u5728\u8bfb\u53d6\u5728\u7ebf\u6392\u884c..." : "\u73b0\u5728\u663e\u793a\u7684\u662f\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u6210\u7ee9\u3002";
  state.honors.loading = true;
  state.honors.note = hasOnlineRanking() ? "\u6b63\u5728\u6574\u7406\u5168\u7ad9\u8363\u8000\u8bb0\u5f55..." : "\u6b63\u5728\u6574\u7406\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u8363\u8000\u8bb0\u5f55...";
  renderLeaderboard();
  renderHonorBoards();
  try {
    let entries;
    let mode;
    let currentNote;
    let honorNote;
    if (hasOnlineRanking()) {
      entries = await fetchRemoteEntries();
      mode = "online";
      currentNote = "\u901a\u5173\u540e\u53ef\u7559\u4e0b\u540d\u5b57\u3002";
      honorNote = "\u70b9\u51fb\u9898\u540d\u53ef\u76f4\u63a5\u8df3\u5230\u5bf9\u5e94\u9898\u3002";
    } else {
      entries = normalizeScoreEntries(readLocalScores());
      mode = "local";
      currentNote = "\u73b0\u5728\u663e\u793a\u7684\u662f\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u6210\u7ee9\u3002";
      honorNote = "\u5f53\u524d\u663e\u793a\u7684\u662f\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u8363\u8000\u8bb0\u5f55\u3002";
    }
    state.leaderboard = { ...state.leaderboard, ...buildCurrentSummary(entries, mode, currentNote) };
    state.honors = buildHonorState(entries, mode, honorNote);
  } catch (error) {
    const entries = normalizeScoreEntries(readLocalScores());
    state.leaderboard = {
      ...state.leaderboard,
      ...buildCurrentSummary(entries, "local", "\u5728\u7ebf\u6392\u884c\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5148\u663e\u793a\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u6210\u7ee9\u3002")
    };
    state.honors = buildHonorState(entries, "local", "\u5728\u7ebf\u8363\u8000\u699c\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5148\u663e\u793a\u8fd9\u53f0\u8bbe\u5907\u4e0a\u7684\u8bb0\u5f55\u3002");
  }
  renderLeaderboard();
  renderHonorBoards();
  renderStatus();
}

async function submitScore() {
  if (state.result !== "won" || state.leaderboard.submitted || state.leaderboard.submitting) return;
  const username = refs.usernameInput.value.trim().slice(0, 16);
  if (!username) {
    state.leaderboard.submitMessage = "先留一个名字，再提交成绩。";
    renderLeaderboard();
    return;
  }
  const entry = {
    puzzle_key: getPuzzleSignature(),
    puzzle_name: state.currentPuzzle?.rankName || `${LEVELS[state.levelKey].name} ${VARIANT_LABELS[state.variantIndex] || "A"}`,
    username,
    elapsed_ms: getElapsedMs(),
    played_at: new Date().toISOString()
  };
  state.leaderboard.submitting = true;
  state.leaderboard.submitMessage = hasOnlineRanking() ? "正在提交成绩..." : "正在保存到这台设备...";
  renderLeaderboard();
  try {
    if (hasOnlineRanking()) {
      const baseUrl = `${SCORE_CONFIG.supabaseUrl.replace(/\/$/, "")}/rest/v1/${SCORE_CONFIG.table}`;
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SCORE_CONFIG.anonKey,
          Authorization: `Bearer ${SCORE_CONFIG.anonKey}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(entry)
      });
      if (!response.ok) {
        throw new Error("submit failed");
      }
    } else {
      const entries = readLocalScores();
      entries.push(entry);
      writeLocalScores(entries);
    }
    state.leaderboard.submitted = true;
    state.leaderboard.submitMessage = hasOnlineRanking() ? "成绩已提交到在线排行。" : "成绩已保存在这台设备上。";
    await loadLeaderboard();
  } catch (error) {
    state.leaderboard.submitting = false;
    state.leaderboard.submitMessage = hasOnlineRanking() ? "提交失败了，稍后再试一次。" : "保存失败了，请再试一次。";
    renderLeaderboard();
  }
}

function clearFlash() {
  window.clearTimeout(flashTimeoutId);
  state.flashIndex = -1;
  state.flashType = "";
  state.flashToken = 0;
}

function triggerCellFlash(index, type, duration = 260) {
  clearFlash();
  const token = Date.now();
  state.flashIndex = index;
  state.flashType = type;
  state.flashToken = token;
  flashTimeoutId = window.setTimeout(() => {
    if (state.flashToken === token) {
      state.flashIndex = -1;
      state.flashType = "";
      renderBoard();
    }
  }, duration);
}

function triggerBoardBlast() {
  window.clearTimeout(boardBlastTimeoutId);
  const token = Date.now();
  state.boardBlast = true;
  state.boardBlastToken = token;
  boardBlastTimeoutId = window.setTimeout(() => {
    if (state.boardBlastToken === token) {
      state.boardBlast = false;
      renderBoard();
    }
  }, 480);
}

function clearTouchArming() {
  if (state.touch.armedButton) {
    state.touch.armedButton.classList.remove("touch-arming");
    state.touch.armedButton = null;
  }
}

function resetTouchState() {
  window.clearTimeout(state.touch.timerId);
  state.touch.timerId = 0;
  state.touch.index = -1;
  state.touch.mode = "none";
  state.touch.startMark = "unknown";
  state.touch.longTriggered = false;
  state.touch.moved = false;
  clearTouchArming();
}

function clearTransientState() {
  clearFlash();
  window.clearTimeout(boardBlastTimeoutId);
  state.boardBlast = false;
  state.boardBlastToken = 0;
  resetTouchState();
  state.touch.suppressClick = false;
  state.touch.suppressUntil = 0;
  state.pendingMineIndex = -1;
  state.explodedIndex = -1;
  state.leaderboard.submitMessage = "";
  state.leaderboard.submitted = false;
  state.leaderboard.submitting = false;
  refs.usernameInput.value = "";
  resetTimer();
}

function syncPuzzlePicker() {
  refs.puzzleSelect.innerHTML = state.variantPool.map((variant) => {
    return `<option value="${variant.variantIndex}">${variant.optionLabel}</option>`;
  }).join("");
  refs.puzzleSelect.value = String(state.variantIndex);
}

function startGame(levelKey, reshuffleOnly = false, preferredVariantIndex = null) {
  clearTransientState();
  state.levelKey = levelKey;
  const { variants, selected } = selectVariant(levelKey, reshuffleOnly, preferredVariantIndex);
  state.variantPool = variants;
  state.currentPuzzle = selected;
  state.board = selected.board;
  state.clues = computeClues(selected.board);
  state.marks = new Array(CELL_COUNT).fill("unknown");
  state.mineCount = state.board.reduce((total, cell) => total + cell, 0);
  state.safeTotal = CELL_COUNT - state.mineCount;
  state.variantIndex = selected.variantIndex;
  state.result = "playing";
  state.undoUsed = false;
  syncPuzzlePicker();
  renderAll();
  loadLeaderboard();
}

function checkWin() {
  if (state.result !== "playing") return;
  if (countSafeMarked() === state.safeTotal && allMinesFlaggedCorrectly()) {
    state.result = "won";
    freezeTimer();
  }
}

function setPendingLoss(index) {
  state.result = "pending_loss";
  state.pendingMineIndex = index;
  state.explodedIndex = index;
  triggerCellFlash(index, "mine", 420);
  triggerBoardBlast();
  if (navigator.vibrate) {
    navigator.vibrate([18, 30, 36]);
  }
}

function confirmSafe(index) {
  if (state.result !== "playing") return;
  if (state.marks[index] === "flagged" || state.marks[index] === "safe") return;
  ensureTimerStarted();
  if (state.board[index] === 1) {
    setPendingLoss(index);
    renderAll();
    return;
  }
  state.marks[index] = "safe";
  checkWin();
  triggerCellFlash(index, "safe", 230);
  renderAll();
}

function setFlagState(index, shouldFlag) {
  if (state.result !== "playing") return;
  if (state.marks[index] === "safe") return;
  const nextMark = shouldFlag ? "flagged" : "unknown";
  if (state.marks[index] === nextMark) return;
  ensureTimerStarted();
  state.marks[index] = nextMark;
  checkWin();
  triggerCellFlash(index, "flag", 230);
  renderAll();
}

function toggleFlag(index) {
  setFlagState(index, state.marks[index] !== "flagged");
}

function undoPendingLoss() {
  if (state.result !== "pending_loss" || state.undoUsed) return;
  const index = state.pendingMineIndex;
  state.undoUsed = true;
  state.result = "playing";
  state.pendingMineIndex = -1;
  state.explodedIndex = -1;
  triggerCellFlash(index, "undo", 260);
  renderAll();
}

function giveUpAndReveal() {
  if (state.result !== "pending_loss") return;
  state.result = "lost";
  freezeTimer();
  renderAll();
}

function getRevealWindow(index) {
  const [row, col] = coordsOf(index);
  return {
    minRow: Math.max(0, row - 2),
    maxRow: Math.min(SIZE - 1, row + 2),
    minCol: Math.max(0, col - 2),
    maxCol: Math.min(SIZE - 1, col + 2)
  };
}

function isInRevealWindow(index, windowBox) {
  const [row, col] = coordsOf(index);
  return row >= windowBox.minRow && row <= windowBox.maxRow && col >= windowBox.minCol && col <= windowBox.maxCol;
}

function revealAnswerIfNeeded() {
  const shouldShow = state.result === "won" || state.result === "lost";
  refs.answerPanel.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) {
    refs.answerBoard.innerHTML = "";
    refs.answerCaption.textContent = "";
    refs.answerTitle.textContent = "本局答案";
    return;
  }

  const elapsedLabel = formatElapsed(getElapsedMs());
  if (state.result === "won") {
    refs.answerTitle.textContent = "你已通关";
    refs.answerCaption.textContent = `用时 ${elapsedLabel}。本局所有安全格都已确认，所有雷都已正确标记。答案区保留给你复盘整张图。`;
    refs.answerBoard.innerHTML = state.board.map((cell, index) => {
      const wrongFlag = state.marks[index] === "flagged" && cell === 0;
      const classes = ["answer-cell"];
      if (cell === 1) classes.push("mine");
      if (wrongFlag) classes.push("wrong-flag");
      const content = cell === 1 ? "✹" : state.clues[index];
      return `<div class="${classes.join(" ")}"><span class="number num-${state.clues[index]}">${content}</span></div>`;
    }).join("");
    return;
  }

  const windowBox = getRevealWindow(state.explodedIndex);
  refs.answerTitle.textContent = "局部答案";
  refs.answerCaption.textContent = `本局在 ${elapsedLabel} 后结束。为减少对排行榜的影响，只展示踩错点周围最多 5×5 的局部答案。`;
  refs.answerBoard.innerHTML = state.board.map((cell, index) => {
    const visible = isInRevealWindow(index, windowBox);
    const wrongFlag = visible && state.marks[index] === "flagged" && cell === 0;
    const classes = ["answer-cell"];
    let content = "·";
    let numberClass = "num-0";
    if (!visible) {
      classes.push("masked");
    } else if (cell === 1) {
      classes.push("mine");
      content = "✹";
      numberClass = "num-8";
    } else {
      if (wrongFlag) classes.push("wrong-flag");
      content = state.clues[index];
      numberClass = `num-${state.clues[index]}`;
    }
    return `<div class="${classes.join(" ")}"><span class="number ${numberClass}">${content}</span></div>`;
  }).join("");
}


function renderHonorBoards() {
  const modeLabel = state.honors.mode === "online" ? "在线荣耀" : "本机荣耀";
  const activeView = state.honors.view === "impossible" ? "impossible" : "glory";
  if (refs.gloryLabel) refs.gloryLabel.textContent = modeLabel;

  if (state.honors.loading) {
    refs.gloryList.innerHTML = '<div class="rank-empty">正在整理最近的榜首改写记录...</div>';
    refs.impossibleHallList.innerHTML = '<div class="rank-empty">正在整理五张绝谱的当前守关人...</div>';
  } else {
    if (!state.honors.recentFirsts.length) {
      refs.gloryList.innerHTML = '<div class="rank-empty">还没有新的榜首诞生，下一次破纪录的名字会出现在这里。</div>';
    } else {
      refs.gloryList.innerHTML = state.honors.recentFirsts.map((entry, index) => `
        <div class="rank-row">
          <div class="rank-badge">${index + 1}</div>
          <div>
            <button type="button" class="puzzle-link rank-name" data-puzzle-key="${entry.puzzle_key}">${entry.displayTitle}</button>
            <div class="rank-meta">${entry.username} · ${formatPlayedAt(entry.played_at)}</div>
          </div>
          <div class="rank-time">${formatElapsed(entry.elapsed_ms)}</div>
        </div>
      `).join("");
    }

    refs.impossibleHallList.innerHTML = state.honors.impossibleLeaders.map((entry, index) => {
      const meta = entry.empty ? "尚无人破局" : `${entry.username} · ${formatPlayedAt(entry.played_at)}`;
      const time = entry.elapsed_ms == null ? "--" : formatElapsed(entry.elapsed_ms);
      return `
        <div class="rank-row">
          <div class="rank-badge">${index + 1}</div>
          <div>
            <button type="button" class="puzzle-link rank-name" data-puzzle-key="${entry.puzzle_key}">${entry.displayTitle}</button>
            <div class="rank-meta">${meta}</div>
          </div>
          <div class="rank-time">${time}</div>
        </div>
      `;
    }).join("");
  }

  if (refs.gloryTitle) {
    refs.gloryTitle.textContent = "妙手录";
    refs.gloryTitle.classList.toggle("active", activeView === "glory");
    refs.gloryTitle.setAttribute("aria-selected", String(activeView === "glory"));
  }
  if (refs.impossibleHallTitle) {
    refs.impossibleHallTitle.textContent = "绝谱榜";
    refs.impossibleHallTitle.classList.toggle("active", activeView === "impossible");
    refs.impossibleHallTitle.setAttribute("aria-selected", String(activeView === "impossible"));
  }
  if (refs.gloryPanel) refs.gloryPanel.classList.toggle("hidden", activeView !== "glory");
  if (refs.impossibleHallPanel) refs.impossibleHallPanel.classList.toggle("hidden", activeView !== "impossible");
  if (refs.gloryNote) {
    refs.gloryNote.textContent = activeView === "glory"
      ? "最近五次改写榜首的时刻。点击题名可直接跳到对应题。"
      : "五张挑战绝谱当前的守关人。点击谱名可直接切到对应题。";
  }
}

function renderLeaderboard() {
  refs.rankMode.textContent = state.leaderboard.mode === "online" ? "在线排行" : "本机排行";
  refs.clearCountText.textContent = state.leaderboard.loading ? "..." : String(state.leaderboard.count);
  refs.fastestText.textContent = state.leaderboard.loading
    ? "..."
    : state.leaderboard.fastestMs == null
      ? "--"
      : formatElapsed(state.leaderboard.fastestMs);

  if (state.leaderboard.loading) {
    refs.leaderboardList.innerHTML = '<div class="rank-empty">正在读取这张图的成绩...</div>';
  } else if (!state.leaderboard.top.length) {
    refs.leaderboardList.innerHTML = '<div class="rank-empty">还没有人通关这张图，来试着拿下第一个名字吧。</div>';
  } else {
    refs.leaderboardList.innerHTML = state.leaderboard.top.map((entry, index) => `
      <div class="rank-row">
        <div class="rank-badge">${index + 1}</div>
        <div>
          <div class="rank-name">${entry.username}</div>
          <div class="rank-meta">${formatPlayedAt(entry.played_at)}</div>
        </div>
        <div class="rank-time">${formatElapsed(entry.elapsed_ms)}</div>
      </div>
    `).join("");
  }

  refs.leaderboardNote.textContent = state.leaderboard.note;
  refs.submitPanel.classList.toggle("hidden", state.result !== "won");
  refs.submitCopy.textContent = state.result === "won" ? `本局用时 ${formatElapsed(getElapsedMs())}。想留个名字吗？` : "";
  refs.submitStatus.textContent = state.leaderboard.submitMessage;
  refs.usernameInput.disabled = state.leaderboard.submitting || state.leaderboard.submitted;
  refs.submitScoreBtn.disabled = state.leaderboard.submitting || state.leaderboard.submitted;
  if (state.leaderboard.submitted) {
    refs.submitScoreBtn.textContent = "已提交";
  } else if (state.leaderboard.submitting) {
    refs.submitScoreBtn.textContent = "提交中";
  } else {
    refs.submitScoreBtn.textContent = "提交成绩";
  }
}

function renderStatus() {
  const level = LEVELS[state.levelKey];
  const safeMarked = countSafeMarked();
  const flags = countFlags();
  refs.safeProgress.textContent = `${safeMarked} / ${state.safeTotal}`;
  refs.flagProgress.textContent = `${flags} / ${state.mineCount}`;
  refs.difficultyName.textContent = level.name;
  refs.difficultyCopy.textContent = state.currentPuzzle?.displayName ? `${level.summary} \u5f53\u524d\u9898\uff1a${state.currentPuzzle.displayName}\u3002` : level.summary;
  refs.difficultyNote.textContent = state.currentPuzzle?.detail || level.note;
  refs.mineCountText.textContent = String(state.mineCount);
  refs.variantText.textContent = state.currentPuzzle?.shortLabel || VARIANT_LABELS[state.variantIndex] || "A";
  refs.touchTip.textContent = "电脑：左键确认安全，右键插旗。手机：轻点确认安全；长按未判格插旗；从旗子上重新长按可撤旗。";

  if (state.result === "playing") {
    refs.statusText.textContent = "解题中";
  } else if (state.result === "pending_loss") {
    refs.statusText.textContent = "踩到雷了";
  } else if (state.result === "won") {
    refs.statusText.textContent = "已通关";
  } else {
    refs.statusText.textContent = "已认输";
  }

  refs.undoNote.textContent = state.result === "pending_loss"
    ? `${state.undoUsed ? "这局没有撤回机会了。" : "可撤回这一步 1 次。"} 当前用时 ${formatElapsed(getElapsedMs())}。`
    : (state.undoUsed ? "这局已经用掉撤回机会。" : "踩雷后可撤回 1 次。");
  refs.undoBtn.disabled = state.undoUsed;
  refs.lossPanel.classList.toggle("show", state.result === "pending_loss");
  syncTimerText();
}

function renderBoard() {
  refs.boardWrap.classList.toggle("board-blast", state.boardBlast);
  refs.board.innerHTML = state.board.map((cell, index) => {
    const mark = state.marks[index];
    const classes = ["cell", mark];
    if (state.result === "won" || state.result === "lost") {
      classes.push("locked");
    }
    if (state.result === "pending_loss" && index === state.pendingMineIndex) {
      classes.push("pending-mine", "effect-mine");
    }
    if (state.result === "lost" && index === state.explodedIndex) {
      classes.push("mine-hit", "effect-mine");
    }
    if (state.flashIndex === index && state.flashType === "safe") classes.push("effect-safe");
    if (state.flashIndex === index && state.flashType === "flag") classes.push("effect-flag");
    if (state.flashIndex === index && state.flashType === "undo") classes.push("effect-undo");

    const isSafe = mark === "safe";
    const isFlagged = mark === "flagged";
    const cornerClass = isSafe ? "state-corner safe-corner" : isFlagged ? "state-corner flag-corner" : "state-corner hidden";
    const cornerContent = isSafe ? '<span class="safe-dot"></span>' : isFlagged ? '<span class="flag-shape"></span>' : "";
    const ariaState = isSafe ? "已确认安全" : isFlagged ? "已插旗" : "待判断";

    return `
      <button type="button" class="${classes.join(" ")}" data-index="${index}" aria-label="第 ${index + 1} 格，数字 ${state.clues[index]}，${ariaState}">
        <span class="fx-layer"></span>
        <span class="number num-${state.clues[index]}">${state.clues[index]}</span>
        <span class="${cornerClass}">${cornerContent}</span>
      </button>
    `;
  }).join("");
}

function renderAll() {
  renderStatus();
  renderBoard();
  renderLeaderboard();
  renderHonorBoards();
  revealAnswerIfNeeded();
}

function handleBoardClick(index) {
  confirmSafe(index);
}


function jumpToPuzzle(puzzleKey) {
  const meta = getPuzzleMeta(puzzleKey);
  if (!meta) return;
  startGame(meta.levelKey, false, meta.variantIndex);
  window.requestAnimationFrame(() => {
    const top = refs.boardWrap.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top, behavior: "smooth" });
  });
}


refs.board.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (state.touch.suppressClick || Date.now() < state.touch.suppressUntil) {
    state.touch.suppressClick = false;
    return;
  }
  if (state.result !== "playing") return;
  if (state.marks[index] === "flagged") return;
  handleBoardClick(index);
});

refs.board.addEventListener("contextmenu", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  event.preventDefault();
  const index = Number(button.dataset.index);
  if (state.result !== "playing") return;
  toggleFlag(index);
});

refs.board.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) return;
  const button = event.target.closest("[data-index]");
  if (!button) return;
  const touch = event.touches[0];
  const index = Number(button.dataset.index);
  resetTouchState();
  state.touch.index = index;
  state.touch.startMark = state.marks[index];
  state.touch.mode = state.marks[index] === "unknown"
    ? "flag"
    : state.marks[index] === "flagged"
      ? "unflag"
      : "ignore";
  state.touch.startX = touch.clientX;
  state.touch.startY = touch.clientY;
  state.touch.moved = false;
  if (state.touch.mode !== "ignore") {
    state.touch.armedButton = button;
    button.classList.add("touch-arming");
    state.touch.timerId = window.setTimeout(() => {
      state.touch.longTriggered = true;
      state.touch.suppressClick = true;
      state.touch.suppressUntil = Date.now() + 650;
      if (state.result === "playing") {
        if (state.touch.mode === "flag") {
          setFlagState(index, true);
        } else if (state.touch.mode === "unflag") {
          setFlagState(index, false);
        }
        if (navigator.vibrate) navigator.vibrate(14);
      }
      clearTouchArming();
    }, 500);
  }
}, { passive: true });

refs.board.addEventListener("touchmove", (event) => {
  if (state.touch.index < 0 || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const dx = touch.clientX - state.touch.startX;
  const dy = touch.clientY - state.touch.startY;
  if ((dx * dx) + (dy * dy) > 324) {
    state.touch.moved = true;
    window.clearTimeout(state.touch.timerId);
    state.touch.timerId = 0;
    clearTouchArming();
  }
}, { passive: true });

refs.board.addEventListener("touchend", (event) => {
  const button = event.target.closest("[data-index]");
  const index = button ? Number(button.dataset.index) : state.touch.index;
  const longTriggered = state.touch.longTriggered;
  const moved = state.touch.moved;
  const startMark = state.touch.startMark;
  window.clearTimeout(state.touch.timerId);
  state.touch.timerId = 0;
  clearTouchArming();
  state.touch.index = -1;
  state.touch.longTriggered = false;
  state.touch.moved = false;
  state.touch.mode = "none";

  if (moved || longTriggered) {
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 500;
    return;
  }

  if (state.result === "playing" && startMark === "unknown" && Number.isInteger(index)) {
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 320;
    handleBoardClick(index);
    window.setTimeout(() => { state.touch.suppressClick = false; }, 110);
  } else {
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 220;
  }
});

refs.board.addEventListener("touchcancel", () => {
  resetTouchState();
  state.touch.suppressClick = true;
  state.touch.suppressUntil = Date.now() + 220;
});

refs.boardWrap.addEventListener("mousemove", (event) => {
  const rect = refs.boardWrap.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  refs.boardWrap.style.setProperty("--pointer-x", `${x}%`);
  refs.boardWrap.style.setProperty("--pointer-y", `${y}%`);
  refs.boardWrap.style.setProperty("--pointer-alpha", "1");
});

refs.boardWrap.addEventListener("mouseleave", () => {
  refs.boardWrap.style.setProperty("--pointer-alpha", "0");
});

document.addEventListener("click", (event) => {
  const honorTrigger = event.target.closest("[data-honor-view]");
  if (honorTrigger) {
    state.honors.view = honorTrigger.dataset.honorView === "impossible" ? "impossible" : "glory";
    renderHonorBoards();
    return;
  }

  const trigger = event.target.closest(".puzzle-link[data-puzzle-key]");
  if (!trigger) return;
  event.preventDefault();
  jumpToPuzzle(trigger.dataset.puzzleKey);
});

refs.undoBtn.addEventListener("click", () => {
  undoPendingLoss();
});

refs.giveUpBtn.addEventListener("click", () => {
  giveUpAndReveal();
});

refs.difficultySelect.addEventListener("change", (event) => {
  startGame(event.target.value);
});

refs.puzzleSelect.addEventListener("change", (event) => {
  startGame(state.levelKey, false, Number(event.target.value));
});

refs.newGameBtn.addEventListener("click", () => {
  startGame(state.levelKey, false, state.variantIndex);
});

refs.shuffleBtn.addEventListener("click", () => {
  startGame(state.levelKey, true);
});

refs.submitScoreBtn.addEventListener("click", () => {
  submitScore();
});

refs.usernameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitScore();
  }
});

function initDifficultyPicker() {
  refs.difficultySelect.innerHTML = Object.entries(LEVELS).map(([key, level]) => `<option value="${key}">${level.name}</option>`).join("");
  refs.difficultySelect.value = state.levelKey;
}

applyStaticCopy();
initDifficultyPicker();
startGame(state.levelKey);



