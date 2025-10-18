/**
 * AudioManager.ts
 *
 * Spatial audio engine with EQ sculpting, cinematic crossfades, and whisper positioning.
 * Every sound exists in 3D space to feel like a presence, not a file.
 */

import { Howl, Howler } from 'howler';

type AudioType = 'ambient' | 'whisper' | 'song' | 'fx' | 'voice';

interface AudioTrack {
  id: string;
  type: AudioType;
  howl: Howl | null;
  volume: number;
  isLoaded: boolean;
  position?: { x: number; y: number; z: number };
}

interface SpatialConfig {
  position: { x: number; y: number; z: number };
  orientation?: { x: number; y: number; z: number };
  refDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
  panningModel?: 'HRTF' | 'equalpower';
}

interface EQPreset {
  name: string;
  low: number; // -1 to 1
  mid: number;
  high: number;
}

class AudioManager {
  private tracks: Map<string, AudioTrack> = new Map();
  private currentAmbient: string | null = null;
  private masterVolume: number = 0.75;
  private isMuted: boolean = false;

  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private eqNodes: Map<string, BiquadFilterNode[]> = new Map();

  private listenerPosition = { x: 0, y: 0, z: 0 };

  private eqPresets: Map<string, EQPreset> = new Map([
    ['warm', { name: 'warm', low: 0.3, mid: 0.1, high: -0.2 }],
    ['ethereal', { name: 'ethereal', low: -0.2, mid: 0.2, high: 0.4 }],
    ['intimate', { name: 'intimate', low: 0.2, mid: 0.4, high: 0.1 }],
    ['epic', { name: 'epic', low: 0.5, mid: 0.2, high: 0.3 }],
    ['gentle', { name: 'gentle', low: 0.1, mid: 0.3, high: -0.3 }],
  ]);

  constructor() {
    Howler.volume(this.masterVolume);
    this.initSpatialAudio();
  }

