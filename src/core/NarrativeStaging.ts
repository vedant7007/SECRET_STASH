/**
 * NarrativeStaging.ts — PHASE 3.5: NARRATIVE STAGING LAYER
 *
 * Progressive reveal system that controls pacing and emotional flow
 * Transforms content from static data into living narrative
 *
 * Philosophy: Content should arrive like memories —
 * gently, purposefully, never rushed.
 */

import { EmotionalContent } from './ContentTypes';

/**
 * Pacing configuration based on timing metadata
 */
export type PacingMode = 'instant' | 'slow' | 'float' | 'linger' | 'crescendo' | 'cascade';

export interface PacingConfig {
  mode: PacingMode;
  baseDelay: number;        // Base delay between items (ms)
  dwellTime: number;        // How long to stay visible (ms)
  transitionIn: number;     // Fade-in duration (ms)
  transitionOut: number;    // Fade-out duration (ms)
  staggerMultiplier: number; // Multiplier for stagger delay
}

/**
 * Pacing presets
 */
export const PACING_PRESETS: Record<PacingMode, PacingConfig> = {
  instant: {
    mode: 'instant',
    baseDelay: 0,
    dwellTime: 3000,
    transitionIn: 200,
    transitionOut: 200,
    staggerMultiplier: 1.0,
  },
  slow: {
    mode: 'slow',
    baseDelay: 2000,
    dwellTime: 4000,
    transitionIn: 1200,
    transitionOut: 800,
    staggerMultiplier: 1.5,
  },
  float: {
    mode: 'float',
    baseDelay: 1500,
    dwellTime: 5000,
    transitionIn: 1800,
    transitionOut: 1200,
    staggerMultiplier: 1.2,
  },
  linger: {
    mode: 'linger',
    baseDelay: 2500,
    dwellTime: 6000,
    transitionIn: 2000,
    transitionOut: 1500,
    staggerMultiplier: 1.8,
  },
  crescendo: {
    mode: 'crescendo',
    baseDelay: 1000,
    dwellTime: 3500,
    transitionIn: 600,
    transitionOut: 400,
    staggerMultiplier: 0.8, // Accelerates
  },
  cascade: {
    mode: 'cascade',
    baseDelay: 500,
    dwellTime: 4000,
    transitionIn: 800,
    transitionOut: 600,
    staggerMultiplier: 0.95, // Quick but smooth
  },
};

/**
 * Parse timing field to pacing mode
 */
export function parsePacingMode(timing: string | number | undefined): PacingMode {
  if (typeof timing === 'number') {
    // Numeric timing: map to pacing mode
    if (timing < 1) return 'instant';
    if (timing < 1.5) return 'cascade';
    if (timing < 2) return 'slow';
    if (timing < 2.5) return 'float';
    if (timing < 3) return 'linger';
    return 'crescendo';
  }

  if (typeof timing === 'string') {
    const normalized = timing.toLowerCase();
    if (normalized in PACING_PRESETS) {
      return normalized as PacingMode;
    }
  }

  return 'float'; // Default
}

/**
 * Stage lifecycle phases
 */
export type StagePhase = 'waiting' | 'entering' | 'dwelling' | 'exiting' | 'complete';

/**
 * Staged content item
 */
export interface StagedItem<T extends EmotionalContent> {
  item: T;
  index: number;
  phase: StagePhase;
  enterTime: number;
  exitTime: number;
  visible: boolean;
}

/**
 * Progressive reveal orchestrator
 */
export class NarrativeStager<T extends EmotionalContent> {
  private items: T[];
  private stagedItems: StagedItem<T>[] = [];
  private currentIndex: number = 0;
  private startTime: number = 0;
  private timers: number[] = [];
  private callbacks: Map<string, (item: StagedItem<T>) => void> = new Map();

  constructor(items: T[], private pacing?: PacingConfig) {
    this.items = items;

    // Use first item's timing if no pacing provided
    if (!pacing && items.length > 0) {
      const mode = parsePacingMode(items[0].timing);
      this.pacing = PACING_PRESETS[mode];
    }

    if (!this.pacing) {
      this.pacing = PACING_PRESETS.float;
    }
  }

  /**
   * Begin the narrative sequence
   */
  start(): void {
    this.startTime = Date.now();
    this.currentIndex = 0;
    this.stagedItems = [];
    this.scheduleNextReveal();
  }

  /**
   * Pause the sequence
   */
  pause(): void {
    this.clearTimers();
  }

  /**
   * Resume the sequence
   */
  resume(): void {
    this.scheduleNextReveal();
  }

  /**
   * Stop and reset
   */
  stop(): void {
    this.clearTimers();
    this.currentIndex = 0;
    this.stagedItems = [];
  }

