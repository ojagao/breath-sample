class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
      super();
      this._volume = 0;
  }

  // オーディオの処理
  process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input.length > 0) {
          const samples = input[0];
          let sum = 0;
          for (let i = 0; i < samples.length; i++) {
              sum += samples[i] * samples[i];
          }
          this._volume = Math.sqrt(sum / samples.length);

          // メインスレッドにボリューム情報を送信
          this.port.postMessage({ volume: this._volume });
      }

      return true; // trueを返すことで処理を継続
  }
}

registerProcessor('volume-processor', VolumeProcessor);
