/**
 * 音声ファイルのパス。
 *
 * @type {Object<string, string>}
 */
const AUDIO_PATHS = {
  count: new URL("../audio/count.mp3", import.meta.url).href,
  heaven: new URL("../audio/heaven.mp3", import.meta.url).href,
  hell: new URL("../audio/hell.mp3", import.meta.url).href,
};

/**
 * 音声ファイルをデコードするAudioContext。
 *
 * @type {AudioContext|null}
 */
let audioContext = null;

/**
 * デコード済みの音声バッファ。
 *
 * @type {Map<string, AudioBuffer>}
 */
const audioBuffers = new Map();

/**
 * 音声ファイルの読み込み処理。
 *
 * @type {Promise<void>|null}
 */
let loadingPromise = null;

/**
 * ユーザー操作を起点に音声コンテキストを有効化します。
 */
export async function initializeAudio() {
  if (audioContext === null) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.error("このブラウザはAudioContextに対応していません。");
      return;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  await loadAudioBuffers();
}

/**
 * 音声ファイルを読み込み、AudioBufferへデコードします。
 *
 * @returns {Promise<void>} 読み込み処理。
 */
async function loadAudioBuffers() {
  if (loadingPromise !== null) {
    return loadingPromise;
  }

  loadingPromise = Promise.all(
    Object.entries(AUDIO_PATHS).map(async ([name, path]) => {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`音声ファイルを読み込めませんでした: ${path}`);
      }

      const audioData = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      audioBuffers.set(name, audioBuffer);
    }),
  )
    .then(() => undefined)
    .catch((error) => {
      console.error("音声ファイルの読み込みに失敗しました。", error);
      loadingPromise = null;
    });

  return loadingPromise;
}

/**
 * 指定した音声を先頭から再生します。
 *
 * @param {"count"|"heaven"|"hell"} soundName 再生する音声名。
 */
export async function playSound(soundName) {
  if (audioContext === null || audioContext.state === "closed") {
    return;
  }

  if (!audioBuffers.has(soundName)) {
    await loadAudioBuffers();
  }

  const audioBuffer = audioBuffers.get(soundName);

  if (!audioBuffer) {
    console.error(`音声バッファが利用できません: ${soundName}`);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}
