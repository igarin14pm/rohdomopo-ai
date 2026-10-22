import {initializeAudio, playSound} from "./audio.js";

/**
 * 作業フェーズと休憩フェーズの定義。
 *
 * @type {Object<string, {durationMs: number, status: string, message: string, theme: string}>}
 */
const PHASES = {
  work: {
    durationMs: 5 * 60 * 1000,
    status: "五分間の徒労 〜 人間性の剥奪",
    message: "問うな。理由を求める時間は終わった。ただキーボードを叩け。",
    theme: "working",
  },
  rest: {
    durationMs: 25 * 60 * 1000,
    status: "二十五分間の解放 〜 人間性の奪還",
    message: "見上げよ。世界は彩りに満ちている。思考の翼を広げ、どこへでも飛んでゆけ。",
    theme: "resting",
  },
};

/**
 * 明滅を開始する残り時間の上限（ミリ秒）。
 *
 * @type {number}
 */
const FINAL_MINUTE_THRESHOLD_MS = 60 * 1000;

/**
 * タイマー状態を表示する要素。
 *
 * @type {HTMLElement}
 */
const timerStatus = document.querySelector("#timer-status");

/**
 * フェーズのメッセージを表示する要素。
 *
 * @type {HTMLElement}
 */
const timerMessage = document.querySelector("#timer-message");

/**
 * 残り時間を表示する要素。
 *
 * @type {HTMLElement}
 */
const timerDisplay = document.querySelector("#timer-display");

/**
 * タイマーの開始・停止ボタン。
 *
 * @type {HTMLButtonElement}
 */
const timerButton = document.querySelector("#timer-toggle");

/**
 * タイマーボタン内のラベル要素。
 *
 * @type {HTMLElement}
 */
const timerButtonLabel = timerButton.querySelector("span:first-child");

/**
 * 現在のフェーズ。
 *
 * @type {"work"|"rest"}
 */
let currentPhase = "work";

/**
 * 一時停止前に経過していたフェーズ時間（ミリ秒）。
 *
 * @type {number}
 */
let elapsedBeforePauseMs = 0;

/**
 * 現在の計測を開始した時刻（ミリ秒）。
 *
 * @type {?number}
 */
let startedAtMs = null;

/**
 * 次回のタイマー再描画に割り当てられたフレーム識別子。
 *
 * @type {?number}
 */
let timerFrameId = null;

/**
 * タイマーの状態。
 *
 * @type {"idle"|"running"|"paused"}
 */
let timerState = "idle";

/**
 * 前回描画時の残り秒数。
 *
 * @type {?number}
 */
let previousRemainingSeconds = null;

/**
 * 残り時間をタイマー表示用のMM:SS.hh形式に変換します。
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
 * 描画頻度ではなく壁時計を使って、現在のフェーズの経過時間を返します。
 *
 * @returns {number} 経過時間（ミリ秒）。
 */
function getElapsedTimeMs() {
  if (timerState !== "running" || startedAtMs === null) {
    return elapsedBeforePauseMs;
  }

  return elapsedBeforePauseMs + Date.now() - startedAtMs;
}

/**
 * 現在のフェーズに合わせて表示文言とテーマを更新します。
 */
function renderPhase() {
  const phase = PHASES[currentPhase];

  document.body.classList.remove("is-working", "is-resting");
  document.documentElement.classList.remove("is-working", "is-resting");
  document.body.classList.add(`is-${phase.theme}`);
  document.documentElement.classList.add(`is-${phase.theme}`);
  timerStatus.textContent = phase.status;
  timerMessage.textContent = phase.message;
  timerMessage.hidden = false;
}

/**
 * フェーズに対応する音声を再生します。
 */
function playPhaseSound() {
  playSound(currentPhase === "work" ? "hell" : "heaven");
}

/**
 * 作業フェーズまたは休憩フェーズへ移行します。
 *
 * @param {"work"|"rest"} phaseName 移行先のフェーズ。
 */
function enterPhase(phaseName) {
  currentPhase = phaseName;
  elapsedBeforePauseMs = 0;
  startedAtMs = Date.now();
  timerState = "running";
  renderPhase();
  timerButtonLabel.textContent = "カウントダウンを一時停止";
  timerButton.setAttribute("aria-pressed", "true");
  previousRemainingSeconds = null;
  playPhaseSound();
  renderTimer();
}

/**
 * 残り時間を更新し、必要なら次のフェーズを開始します。
 */
function renderTimer() {
  const phase = PHASES[currentPhase];
  const elapsedMs = Math.min(getElapsedTimeMs(), phase.durationMs);
  const remainingMs = phase.durationMs - elapsedMs;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  timerDisplay.textContent = formatRemainingTime(remainingMs);
  timerDisplay.setAttribute("aria-label", `残り時間 ${formatRemainingTime(remainingMs)}`);
  timerDisplay.classList.toggle(
    "is-final-minute",
    remainingMs <= FINAL_MINUTE_THRESHOLD_MS,
  );

  if (timerState !== "running") {
    return;
  }

  if (
    previousRemainingSeconds !== null
    && remainingSeconds < previousRemainingSeconds
  ) {
    playSound("count");
  }
  previousRemainingSeconds = remainingSeconds;

  if (remainingMs <= 0) {
    enterPhase(currentPhase === "work" ? "rest" : "work");
    return;
  }

  timerFrameId = window.requestAnimationFrame(renderTimer);
}

/**
 * 現在のフェーズのタイマーを開始または再開します。
 */
async function startTimer() {
  const isInitialStart = timerState === "idle";

  await initializeAudio();
  startedAtMs = Date.now();
  timerState = "running";
  renderPhase();
  timerButtonLabel.textContent = "カウントダウンを一時停止";
  timerButton.setAttribute("aria-pressed", "true");
  if (isInitialStart) {
    playPhaseSound();
  }
  renderTimer();
}

/**
 * 現在のフェーズを一時停止し、テーマと表示を保持します。
 */
function pauseTimer() {
  elapsedBeforePauseMs = Math.min(getElapsedTimeMs(), PHASES[currentPhase].durationMs);
  startedAtMs = null;
  timerState = "paused";
  previousRemainingSeconds = null;
  timerButtonLabel.textContent = "カウントダウンを再開";
  timerButton.setAttribute("aria-pressed", "false");

  if (timerFrameId !== null) {
    window.cancelAnimationFrame(timerFrameId);
    timerFrameId = null;
  }

  renderTimer();
}

/**
 * 開始、一時停止、再開ボタンの操作を処理します。
 */
function handleTimerButtonClick() {
  if (timerState === "idle" || timerState === "paused") {
    void startTimer();
    return;
  }

  pauseTimer();
}

timerButton.addEventListener("click", handleTimerButtonClick);
