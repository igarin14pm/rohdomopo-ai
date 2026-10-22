/**
 * 音声注意喚起ダイアログ。
 *
 * @type {HTMLDialogElement}
 */
const audioWarningDialog = document.querySelector("#audio-warning-dialog");

/**
 * ページ読み込み時に音声注意喚起ダイアログを表示します。
 */
function showAudioWarningDialog() {
  audioWarningDialog.showModal();
}

showAudioWarningDialog();
