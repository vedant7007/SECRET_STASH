/**
 * EmotionalCrescendo.ts — PHASE 5: EMOTIONAL CRESCENDO LOGIC
 *
 * Finale should feel *earned*, not "next page"
 * Minor pause before bloom → anticipated reveal
 *
 * Philosophy: The finale is not triggered — it's *arrived at*.
 * You must earn the right to see the heart.
 */

/**
 * Crescendo requirements (conditions for finale unlock)
 */
export interface CrescendoRequirements {
  // Minimum engagement
  minScenesVisited: number;           // Must visit at least N scenes (default: 4)
  minContentRevealed: number;         // Must reveal at least N pieces of content (default: 15)
  minTimeSpent: number;               // Must spend at least N seconds (default: 180)

  // Emotional journey
  emotionsExperienced: string[];      // Must experience these emotions
  minEmotionDuration: number;         // Must dwell on emotions for N seconds each (default: 5)

  // Interaction depth
  minInteractions: number;            // Touch/click/hover count (default: 20)
  requiredGestures?: string[];        // Optional: must use specific gestures

  // Narrative engagement
  minNarrativeWaves: number;          // Must complete N narrative waves (default: 3)

  // Optional: Specific scene completions
  requiredScenes?: string[];          // Must complete these specific scenes
}

/**
 * Default crescendo requirements
 */
const DEFAULT_REQUIREMENTS: CrescendoRequirements = {
  minScenesVisited: 4,
  minContentRevealed: 15,
  minTimeSpent: 180, // 3 minutes
  emotionsExperienced: ['joy', 'tenderness', 'longing', 'wonder'],
  minEmotionDuration: 5,
  minInteractions: 20,
  minNarrativeWaves: 3,
};

/**
 * Journey tracking state
 */
export interface JourneyState {
  scenesVisited: Set<string>;
  contentRevealed: number;
  timeSpent: number;
  emotionsExperienced: Map<string, number>; // emotion → duration in seconds
  interactions: number;
  gesturesUsed: Set<string>;
  narrativeWavesCompleted: number;
  startTime: number;
}

/**
 * Emotional crescendo manager
 */
export class EmotionalCrescendoManager {
  private requirements: CrescendoRequirements;
  private state: JourneyState;
  private isUnlocked: boolean = false;
  private onUnlock: (() => void) | null = null;
  private onProgress: ((progress: number) => void) | null = null;
  private trackingInterval: number | null = null;

  constructor(requirements?: Partial<CrescendoRequirements>) {
    this.requirements = { ...DEFAULT_REQUIREMENTS, ...requirements };
    this.state = {
      scenesVisited: new Set(),
      contentRevealed: 0,
      timeSpent: 0,
      emotionsExperienced: new Map(),
      interactions: 0,
      gesturesUsed: new Set(),
      narrativeWavesCompleted: 0,
      startTime: Date.now(),
    };

    console.log('[EmotionalCrescendo] Initialized with requirements:', this.requirements);
  }

  /**
   * Start tracking journey
   */
  start(callbacks?: {
    onUnlock?: () => void;
    onProgress?: (progress: number) => void;
  }): void {
    this.onUnlock = callbacks?.onUnlock || null;
    this.onProgress = callbacks?.onProgress || null;

    // Start time tracking
    this.trackingInterval = window.setInterval(() => {
      this.state.timeSpent = (Date.now() - this.state.startTime) / 1000;
      this.checkUnlock();
    }, 1000);

    console.log('[EmotionalCrescendo] Tracking started');
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.trackingInterval !== null) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Record scene visit
   */
  visitScene(sceneName: string): void {
    if (!this.state.scenesVisited.has(sceneName)) {
      this.state.scenesVisited.add(sceneName);
      console.log(`[EmotionalCrescendo] Scene visited: ${sceneName} (${this.state.scenesVisited.size}/${this.requirements.minScenesVisited})`);
      this.checkUnlock();
    }
  }

  /**
   * Record content reveal (wish, apology, promise, etc.)
   */
  revealContent(): void {
    this.state.contentRevealed++;
    console.log(`[EmotionalCrescendo] Content revealed: ${this.state.contentRevealed}/${this.requirements.minContentRevealed}`);
    this.checkUnlock();
  }

