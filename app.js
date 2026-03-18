const SIZE = 10;
const CELL_COUNT = SIZE * SIZE;
const VARIANT_LABELS = "ABCDEFGH".split("");
const LOCAL_SCORE_KEY = "static-minesweeper-v04-scores";
const SCORE_CONFIG = {
  supabaseUrl: "",
  anonKey: "",
  table: "minesweeper_scores"
};

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
  touch: {
    timerId: 0,
    index: -1,
    longTriggered: false,
    suppressClick: false,
    startX: 0,
    startY: 0,
    moved: false,
    suppressUntil: 0
  }
};

let flashTimeoutId = 0;
let boardBlastTimeoutId = 0;

const refs = {
  difficultySelect: document.getElementById("difficulty-select"),
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
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardNote: document.getElementById("leaderboard-note"),
  submitPanel: document.getElementById("submit-panel"),
  submitCopy: document.getElementById("submit-copy"),
  usernameInput: document.getElementById("username-input"),
  submitScoreBtn: document.getElementById("submit-score-btn"),
  submitStatus: document.getElementById("submit-status"),
  answerPanel: document.getElementById("answer-panel"),
  answerBoard: document.getElementById("answer-board"),
  answerTitle: document.getElementById("answer-title"),
  answerCaption: document.getElementById("answer-caption"),
  touchTip: document.getElementById("touch-tip")
};

function applyStaticCopy() {
  document.title = "???? Ver0.4";
  const guideData = [
    ["玩法", "数字表示周围 8 格里的雷数，整张图从开局就会全部显示。"],
    ["电脑", "左键确认安全，右键插旗；对着旗子再右键一次，就能取消。"],
    ["手机", "轻点确认安全；长按插旗；松手后再长按旗子，就能取消。"],
    ["踩雷时", "会先停在危险提示里。你可以撤回这一步一次，或者直接看答案。"]
  ];
  document.querySelectorAll(".quick-guide .guide-card").forEach((card, index) => {
    const chip = card.querySelector(".key-chip");
    const copy = card.querySelector(".guide-copy");
    if (!chip || !copy || !guideData[index]) return;
    chip.textContent = guideData[index][0];
    copy.textContent = guideData[index][1];
  });

  const statLabels = ["局面", "用时", "已确认安全", "已插旗"];
  document.querySelectorAll(".status-strip .label").forEach((node, index) => {
    if (statLabels[index]) node.textContent = statLabels[index];
  });

  const sideCards = document.querySelectorAll(".side-panel > .card");
  if (sideCards[0]) {
    const labels = sideCards[0].querySelectorAll(".label");
    if (labels[0]) labels[0].textContent = "当前难度";
    const miniLabels = sideCards[0].querySelectorAll(".mini-block .label");
    const miniCopy = ["隐藏雷数", "变体编号", "通关人次", "最快用时"];
    miniLabels.forEach((node, index) => {
      if (miniCopy[index]) node.textContent = miniCopy[index];
    });
    const footer = sideCards[0].querySelector(".footer-note");
    if (footer) footer.textContent = "想提速时，先找必然安全格，再回头补旗子，通常会更稳。";
  }

  if (sideCards[1]) {
    const heading = sideCards[1].querySelector("h2");
    if (heading) heading.textContent = "本图前三";
    const note = document.getElementById("leaderboard-note");
    if (note && !note.textContent.trim()) note.textContent = "通关后可留下名字。";
  }

  refs.usernameInput.placeholder = "输入一个名字";

  const legendCards = document.querySelectorAll(".legend-card");
  if (legendCards[2]) {
    const copy = legendCards[2].querySelector("p");
    if (copy) copy.textContent = "这份可以直接打开游玩；电脑端和手机端都能直接进入棋盘。";
  }
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
  const base = bitstringToArray(LEVELS[levelKey].board);
  const variants = [];
  const seen = new Set();
  for (let variantIndex = 0; variantIndex < 8; variantIndex += 1) {
    const board = buildVariant(base, variantIndex);
    const signature = board.join("");
    if (!seen.has(signature)) {
      seen.add(signature);
      variants.push({ board, variantIndex });
    }
  }
  return variants;
}

