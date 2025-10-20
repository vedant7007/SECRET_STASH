/**
 * SceneManager.ts — CINEMATIC REBUILD
 *
 * The orchestrator of emotional journeys.
 * Each scene is a chapter, each transition is a breath.
 *
 * Philosophy: Scenes don't just change — they dissolve into each other,
 * like one feeling becoming another.
 *
 * PERFORMANCE UPGRADE:
 * - Integrated cleanup system for memory leak prevention
 * - Scene lifecycle hooks for proper resource disposal
 * - Smooth transitions with GPU memory management
 */

import { create } from 'zustand';
import audioManager from './AudioManager';
import { SceneCleanupManager } from './SceneCleanup';

export type SceneId =
  | 'calibration'
  | 'hero'
  | 'galaxy'
  | 'globe'
  | 'constellation'
  | 'garden'
  | 'sanctuary'
  | 'melody'
  | 'finale';

export interface Scene {
  id: SceneId;
  name: string;
  description: string;
  ambientTrack: string;
  whisperTrack?: string;
  emotion: string; // The core feeling this scene evokes
}

interface SceneState {
  currentScene: SceneId;
  previousScene: SceneId | null;
  isTransitioning: boolean;
  progress: number; // Overall journey progress (0-1)

  // Scene registry
  scenes: Map<SceneId, Scene>;

  // Cleanup manager for current scene
  cleanupManager: SceneCleanupManager | null;

  // Actions
  setScene: (sceneId: SceneId) => void;
  nextScene: () => void;
  previousSceneAction: () => void;
  initializeScenes: () => void;
  registerCleanup: (cleanup: () => void) => void;
  getCleanupManager: () => SceneCleanupManager;
}

// Scene definitions with emotional intent
const sceneDefinitions: Scene[] = [
  {
    id: 'calibration',
    name: 'Calibration',
    description: 'Tuning into her frequency',
    ambientTrack: 'intro_theme',
    whisperTrack: 'scene1_intro',
    emotion: 'anticipation',
  },
  {
    id: 'hero',
    name: 'The Beginning',
    description: 'Where everything converges',
    ambientTrack: 'hero_bloom',
    whisperTrack: 'scene2_hero',
    emotion: 'awe',
  },
  {
    id: 'galaxy',
    name: 'Galaxy of Wishes',
    description: 'Every star holds a dream for her',
    ambientTrack: 'galaxy_wonder',
    whisperTrack: 'scene3_wishes',
    emotion: 'joy',
  },
  {
    id: 'globe',
    name: 'Our World',
    description: 'Every place we have touched, together',
    ambientTrack: 'globe_nostalgia',
    whisperTrack: 'scene4_globe',
    emotion: 'nostalgia',
  },
  {
    id: 'constellation',
    name: 'Constellation of Words',
    description: 'The language of us',
    ambientTrack: 'constellation_ambient',
    whisperTrack: 'scene5_words',
    emotion: 'wonder',
  },
  {
    id: 'garden',
    name: 'Apology Garden',
    description: 'Where sorrow becomes softness',
    ambientTrack: 'rain_garden',
    whisperTrack: 'scene6_apology',
    emotion: 'tenderness',
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary of Promises',
    description: 'Vows written in light',
    ambientTrack: 'promise_sanctuary',
    whisperTrack: 'scene7_promises',
    emotion: 'serenity',
  },
  {
    id: 'melody',
    name: 'Melody Sphere',
    description: 'The rhythm of us',
    ambientTrack: 'melody_dance',
    whisperTrack: 'scene8_melody',
    emotion: 'elation',
  },
  {
    id: 'finale',
    name: 'Supernova',
    description: 'The eternal moment',
    ambientTrack: 'finale_orchestra',
    whisperTrack: 'finale_whisper',
    emotion: 'completion',
  },
];

const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: 'calibration',
  previousScene: null,
  isTransitioning: false,
  progress: 0,
  scenes: new Map(),
  cleanupManager: null,

  initializeScenes: () => {
    const sceneMap = new Map<SceneId, Scene>();
    sceneDefinitions.forEach(scene => {
      sceneMap.set(scene.id, scene);
    });
    set({ scenes: sceneMap, cleanupManager: new SceneCleanupManager() });
  },

  registerCleanup: (cleanup: () => void) => {
    const { cleanupManager } = get();
    if (cleanupManager) {
      cleanupManager.registerCustomCleanup(cleanup);
    }
  },

  getCleanupManager: () => {
    const { cleanupManager } = get();
    if (!cleanupManager) {
      const newManager = new SceneCleanupManager();
      set({ cleanupManager: newManager });
      return newManager;
    }
    return cleanupManager;
  },

  setScene: (sceneId: SceneId) => {
    const { currentScene, scenes, isTransitioning, cleanupManager } = get();

    // Prevent transition spam
    if (isTransitioning) {
      console.log('⏳ Already transitioning...');
      return;
    }

    const newScene = scenes.get(sceneId);
    const oldScene = scenes.get(currentScene);

    if (!newScene) {
      console.error(`❌ Scene not found: ${sceneId}`);
      return;
    }

    console.log(`🌌 Transitioning: ${oldScene?.name} → ${newScene.name}`);

    set({ isTransitioning: true, previousScene: currentScene });

    // CRITICAL: Cleanup old scene to prevent memory leaks
    if (cleanupManager) {
      console.log('🧹 Cleaning up previous scene...');
      cleanupManager.cleanup();
    }

    // Create new cleanup manager for the incoming scene
    const newCleanupManager = new SceneCleanupManager();
    set({ cleanupManager: newCleanupManager });

    // Audio crossfade between scenes
    audioManager.crossfade(
      oldScene?.ambientTrack || null,
      newScene.ambientTrack,
      3.5 // 3.5 seconds of emotional dissolution
    );

    // Play whisper after a brief moment of silence
    if (newScene.whisperTrack) {
      audioManager.whisper(newScene.whisperTrack, { x: 0, y: 0, z: 0 }, 4.0);
    }

    // Update progress (0 at calibration, 1 at finale)
    const sceneIndex = sceneDefinitions.findIndex(s => s.id === sceneId);
    const progress = sceneIndex / (sceneDefinitions.length - 1);

    // Actual scene transition after fade
    setTimeout(() => {
      set({
        currentScene: sceneId,
        isTransitioning: false,
        progress,
      });
    }, 1500); // Halfway through audio crossfade
  },

  nextScene: () => {
    const { currentScene } = get();
    const currentIndex = sceneDefinitions.findIndex(s => s.id === currentScene);

    if (currentIndex < sceneDefinitions.length - 1) {
      const nextScene = sceneDefinitions[currentIndex + 1];
      get().setScene(nextScene.id);
    } else {
      console.log('💫 Journey complete');
    }
  },

  previousSceneAction: () => {
    const { currentScene } = get();
    const currentIndex = sceneDefinitions.findIndex(s => s.id === currentScene);

    if (currentIndex > 0) {
      const prevScene = sceneDefinitions[currentIndex - 1];
      get().setScene(prevScene.id);
    }
  },
}));

export default useSceneStore;
export { sceneDefinitions };
