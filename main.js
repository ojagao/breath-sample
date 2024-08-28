let audioContext;
let microphone;
let volumeNode;
let isVolumeDetectionActive = false;

async function setupAudioProcessing() {
  try {
    // マイクのアクセス許可を要求
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // AudioContextの作成
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // AudioWorkletモジュールをロード
    await audioContext.audioWorklet.addModule("volume-processor.js");

    // マイクストリームをAudioContextに接続
    microphone = audioContext.createMediaStreamSource(stream);
    volumeNode = new AudioWorkletNode(audioContext, "volume-processor");

    // マイクをvolumeNodeに接続
    microphone.connect(volumeNode);

    // メッセージを受け取るためにvolumeNodeのポートを使用

    let isVolumeUpdating = true;
    setTimeout(() => {
      isVolumeUpdating = false;
    }, 2000);
    let maxVolume = 0;

    let thresholdBase = 0.1; // デフォルトの閾値をAndroid用に設定

    // ユーザーエージェントをチェックして閾値を設定
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      thresholdBase = 0.5;
      console.log("iPhone!");
    } else if (/Android/i.test(navigator.userAgent)) {
      thresholdBase = 0.2; // Androidの場合
      console.log("Android!");
    }

    volumeNode.port.onmessage = (event) => {
      const volume = event.data.volume;
      // 2秒以内 && 最大音量更新 && 外れ値の除外
      if (isVolumeUpdating && maxVolume < volume && volume < 2.0) {
        maxVolume = volume;
        console.log(maxVolume);
      }

      if (!isVolumeDetectionActive) return;

      const threshold = maxVolume + thresholdBase; // 閾値を設定
      console.log("MaxVolume", threshold);

      // 閾値を超えた場合、2つ目の動画を再生
      if (volume > threshold) {
        document.getElementById("video1").style.display = "none";
        document.getElementById("video2").style.display = "block";
        document.getElementById("announce").style.display = "none";
        document.getElementById("video2").play();
        isVolumeDetectionActive = false; // 再度検出しないように設定
      } else {
        document.getElementById("message").style.display = "none";
      }
    };

    const video1 = document.getElementById("video1");
    video1.setAttribute("autoplay", "");
    video1.play();
  } catch (error) {
    console.error("マイクへのアクセスが拒否されました: ", error);
  }
}

window.onload = () => {
  const video1 = document.getElementById("video1");
  const video2 = document.getElementById("video2");

  // ページがロードされた際にマイクの許可を取得
  setupAudioProcessing();

  // 1つ目の動画が終了した後に音量検出を開始
  video1.onended = () => {
    console.log("1つ目の動画が終了しました。音量検出を開始します。");
    isVolumeDetectionActive = true;
    document.getElementById("announce").style.display = "block";
  };

  // 2つ目の動画が終了した際の処理（必要ならば）
  video2.onended = () => {
    console.log("2つ目の動画が終了しました。");
    document.getElementById("message").style.display = "block";
    video2.style.display = "none";
  };
};
