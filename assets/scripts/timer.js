const WORK_DURATION_MS = 5 * 60 * 1000;
const RENDER_INTERVAL_MS = 50;

const timerStatus = document.querySelector("#timer-status");
const timerMessage = document.querySelector("#timer-message");
const timerDisplay = document.querySelector("#timer-display");
const timerButton = document.querySelector("#timer-toggle");
const timerButtonLabel = timerButton.querySelector("span:first-child");

let elapsedBeforePauseMs = 0;
let startedAtMs = null;
let timerFrameId = null;
let timerState = "idle";

/**
 * 残り時間をタイマー表示用の MM:SS.hh 形式に変換します。
 *
 * @param {number} remainingMs 残り時間（ミリ秒）。
 * @returns {string} 形式化された残り時間。
 */
function formatRemainingTime(remainingMs) {
  const remainingCentiseconds = Math.ceil(Math.max(remainingMs, 0) / 10);
  const minutes = Math.floor(remainingCentiseconds / 6000);
  const seconds = Math.floor((remainingCentiseconds % 6000) / 100);
  const centiseconds = remainingCentiseconds % 100;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

/**
 * 描画頻度ではなく壁時計を使って、経過した作業時間を返します。
 *
 * @returns {number} 経過した作業時間（ミリ秒）。
 */
function getElapsedTimeMs() {
  if (timerState !== "running" || startedAtMs === null) {
    return elapsedBeforePauseMs;
  }

  return elapsedBeforePauseMs + Date.now() - startedAtMs;
}

/**
 * 残り時間を更新し、次の描画更新を予約します。
 */
function renderTimer() {
  const elapsedMs = Math.min(getElapsedTimeMs(), WORK_DURATION_MS);
  const remainingMs = WORK_DURATION_MS - elapsedMs;

  timerDisplay.textContent = formatRemainingTime(remainingMs);
  timerDisplay.setAttribute("aria-label", `残り時間 ${formatRemainingTime(remainingMs)}`);

  if (timerState === "running" && remainingMs > 0) {
    timerFrameId = window.setTimeout(renderTimer, RENDER_INTERVAL_MS);
    return;
  }

  if (timerState === "running") {
    timerState = "completed";
    elapsedBeforePauseMs = WORK_DURATION_MS;
    startedAtMs = null;
    timerButtonLabel.textContent = "作業時間終了";
    timerButton.disabled = true;
    timerButton.setAttribute("aria-disabled", "true");
  }
}

/**
 * ページを作業モードのメッセージと配色に切り替えます。
 */
function enterWorkMode() {
  document.body.classList.add("is-working");
  document.documentElement.classList.add("is-working");
  timerStatus.textContent = "五分間の徒労 〜 人間性の剥奪";
  timerMessage.hidden = false;
}

/**
 * 作業タイマーを開始または再開します。
 */
function startTimer() {
  enterWorkMode();
  startedAtMs = Date.now();
  timerState = "running";
  timerButtonLabel.textContent = "カウントダウンを一時停止";
  timerButton.setAttribute("aria-pressed", "true");
  renderTimer();
}

/**
 * 作業テーマを変えずにタイマーを一時停止します。
 */
function pauseTimer() {
  elapsedBeforePauseMs = Math.min(getElapsedTimeMs(), WORK_DURATION_MS);
  startedAtMs = null;
  timerState = "paused";
  timerButtonLabel.textContent = "カウントダウンを再開";
  timerButton.setAttribute("aria-pressed", "false");

  if (timerFrameId !== null) {
    window.clearTimeout(timerFrameId);
    timerFrameId = null;
  }

  renderTimer();
}

/**
 * 開始、停止、再開ボタンの操作を処理します。
 */
function handleTimerButtonClick() {
  if (timerState === "idle" || timerState === "paused") {
    startTimer();
    return;
  }

  if (timerState === "running") {
    pauseTimer();
  }
}

timerButton.addEventListener("click", handleTimerButtonClick);
