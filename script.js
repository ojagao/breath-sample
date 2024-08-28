// マイク入力から音量を取得する関数
async function setupAudioProcessing() {
  try {
      // マイクのアクセス許可を要求
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // AudioContextの作成
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(256, 1, 1);

      // マイクをanalyserに接続
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      // 音声データを解析する
      scriptProcessor.onaudioprocess = function(event) {
          const input = event.inputBuffer.getChannelData(0);
          let sum = 0.0;

          // 音量を計算
          for (let i = 0; i < input.length; ++i) {
              sum += input[i] * input[i];
          }
          const volume = Math.sqrt(sum / input.length);

          // 閾値を超えた場合、テキストを表示
          if (volume > 0.1) { // 閾値は0.1に設定
              document.getElementById('message').style.display = 'block';
          } else {
              document.getElementById('message').style.display = 'none';
          }
      };

  } catch (error) {
      console.error('マイクへのアクセスが拒否されました: ', error);
  }
}

// ページがロードされたときに実行
window.onload = () => {
  setupAudioProcessing();
};