function sampleVariant(levelKey, reshuffleOnly) {
  const variants = buildVariantPool(levelKey);
  const previousSignature = state.board.join("");
  const candidates = reshuffleOnly
    ? variants.filter((variant) => variant.board.join("") !== previousSignature)
    : variants;
  const pool = candidates.length > 0 ? candidates : variants;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  return `${state.levelKey}-${state.board.join("")}`;
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

function summarizeEntries(entries, mode, note = "") {
  const ordered = sortEntries(entries);
  return {
    mode,
    loading: false,
    count: ordered.length,
    fastestMs: ordered.length > 0 ? ordered[0].elapsed_ms : null,
    top: ordered.slice(0, 3),
    note: note || (mode === "online" ? "通关后可留下名字。" : "现在显示的是这台设备上的成绩。"),
    submitMessage: state.leaderboard.submitMessage,
    submitted: state.leaderboard.submitted,
    submitting: false
  };
}

async function fetchRemoteSummary() {
  const baseUrl = `${SCORE_CONFIG.supabaseUrl.replace(/\/$/, "")}/rest/v1/${SCORE_CONFIG.table}`;
  const headers = {
    apikey: SCORE_CONFIG.anonKey,
    Authorization: `Bearer ${SCORE_CONFIG.anonKey}`
  };
  const key = getPuzzleSignature();
  const topUrl = new URL(baseUrl);
  topUrl.searchParams.set("select", "username,elapsed_ms,played_at");
  topUrl.searchParams.set("puzzle_key", `eq.${key}`);
  topUrl.searchParams.set("order", "elapsed_ms.asc,played_at.asc");
  topUrl.searchParams.set("limit", "3");

  const countUrl = new URL(baseUrl);
  countUrl.searchParams.set("select", "id");
  countUrl.searchParams.set("puzzle_key", `eq.${key}`);
  countUrl.searchParams.set("limit", "1");

  const [topResponse, countResponse] = await Promise.all([
    fetch(topUrl, { headers }),
    fetch(countUrl, { headers: { ...headers, Prefer: "count=exact" } })
  ]);

  if (!topResponse.ok || !countResponse.ok) {
    throw new Error("remote leaderboard unavailable");
  }

  const top = await topResponse.json();
  const contentRange = countResponse.headers.get("content-range") || "0-0/0";
  const countText = contentRange.includes("/") ? contentRange.split("/").pop() : "0";
  const count = Number(countText) || 0;
  return {
    mode: "online",
    loading: false,
    count,
    fastestMs: top.length > 0 ? top[0].elapsed_ms : null,
    top,
    note: "通关后可留下名字。",
    submitMessage: state.leaderboard.submitMessage,
    submitted: state.leaderboard.submitted,
    submitting: false
  };
}

async function loadLeaderboard() {
  state.leaderboard.loading = true;
  state.leaderboard.note = hasOnlineRanking() ? "正在读取在线排行..." : "现在显示的是这台设备上的成绩。";
  renderLeaderboard();
  try {
    if (hasOnlineRanking()) {
      state.leaderboard = { ...state.leaderboard, ...(await fetchRemoteSummary()) };
    } else {
      const entries = readLocalScores().filter((entry) => entry.puzzle_key === getPuzzleSignature());
      state.leaderboard = { ...state.leaderboard, ...summarizeEntries(entries, "local") };
    }
  } catch (error) {
    const entries = readLocalScores().filter((entry) => entry.puzzle_key === getPuzzleSignature());
    state.leaderboard = {
      ...state.leaderboard,
      ...summarizeEntries(entries, "local", "在线排行暂时不可用，先显示这台设备上的成绩。")
    };
  }
  renderLeaderboard();
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
    puzzle_name: `${LEVELS[state.levelKey].name} ${VARIANT_LABELS[state.variantIndex] || "A"}`,
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

function resetTouchState() {
  window.clearTimeout(state.touch.timerId);
  state.touch.timerId = 0;
  state.touch.index = -1;
  state.touch.longTriggered = false;
  state.touch.moved = false;
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

function startGame(levelKey, reshuffleOnly = false) {
  clearTransientState();
  state.levelKey = levelKey;
  const selected = sampleVariant(levelKey, reshuffleOnly);
  state.board = selected.board;
  state.clues = computeClues(selected.board);
  state.marks = new Array(CELL_COUNT).fill("unknown");
  state.mineCount = state.board.reduce((total, cell) => total + cell, 0);
  state.safeTotal = CELL_COUNT - state.mineCount;
  state.variantIndex = selected.variantIndex;
  state.result = "playing";
  state.undoUsed = false;
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

function toggleFlag(index) {
  if (state.result !== "playing") return;
  if (state.marks[index] === "safe") return;
  ensureTimerStarted();
  const previous = state.marks[index];
  state.marks[index] = previous === "flagged" ? "unknown" : "flagged";
  checkWin();
  triggerCellFlash(index, "flag", 230);
  renderAll();
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

function handleBoardAction(index, action) {
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) return;
  if (action === "safe") {
    confirmSafe(index);
  } else {
    toggleFlag(index);
  }
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
  refs.answerTitle.textContent = state.result === "won" ? "你已通关" : "标准答案";
  refs.answerCaption.textContent = state.result === "won"
    ? `用时 ${elapsedLabel}。本局所有安全格都已确认，所有雷都已正确标记。答案区保留给你复盘整张图。`
    : `本局在 ${elapsedLabel} 后结束。红色是正确雷位，黄色表示你误插的旗子。`;
  refs.answerBoard.innerHTML = state.board.map((cell, index) => {
    const wrongFlag = state.marks[index] === "flagged" && cell === 0;
    const classes = ["answer-cell"];
    if (cell === 1) classes.push("mine");
    if (wrongFlag) classes.push("wrong-flag");
    const content = cell === 1 ? "✹" : state.clues[index];
    return `<div class="${classes.join(" ")}"><span class="number num-${state.clues[index]}">${content}</span></div>`;
  }).join("");
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
  refs.difficultyCopy.textContent = level.summary;
  refs.difficultyNote.textContent = level.note;
  refs.mineCountText.textContent = String(state.mineCount);
  refs.variantText.textContent = VARIANT_LABELS[state.variantIndex] || "A";
  refs.touchTip.textContent = "电脑：左键确认安全，右键插旗。手机：轻点确认安全，长按插旗；再长按旗子可取消。";

  if (state.result === "playing") {
    refs.statusText.textContent = countWrongFlags() > 0 ? "继续排查" : "解题中";
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
  revealAnswerIfNeeded();
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
  handleBoardAction(index, "safe");
});

refs.board.addEventListener("contextmenu", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  event.preventDefault();
  const index = Number(button.dataset.index);
  if (state.result !== "playing") return;
  handleBoardAction(index, "flag");
});

refs.board.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) return;
  const button = event.target.closest("[data-index]");
  if (!button) return;
  const touch = event.touches[0];
  const index = Number(button.dataset.index);
  resetTouchState();
  state.touch.index = index;
  state.touch.startX = touch.clientX;
  state.touch.startY = touch.clientY;
  state.touch.moved = false;
  state.touch.timerId = window.setTimeout(() => {
    state.touch.longTriggered = true;
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 500;
    if (state.result === "playing") {
      toggleFlag(index);
      if (navigator.vibrate) navigator.vibrate(14);
    }
  }, 340);
}, { passive: true });