  /**
   * Record emotion experience
   */
  experienceEmotion(emotion: string, duration: number): void {
    const current = this.state.emotionsExperienced.get(emotion) || 0;
    this.state.emotionsExperienced.set(emotion, current + duration);

    console.log(`[EmotionalCrescendo] Emotion experienced: ${emotion} (${current + duration}s)`);
    this.checkUnlock();
  }

  /**
   * Record interaction (tap, hover, etc.)
   */
  recordInteraction(type?: string): void {
    this.state.interactions++;

    if (type) {
      this.state.gesturesUsed.add(type);
    }

    if (this.state.interactions % 10 === 0) {
      console.log(`[EmotionalCrescendo] Interactions: ${this.state.interactions}/${this.requirements.minInteractions}`);
    }

    this.checkUnlock();
  }

  /**
   * Record narrative wave completion
   */
  completeNarrativeWave(): void {
    this.state.narrativeWavesCompleted++;
    console.log(`[EmotionalCrescendo] Narrative wave completed: ${this.state.narrativeWavesCompleted}/${this.requirements.minNarrativeWaves}`);
    this.checkUnlock();
  }

  /**
   * Check if finale is unlocked
   */
  private checkUnlock(): void {
    if (this.isUnlocked) return;

    const progress = this.calculateProgress();

    // Emit progress
    this.onProgress?.(progress);

    // Check all requirements
    if (this.meetsRequirements()) {
      this.unlock();
    }
  }

