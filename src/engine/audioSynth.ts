// engine/audioSynth.ts — Web Audio procedural SFX & Ambience synth replicating sfx.py and dsp.py

class AudioStudioSynth {
  ctx: AudioContext | null = null;
  ambGain: GainNode | null = null;
  ambSource: AudioNode | null = null;
  currentAmbName: string | null = null;

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSFX(name: string, gainDb = -8, pitch = 1.0) {
    this.init();
    if (!this.ctx) return;
    const gainVal = Math.pow(10, gainDb / 20);

    const now = this.ctx.currentTime;
    switch (name) {
      case 'whoosh':
      case 'swish': {
        // Filtered noise sweep
        const bufferSize = this.ctx.sampleRate * (name === 'whoosh' ? 0.7 : 0.3);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime((name === 'whoosh' ? 300 : 1200) * pitch, now);
        filter.frequency.exponentialRampToValueAtTime((name === 'whoosh' ? 3500 : 6000) * pitch, now + (name === 'whoosh' ? 0.7 : 0.3));

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(gainVal, now + (name === 'whoosh' ? 0.35 : 0.15));
        g.gain.exponentialRampToValueAtTime(0.001, now + (name === 'whoosh' ? 0.7 : 0.3));

        noise.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);
        noise.start(now);
        break;
      }

      case 'freeze': {
        // High shimmering reverse swell + snap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 1.2);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(gainVal * 0.7, now + 1.2);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
        break;
      }

      case 'pop':
      case 'blip': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = name === 'pop' ? 'sine' : 'square';
        osc.frequency.setValueAtTime(500 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(1100 * pitch, now + 0.08);
        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'hit':
      case 'impact': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(32 * pitch, now + (name === 'impact' ? 0.5 : 0.2));
        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + (name === 'impact' ? 1.5 : 0.5));
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + (name === 'impact' ? 1.5 : 0.5));
        break;
      }

      case 'ding': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046 * pitch, now);
        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);
        break;
      }

      case 'stinger': {
        // Dramatic low chord
        [110, 146.8, 164.8, 220].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(gainVal * 0.3, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 2.5);
        });
        break;
      }

      case 'buzz': {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(210, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(gainVal * 0.4, now + 0.4);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
        break;
      }

      default:
        // Generic click / blip fallback
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        g.gain.setValueAtTime(gainVal * 0.5, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
  }

  setAmbience(name: string | null, gainDb = -24) {
    this.init();
    if (!this.ctx) return;
    if (this.currentAmbName === name) return;

    if (this.ambSource) {
      try {
        (this.ambSource as AudioBufferSourceNode).stop();
      } catch {}
      this.ambSource.disconnect();
      this.ambSource = null;
    }

    this.currentAmbName = name;
    if (!name) return;

    // Pink / low rumble noise bed
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = name === 'rain' ? 3200 : name === 'wind' ? 600 : 900;

    const gain = this.ctx.createGain();
    const gainVal = Math.pow(10, gainDb / 20);
    gain.gain.setValueAtTime(gainVal * 0.6, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();

    this.ambSource = source;
  }

  stopAll() {
    if (this.ambSource) {
      try {
        (this.ambSource as AudioBufferSourceNode).stop();
      } catch {}
      this.ambSource.disconnect();
      this.ambSource = null;
    }
    this.currentAmbName = null;
  }
}

export const audioSynth = new AudioStudioSynth();
