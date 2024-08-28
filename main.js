async function setupAudioProcessing() {
  try {
    // マイクのアクセス許可を要求
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // AudioContextの作成
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // AudioWorkletモジュールをロード
    await audioContext.audioWorklet.addModule("volume-processor.js");

    // マイクストリームをAudioContextに接続
    const microphone = audioContext.createMediaStreamSource(stream);
    const volumeNode = new AudioWorkletNode(audioContext, "volume-processor");

    // マイクをvolumeNodeに接続
    microphone.connect(volumeNode);

    // メッセージを受け取るためにvolumeNodeのポートを使用
    volumeNode.port.onmessage = (event) => {
      const volume = event.data.volume;
      const threshold = 0.03; // 閾値を設定

      // 閾値を超えた場合、テキストを表示
      if (volume > threshold) {
        document.getElementById("message").style.display = "block";
      } else {
        document.getElementById("message").style.display = "none";
      }
    };
  } catch (error) {
    console.error("マイクへのアクセスが拒否されました: ", error);
  }
}

// ページがロードされたときに実行
window.onload = () => {
  setupAudioProcessing();
};