  /**
   * Check if all requirements are met
   */
  private meetsRequirements(): boolean {
    // Scenes visited
    if (this.state.scenesVisited.size < this.requirements.minScenesVisited) {
      return false;
    }

    // Content revealed
    if (this.state.contentRevealed < this.requirements.minContentRevealed) {
      return false;
    }

    // Time spent
    if (this.state.timeSpent < this.requirements.minTimeSpent) {
      return false;
    }

    // Emotions experienced
    for (const requiredEmotion of this.requirements.emotionsExperienced) {
      const duration = this.state.emotionsExperienced.get(requiredEmotion) || 0;
      if (duration < this.requirements.minEmotionDuration) {
        return false;
      }
    }

    // Interactions
    if (this.state.interactions < this.requirements.minInteractions) {
      return false;
    }

    // Narrative waves
    if (this.state.narrativeWavesCompleted < this.requirements.minNarrativeWaves) {
      return false;
    }

    // Required scenes (if specified)
    if (this.requirements.requiredScenes) {
      for (const requiredScene of this.requirements.requiredScenes) {
        if (!this.state.scenesVisited.has(requiredScene)) {
          return false;
        }
      }
    }

    // Required gestures (if specified)
    if (this.requirements.requiredGestures) {
      for (const requiredGesture of this.requirements.requiredGestures) {
        if (!this.state.gesturesUsed.has(requiredGesture)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate overall progress (0-1)
   */
  calculateProgress(): number {
    const weights = {
      scenes: 0.2,
      content: 0.2,
      time: 0.15,
      emotions: 0.25,
      interactions: 0.1,
      waves: 0.1,
    };

    const scenesProgress = Math.min(
      this.state.scenesVisited.size / this.requirements.minScenesVisited,
      1
    );

    const contentProgress = Math.min(
      this.state.contentRevealed / this.requirements.minContentRevealed,
      1
    );

    const timeProgress = Math.min(
      this.state.timeSpent / this.requirements.minTimeSpent,
      1
    );

    const emotionsProgress = this.requirements.emotionsExperienced.reduce((sum, emotion) => {
      const duration = this.state.emotionsExperienced.get(emotion) || 0;
      return sum + Math.min(duration / this.requirements.minEmotionDuration, 1);
    }, 0) / this.requirements.emotionsExperienced.length;

    const interactionsProgress = Math.min(
      this.state.interactions / this.requirements.minInteractions,
      1
    );

    const wavesProgress = Math.min(
      this.state.narrativeWavesCompleted / this.requirements.minNarrativeWaves,
      1
    );

    return (
      scenesProgress * weights.scenes +
      contentProgress * weights.content +
      timeProgress * weights.time +
      emotionsProgress * weights.emotions +
      interactionsProgress * weights.interactions +
      wavesProgress * weights.waves
    );
  }

  /**
   * Unlock finale
   */
  private unlock(): void {
    if (this.isUnlocked) return;

    this.isUnlocked = true;
    console.log('[EmotionalCrescendo] 🎉 FINALE UNLOCKED 🎉');
    console.log('Journey summary:', {
      scenesVisited: Array.from(this.state.scenesVisited),
      contentRevealed: this.state.contentRevealed,
      timeSpent: `${Math.floor(this.state.timeSpent)}s`,
      emotionsExperienced: Object.fromEntries(this.state.emotionsExperienced),
      interactions: this.state.interactions,
      narrativeWaves: this.state.narrativeWavesCompleted,
    });

    // Emit unlock event
    this.onUnlock?.();
  }

  /**
   * Force unlock (for testing)
   */
  forceUnlock(): void {
    console.warn('[EmotionalCrescendo] Force unlocking finale');
    this.unlock();
  }

  /**
   * Check if unlocked
   */
  isFinaleUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Get current progress
   */
  getProgress(): number {
    return this.calculateProgress();
  }

  /**
   * Get journey state (for debug UI)
   */
  getState(): JourneyState {
    return this.state;
  }

  /**
   * Get requirements (for UI display)
   */
  getRequirements(): CrescendoRequirements {
    return this.requirements;
  }

  /**
   * Serialize state (for persistence)
   */
  serialize(): string {
    return JSON.stringify({
      scenesVisited: Array.from(this.state.scenesVisited),
      contentRevealed: this.state.contentRevealed,
      timeSpent: this.state.timeSpent,
      emotionsExperienced: Object.fromEntries(this.state.emotionsExperienced),
      interactions: this.state.interactions,
      gesturesUsed: Array.from(this.state.gesturesUsed),
      narrativeWavesCompleted: this.state.narrativeWavesCompleted,
      isUnlocked: this.isUnlocked,
    });
  }

  /**
   * Deserialize state (restore from persistence)
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.state.scenesVisited = new Set(parsed.scenesVisited);
    this.state.contentRevealed = parsed.contentRevealed;
    this.state.timeSpent = parsed.timeSpent;
    this.state.emotionsExperienced = new Map(Object.entries(parsed.emotionsExperienced));
    this.state.interactions = parsed.interactions;
    this.state.gesturesUsed = new Set(parsed.gesturesUsed);
    this.state.narrativeWavesCompleted = parsed.narrativeWavesCompleted;
    this.isUnlocked = parsed.isUnlocked;

    console.log('[EmotionalCrescendo] State restored:', this.state);
  }

  /**
   * Reset journey
   */
  reset(): void {
    this.state = {
      scenesVisited: new Set(),
      contentRevealed: 0,
      timeSpent: 0,
      emotionsExperienced: new Map(),
      interactions: 0,
      gesturesUsed: new Set(),
      narrativeWavesCompleted: 0,
      startTime: Date.now(),
    };
    this.isUnlocked = false;

    console.log('[EmotionalCrescendo] Journey reset');
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stop();
    this.onUnlock = null;
    this.onProgress = null;
  }
}

/**
 * React hook for emotional crescendo
 */
export function useEmotionalCrescendo(requirements?: Partial<CrescendoRequirements>) {
  const managerRef = React.useRef<EmotionalCrescendoManager | null>(null);
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new EmotionalCrescendoManager(requirements);

      managerRef.current.start({
        onUnlock: () => setIsUnlocked(true),
        onProgress: (p) => setProgress(p),
      });

      // Load persisted state
      const saved = localStorage.getItem('loveverse-crescendo');
      if (saved) {
        try {
          managerRef.current.deserialize(saved);
          setIsUnlocked(managerRef.current.isFinaleUnlocked());
          setProgress(managerRef.current.getProgress());
        } catch (error) {
          console.warn('[EmotionalCrescendo] Failed to restore state:', error);
        }
      }
    }

    // Save state on unmount
    return () => {
      if (managerRef.current) {
        localStorage.setItem('loveverse-crescendo', managerRef.current.serialize());
        managerRef.current.dispose();
      }
    };
  }, []);

  return {
    manager: managerRef.current,
    isUnlocked,
    progress,
  };
}

import React from 'react';

export default EmotionalCrescendoManager;