  /**
   * Skip to next item
   */
  skipToNext(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.clearTimers();
      this.currentIndex++;
      this.scheduleNextReveal();
    }
  }

  /**
   * Register lifecycle callbacks
   */
  on(event: 'enter' | 'dwell' | 'exit' | 'complete', callback: (item: StagedItem<T>) => void): void {
    this.callbacks.set(event, callback);
  }

  /**
   * Get currently visible items
   */
  getVisibleItems(): StagedItem<T>[] {
    return this.stagedItems.filter(s => s.visible && s.phase !== 'complete');
  }

  /**
   * Get all staged items
   */
  getAllStaged(): StagedItem<T>[] {
    return this.stagedItems;
  }

  /**
   * Schedule next item reveal
   */
  private scheduleNextReveal(): void {
    if (this.currentIndex >= this.items.length) {
      this.emit('complete', null);
      return;
    }

    const item = this.items[this.currentIndex];
    const config = this.pacing!;

    // Calculate delay with stagger
    const staggerDelay = config.baseDelay * (this.currentIndex * config.staggerMultiplier);

    const timer = window.setTimeout(() => {
      this.revealItem(item, this.currentIndex);
      this.currentIndex++;
      this.scheduleNextReveal();
    }, staggerDelay);

    this.timers.push(timer);
  }

  /**
   * Reveal a single item
   */
  private revealItem(item: T, index: number): void {
    const config = this.pacing!;
    const now = Date.now();

    const staged: StagedItem<T> = {
      item,
      index,
      phase: 'entering',
      enterTime: now,
      exitTime: now + config.dwellTime,
      visible: true,
    };

    this.stagedItems.push(staged);

    // Emit enter event
    this.emit('enter', staged);

    // Transition to dwelling
    const dwellTimer = window.setTimeout(() => {
      staged.phase = 'dwelling';
      this.emit('dwell', staged);

      // Schedule exit
      const exitTimer = window.setTimeout(() => {
        this.exitItem(staged);
      }, config.dwellTime);

      this.timers.push(exitTimer);
    }, config.transitionIn);

    this.timers.push(dwellTimer);
  }

  /**
   * Exit an item
   */
  private exitItem(staged: StagedItem<T>): void {
    const config = this.pacing!;

    staged.phase = 'exiting';
    this.emit('exit', staged);

    const completeTimer = window.setTimeout(() => {
      staged.phase = 'complete';
      staged.visible = false;
    }, config.transitionOut);

    this.timers.push(completeTimer);
  }

  /**
   * Emit event to callbacks
   */
  private emit(event: string, staged: StagedItem<T> | null): void {
    const callback = this.callbacks.get(event);
    if (callback && staged) {
      callback(staged);
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.timers.forEach(t => window.clearTimeout(t));
    this.timers = [];
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearTimers();
    this.callbacks.clear();
    this.stagedItems = [];
  }
}

/**
 * Wave-based reveal (for category grouping)
 */
export interface WaveConfig {
  categories: string[];
  waveDelay: number; // Delay between category waves
  itemDelay: number; // Delay between items in same wave
}

export class WaveStager<T extends EmotionalContent & { category?: string }> {
  private items: T[];
  private waves: Map<string, T[]> = new Map();
  private currentWaveIndex: number = 0;
  private stager: NarrativeStager<T> | null = null;
  private callbacks: Map<string, (items: T[], category: string) => void> = new Map();

  constructor(items: T[], private config: WaveConfig) {
    this.items = items;
    this.groupByCategory();
  }

  /**
   * Group items by category
   */
  private groupByCategory(): void {
    this.items.forEach(item => {
      const category = item.category || 'other';
      if (!this.waves.has(category)) {
        this.waves.set(category, []);
      }
      this.waves.get(category)!.push(item);
    });
  }

  /**
   * Start wave sequence
   */
  start(): void {
    this.currentWaveIndex = 0;
    this.revealNextWave();
  }

  /**
   * Reveal next category wave
   */
  private revealNextWave(): void {
    if (this.currentWaveIndex >= this.config.categories.length) {
      this.emit('complete', [], 'all');
      return;
    }

    const category = this.config.categories[this.currentWaveIndex];
    const items = this.waves.get(category) || [];

    if (items.length > 0) {
      this.emit('wave-start', items, category);

      // Create stager for this wave
      const pacing: PacingConfig = {
        ...PACING_PRESETS.cascade,
        baseDelay: this.config.itemDelay,
      };

      this.stager = new NarrativeStager(items, pacing);
      this.stager.start();

      // Wait for wave to complete
      setTimeout(() => {
        this.currentWaveIndex++;
        this.revealNextWave();
      }, this.config.waveDelay);
    } else {
      // Skip empty category
      this.currentWaveIndex++;
      this.revealNextWave();
    }
  }

  /**
   * Register callbacks
   */
  on(event: 'wave-start' | 'complete', callback: (items: T[], category: string) => void): void {
    this.callbacks.set(event, callback);
  }

  /**
   * Emit event
   */
  private emit(event: string, items: T[], category: string): void {
    const callback = this.callbacks.get(event);
    if (callback) {
      callback(items, category);
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.stager) {
      this.stager.dispose();
    }
    this.callbacks.clear();
  }
}

/**
 * Helper: Create stager from content with auto-pacing
 */
export function createStager<T extends EmotionalContent>(items: T[]): NarrativeStager<T> {
  return new NarrativeStager(items);
}

/**
 * Helper: Create wave stager with default config
 */
export function createWaveStager<T extends EmotionalContent & { category?: string }>(
  items: T[],
  categories: string[]
): WaveStager<T> {
  const config: WaveConfig = {
    categories,
    waveDelay: 3000,
    itemDelay: 500,
  };
  return new WaveStager(items, config);
}

export default {
  NarrativeStager,
  WaveStager,
  createStager,
  createWaveStager,
  parsePacingMode,
  PACING_PRESETS,
};