refs.board.addEventListener("touchmove", (event) => {
  if (state.touch.index < 0 || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const dx = touch.clientX - state.touch.startX;
  const dy = touch.clientY - state.touch.startY;
  if ((dx * dx) + (dy * dy) > 196) {
    state.touch.moved = true;
    window.clearTimeout(state.touch.timerId);
    state.touch.timerId = 0;
  }
}, { passive: true });

refs.board.addEventListener("touchend", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) {
    resetTouchState();
    return;
  }
  const index = Number(button.dataset.index);
  const longTriggered = state.touch.longTriggered;
  const moved = state.touch.moved;
  window.clearTimeout(state.touch.timerId);
  state.touch.timerId = 0;
  state.touch.index = -1;
  state.touch.longTriggered = false;
  state.touch.moved = false;
  if (moved || longTriggered) {
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 500;
    return;
  }
  if (state.result === "playing") {
    state.touch.suppressClick = true;
    state.touch.suppressUntil = Date.now() + 320;
    if (state.marks[index] !== "flagged") {
      handleBoardAction(index, "safe");
    }
    window.setTimeout(() => { state.touch.suppressClick = false; }, 110);
  }
});

refs.board.addEventListener("touchcancel", () => {
  resetTouchState();
  state.touch.suppressClick = true;
  state.touch.suppressUntil = Date.now() + 220;
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

refs.newGameBtn.addEventListener("click", () => {
  startGame(state.levelKey);
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
