import { renderMemoriesAudioBuffer } from './pianoMusic';

export type MusicStateListener = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trackName: string;
  volume: number;
  isMuted: boolean;
}) => void;

class MusicManager {
  private ctx: AudioContext | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private duration: number = 34; // default estimated
  private trackName: string = 'Maroon 5 - Memories (Piano Instrumental)';
  private volume: number = 0.8;
  private isMuted: boolean = false;

  private isRendering: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private listeners: Set<MusicStateListener> = new Set();
  private animFrameId: number | null = null;

  constructor() {
    // Lazy initialized on user gesture
  }

  private initAudio() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: MusicStateListener): () => void {
    this.listeners.add(listener);
    this.notifyState();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState() {
    const state = {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentPlaybackTime(),
      duration: this.duration,
      trackName: this.trackName,
      volume: this.volume,
      isMuted: this.isMuted,
    };
    this.listeners.forEach((fn) => fn(state));
  }

  public getCurrentPlaybackTime(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.pauseOffset;
    }
    const elapsed = this.ctx.currentTime - this.startTime + this.pauseOffset;
    return this.duration > 0 ? elapsed % this.duration : 0;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode || !this.isPlaying) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  // Pre-load or ensure the default track is ready
  public async loadDefaultTrack(): Promise<void> {
    if (this.currentBuffer) return;
    if (this.loadPromise) return this.loadPromise;

    this.initAudio();
    if (!this.ctx) return;

    this.loadPromise = (async () => {
      this.isRendering = true;
      try {
        let loaded = false;
        // Check for custom mp3 uploaded to public/assets/lagu-streak-500.mp3
        const candidatePaths = ['/assets/lagu-streak-500.mp3', '/lagu-streak-500.mp3'];
        for (const path of candidatePaths) {
          try {
            const res = await fetch(path);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              if (this.ctx) {
                const decoded = await this.ctx.decodeAudioData(arrayBuffer);
                this.currentBuffer = decoded;
                this.duration = decoded.duration;
                this.trackName = 'Streak 500 Soundtrack';
                this.notifyState();
                loaded = true;
                break;
              }
            }
          } catch (e) {
            console.warn(`Could not load audio from ${path}:`, e);
          }
        }

        if (!loaded && this.ctx) {
          this.currentBuffer = await renderMemoriesAudioBuffer(this.ctx);
          this.duration = this.currentBuffer.duration;
          this.trackName = 'Maroon 5 - Memories (Piano Instrumental)';
          this.notifyState();
        }
      } catch (err) {
        console.error('Error loading audio track:', err);
      } finally {
        this.isRendering = false;
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  // Load custom user uploaded audio file (MP3, WAV, M4A, etc.)
  public async loadUserAudioFile(file: File): Promise<void> {
    this.initAudio();
    if (!this.ctx) return;

    const arrayBuffer = await file.arrayBuffer();
    const decoded = await this.ctx.decodeAudioData(arrayBuffer);

    this.pause();
    this.currentBuffer = decoded;
    this.duration = decoded.duration;
    this.pauseOffset = 0;
    this.trackName = file.name.replace(/\.[^/.]+$/, '');
    this.notifyState();

    // Auto start playing
    this.play();
  }

  // Start or resume music playback
  public async play(): Promise<void> {
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        // Will be resumed on next user gesture if browser blocked unprompted resume
      }
    }

    if (!this.currentBuffer) {
      await this.loadDefaultTrack();
    }

    if (!this.currentBuffer) return;

    if (this.isPlaying) return;

    // Disconnect any existing source
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.currentBuffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = this.currentBuffer.duration;

    if (this.gainNode) {
      source.connect(this.gainNode);
    }

    const offset = this.pauseOffset % this.currentBuffer.duration;
    source.start(0, offset);
    this.startTime = this.ctx.currentTime;
    this.sourceNode = source;
    this.isPlaying = true;

    this.startTracking();
    this.notifyState();
  }

  // Pause music playback
  public pause(): void {
    if (!this.isPlaying) return;

    if (this.ctx && this.sourceNode) {
      this.pauseOffset = this.getCurrentPlaybackTime();
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }

    this.isPlaying = false;
    this.stopTracking();
    this.notifyState();
  }

  // Toggle between play and pause
  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Seek to specific position
  public seek(timeInSeconds: number): void {
    const clamped = Math.max(0, Math.min(this.duration, timeInSeconds));
    this.pauseOffset = clamped;

    if (this.isPlaying) {
      // Re-trigger play at new offset
      this.pause();
      this.pauseOffset = clamped;
      this.play();
    } else {
      this.notifyState();
    }
  }

  // Set Volume (0.0 to 1.0)
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx?.currentTime || 0);
    }
    this.notifyState();
  }

  // Toggle Mute
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    this.notifyState();
    return this.isMuted;
  }

  private startTracking() {
    this.stopTracking();
    const update = () => {
      if (this.isPlaying) {
        this.notifyState();
        this.animFrameId = requestAnimationFrame(update);
      }
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  private stopTracking() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export const musicManager = new MusicManager();