  /**
   * Create audio graph for spatial sound and reverb tail.
   */
  private initSpatialAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.createReverb();
      console.log('🎧 Spatial audio initialized');
    } catch (error) {
      console.warn('⚠️ Spatial audio unavailable, falling back to stereo', error);
    }
  }

  /**
   * Generate impulse response to simulate the ambient space.
   */
  private async createReverb() {
    if (!this.audioContext) return;

    this.reverbNode = this.audioContext.createConvolver();
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.8));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    this.reverbNode.buffer = impulse;
    if (this.masterGain) {
      this.reverbNode.connect(this.masterGain);
    }
  }

  /**
   * Sculpt EQ curve for a track to match emotional tone.
   */
  private createEQ(trackId: string, preset: string = 'intimate'): BiquadFilterNode[] {
    if (!this.audioContext) return [];

    const eqPreset = this.eqPresets.get(preset);
    if (!eqPreset) return [];

    const lowShelf = this.audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = eqPreset.low * 12;

    const midPeak = this.audioContext.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = 1000;
    midPeak.Q.value = 1;
    midPeak.gain.value = eqPreset.mid * 12;

    const highShelf = this.audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4000;
    highShelf.gain.value = eqPreset.high * 12;

    lowShelf.connect(midPeak);
    midPeak.connect(highShelf);

    this.eqNodes.set(trackId, [lowShelf, midPeak, highShelf]);
    return [lowShelf, midPeak, highShelf];
  }

  /**
   * Preload audio with optional spatial config and EQ preset.
   */
  async preload(
    id: string,
    src: string,
    type: AudioType = 'ambient',
    spatialConfig?: SpatialConfig,
    eqPreset?: string
  ): Promise<void> {
    return new Promise(resolve => {
      const howl = new Howl({
        src: [src],
        preload: true,
        volume: type === 'whisper' ? 0.9 : type === 'ambient' ? 0.6 : 0.8,
        loop: type === 'ambient',
        html5: spatialConfig ? false : true,
        onload: () => {
          console.log(`✨ Audio loaded: ${id} (${type})`);
          if (spatialConfig && this.audioContext) {
            this.applySpatialAudio(id, howl, spatialConfig);
          }
          if (eqPreset) {
            this.createEQ(id, eqPreset);
          }

          const track = this.tracks.get(id);
          if (track) {
            track.isLoaded = true;
            track.howl = howl;
          }
          resolve();
        },
        onloaderror: () => {
          console.warn(`⚠️ Audio missing: ${id} - using silence placeholder`);
          this.tracks.set(id, {
            id,
            type,
            howl: null,
            volume: 0,
            isLoaded: true,
            position: spatialConfig?.position,
          });
          resolve();
        },
      });

      this.tracks.set(id, {
        id,
        type,
        howl,
        volume: howl.volume(),
        isLoaded: false,
        position: spatialConfig?.position,
      });
    });
  }

  /**
   * Wire Howler output into Web Audio graph for positional sound.
   */
  private applySpatialAudio(id: string, howl: Howl, config: SpatialConfig) {
    if (!this.audioContext) return;

    const panner = this.audioContext.createPanner();
    panner.panningModel = config.panningModel || 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = config.refDistance ?? 1.5;
    panner.maxDistance = config.maxDistance ?? 30;
    panner.rolloffFactor = config.rolloffFactor ?? 0.8;
    panner.setPosition(config.position.x, config.position.y, config.position.z);

    const source = (howl as any)._sounds?.[0]?._node;
    if (source && source instanceof AudioNode) {
      source.disconnect();
      source.connect(panner);

      if (this.reverbNode) {
        panner.connect(this.reverbNode);
      }
      if (this.masterGain) {
        panner.connect(this.masterGain);
      }
    }
  }

  /**
   * Update listener position to keep spatial audio believable.
   */
  updateListenerPosition(x: number, y: number, z: number) {
    this.listenerPosition = { x, y, z };
    this.audioContext?.listener.setPosition(x, y, z);
  }

  /**
   * Orient listener to follow camera direction.
   */
  updateListenerOrientation(
    forwardX: number,
    forwardY: number,
    forwardZ: number,
    upX: number = 0,
    upY: number = 1,
    upZ: number = 0
  ) {
    this.audioContext?.listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
  }

  /**
   * Fade ambient memories into one another.
   */
  crossfade(
    fromId: string | null,
    toId: string,
    duration: number = 3.5,
    eqPreset?: string
  ) {
    if (fromId) {
      this.stop(fromId, duration);
    }

    this.currentAmbient = toId;

    if (eqPreset) {
      this.applyEQPreset(toId, eqPreset, duration);
    }

    this.play(toId, duration);
  }

  private applyEQPreset(trackId: string, presetName: string, duration: number) {
    const filters = this.eqNodes.get(trackId);
    const preset = this.eqPresets.get(presetName);

    if (!filters || !preset || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    filters[0].gain.linearRampToValueAtTime(preset.low * 12, now + duration);
    filters[1].gain.linearRampToValueAtTime(preset.mid * 12, now + duration);
    filters[2].gain.linearRampToValueAtTime(preset.high * 12, now + duration);
  }

  /**
   * Play a track with optional fade.
   */
  play(id: string, fadeIn: number = 0): number | null {
    const track = this.tracks.get(id);
    if (!track || !track.howl) {
      console.warn(`🎚️ Cannot play ${id} (missing or unloaded)`);
      return null;
    }

    if (fadeIn > 0) {
      track.howl.volume(0);
      track.howl.play();
      track.howl.fade(0, track.volume, fadeIn * 1000);
    } else {
      track.howl.volume(track.volume);
      track.howl.play();
    }

    track.isLoaded = true;
    return track.howl.play();
  }

  /**
   * Stop a track gracefully.
   */
  stop(id: string, fadeOut: number = 0) {
    const track = this.tracks.get(id);
    if (!track || !track.howl) return;

    if (fadeOut > 0) {
      track.howl.fade(track.howl.volume(), 0, fadeOut * 1000);
      setTimeout(() => track.howl?.stop(), fadeOut * 1000);
    } else {
      track.howl.stop();
    }
  }

  /**
   * Whisper from a point in space.
   */
  whisper(
    id: string,
    position: { x: number; y: number; z: number },
    delay: number = 0
  ) {
    setTimeout(() => {
      const track = this.tracks.get(id);
      if (track) {
        track.position = position;
      }
      this.play(id);
    }, delay * 1000);
  }

  /**
   * Trigger a positioned sound effect.
   */
  fxAt(id: string, position: { x: number; y: number; z: number }, volume: number = 0.5) {
    const track = this.tracks.get(id);
    if (track) {
      track.position = position;
    }
    this.fx(id, volume);
  }

  /**
   * One-shot sound effects.
   */
  fx(id: string, volume: number = 0.5) {
    const track = this.tracks.get(id);
    if (!track || !track.howl) return;

    const originalVolume = track.volume;
    track.howl.volume(volume);
    track.howl.play();

    track.howl.once('end', () => track.howl?.volume(originalVolume));
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    return this.isMuted;
  }

  pauseAll() {
    this.tracks.forEach(track => track.howl?.pause());
  }

  resumeAll() {
    this.tracks.forEach(track => {
      if (track.howl && !track.howl.playing()) {
        track.howl.play();
      }
    });
  }

  destroy() {
    this.tracks.forEach(track => track.howl?.unload());
    this.tracks.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  getLoadProgress(): number {
    const total = this.tracks.size;
    if (total === 0) return 1;
    const loaded = Array.from(this.tracks.values()).filter(t => t.isLoaded).length;
    return loaded / total;
  }
}

export const audioManager = new AudioManager();
export default audioManager;
