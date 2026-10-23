/**
 * SpotiPlayer - High-Fidelity Web Audio & DSP Engine
 * Manages HTML5 Audio playback, Web Audio API DSP pipeline,
 * 10-Band Parametric Equalizer, and Real-Time Spectrum Analysis.
 */

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: Map<number, BiquadFilterNode> = new Map();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';
    }
  }

  /**
   * Initializes the Web Audio API context and node chain on user gesture.
   */
  public initWebAudio(): void {
    if (this.isInitialized || !this.audio || typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();

      // Setup 10-band Parametric EQ Filters
      const frequencies = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      let previousNode: AudioNode = this.sourceNode;

      frequencies.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const filter = this.audioCtx.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === frequencies.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;

        previousNode.connect(filter);
        this.eqFilters.set(freq, filter);
        previousNode = filter;
      });

      // Connect EQ chain -> Gain -> Analyser -> Destination
      previousNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch {
      // In case of browser autoplay or CORS restrictions, fallback gracefully
      this.isInitialized = false;
    }
  }

  public async play(url?: string): Promise<void> {
    if (!this.audio) return;

    if (!this.isInitialized) {
      this.initWebAudio();
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (url && this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }

    try {
      await this.audio.play();
    } catch {
      // Autoplay or network restriction
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public seek(seconds: number): void {
    if (this.audio && !isNaN(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setEqBand(frequency: number, gainDb: number): void {
    const filter = this.eqFilters.get(frequency);
    if (filter && this.audioCtx) {
      filter.gain.setValueAtTime(gainDb, this.audioCtx.currentTime);
    }
  }

  /**
   * Retrieves real-time spectral frequency data for equalizer visualization.
   */
  public getFrequencyData(outputArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(outputArray as unknown as Uint8Array<ArrayBuffer>);
    } else {
      outputArray.fill(0);
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }
}

export const audioEngine = new AudioEngine();
