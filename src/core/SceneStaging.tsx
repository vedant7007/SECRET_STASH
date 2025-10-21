/**
 * SceneStaging.tsx — PHASE 3.5: SCENE-SPECIFIC STAGING HOOKS
 *
 * React hooks that implement narrative staging for each scene
 * Controls the flow: entry → dwell → exit
 *
 * Philosophy: Each scene is a stage.
 * Content enters like actors, dwells like presence, exits like memory.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Wish, Apology, Promise, Song, Word } from './ContentTypes';
import { NarrativeStager, WaveStager, StagedItem, parsePacingMode, PACING_PRESETS } from './NarrativeStaging';
import { getEmotionTransition } from './EmotionTransitions';

/**
 * Galaxy of Wishes Staging Hook
 * One wish at a time, with emotional pauses
 */
export function useWishStaging(wishes: Wish[]) {
  const [currentWish, setCurrentWish] = useState<Wish | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const stagerRef = useRef<NarrativeStager<Wish> | null>(null);

  useEffect(() => {
    if (wishes.length === 0) return;

    const stager = new NarrativeStager(wishes);
    stagerRef.current = stager;

    // Listen to staging events
    stager.on('enter', (staged) => {
      setCurrentWish(staged.item);
      setIsRevealing(true);
    });

    stager.on('dwell', (staged) => {
      setIsRevealing(false);
    });

    stager.on('exit', (staged) => {
      setCompletedCount(prev => prev + 1);
    });

    stager.on('complete', () => {
      setCurrentWish(null);
    });

    // Start automatically
    stager.start();

    return () => {
      stager.dispose();
    };
  }, [wishes]);

  const skipToNext = useCallback(() => {
    stagerRef.current?.skipToNext();
  }, []);

  const pause = useCallback(() => {
    stagerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    stagerRef.current?.resume();
  }, []);

  return {
    currentWish,
    isRevealing,
    completedCount,
    totalCount: wishes.length,
    progress: wishes.length > 0 ? completedCount / wishes.length : 0,
    skipToNext,
    pause,
    resume,
  };
}

/**
 * Apology Garden Staging Hook
 * Soft petal fade entry before text appears
 */
export function useApologyStaging(apologies: Apology[]) {
  const [currentApology, setCurrentApology] = useState<Apology | null>(null);
  const [petalCount, setPetalCount] = useState(0);
  const [rainIntensity, setRainIntensity] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (apologies.length === 0 || currentIndex >= apologies.length) return;

    const apology = apologies[currentIndex];
    setCurrentApology(apology);

    // Stage 1: Petal/rain environment setup (500ms)
    setPetalCount(apology.petal_count || 15);
    setRainIntensity(apology.rain_intensity || 0.3);
    setIsTextVisible(false);

    // Stage 2: Text reveal (after environment settles)
    const textTimer = setTimeout(() => {
      setIsTextVisible(true);
    }, 800);

    // Stage 3: Auto-advance after pause duration
    const advanceTimer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, (apology.pause_duration || 3000) + 800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(advanceTimer);
    };
  }, [apologies, currentIndex]);

  const skipToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, apologies.length - 1));
  }, [apologies.length]);

  return {
    currentApology,
    petalCount,
    rainIntensity,
    isTextVisible,
    currentIndex,
    totalCount: apologies.length,
    isComplete: currentIndex >= apologies.length,
    skipToNext,
  };
}

/**
 * Promises Chamber Staging Hook
 * Orb glow buildup before text reveal
 */
export function usePromiseStaging(promises: Promise[]) {
  const [visiblePromises, setVisiblePromises] = useState<Set<number>>(new Set());
  const [revealedPromises, setRevealedPromises] = useState<Set<number>>(new Set());
  const [glowingOrb, setGlowingOrb] = useState<number | null>(null);

  useEffect(() => {
    if (promises.length === 0) return;

    // Progressive orb appearance (cascade)
    promises.forEach((promise, index) => {
      setTimeout(() => {
        setVisiblePromises(prev => new Set([...prev, index]));
      }, index * 600);
    });
  }, [promises]);

  const revealPromise = useCallback((index: number) => {
    const promise = promises[index];
    if (!promise) return;

    // Glow buildup phase
    setGlowingOrb(index);

    // Text reveal after delay
    setTimeout(() => {
      setRevealedPromises(prev => new Set([...prev, index]));
      setGlowingOrb(null);
    }, promise.reveal_delay || 1000);
  }, [promises]);

  return {
    promises,
    visiblePromises,
    revealedPromises,
    glowingOrb,
    revealPromise,
    allRevealed: revealedPromises.size === promises.length,
  };
}

/**
 * Melody Sphere Staging Hook
 * Song intro stages emotionally before lyrics begin
 */
export function useSongStaging(songs: Song[]) {
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [currentLyric, setCurrentLyric] = useState<any>(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = useCallback((song: Song) => {
    // Stage 1: Emotional intro (sphere animation, no lyrics)
    setActiveSong(song);
    setIsIntroPlaying(true);
    setCurrentLyric(null);

    const transition = getEmotionTransition(song.emotion);

    // Stage 2: Audio begins after emotional intro
    setTimeout(() => {
      setIsIntroPlaying(false);

      if (song.audio_file) {
        const audio = new Audio(song.audio_file);
        audioRef.current = audio;

        audio.addEventListener('timeupdate', () => {
          setAudioTime(audio.currentTime);

          // Find current lyric
          const lyric = song.lyrics.find(
            (l, i) => l.time <= audio.currentTime &&
                      (!song.lyrics[i + 1] || song.lyrics[i + 1].time > audio.currentTime)
          );

          setCurrentLyric(lyric || null);
        });

        audio.play();
      }
    }, transition.duration * 1000);
  }, []);

  const stopSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSong(null);
    setCurrentLyric(null);
    setIsIntroPlaying(false);
    setAudioTime(0);
  }, []);

  useEffect(() => {
    return () => {
      stopSong();
    };
  }, [stopSong]);

  return {
    songs,
    activeSong,
    currentLyric,
    isIntroPlaying,
    audioTime,
    playSong,
    stopSong,
  };
}

/**
 * Word Constellation Staging Hook
 * Category waves with grouped reveal (emotional horizon effect)
 */
export function useWordConstellationStaging(words: Word[], categories: string[]) {
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set());
  const [visibleWords, setVisibleWords] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const stagerRef = useRef<WaveStager<Word> | null>(null);

  useEffect(() => {
    if (words.length === 0 || categories.length === 0) return;

    const stager = new WaveStager(words, {
      categories,
      waveDelay: 3000,
      itemDelay: 300,
    });

    stagerRef.current = stager;

    // Listen to wave events
    stager.on('wave-start', (items, category) => {
      setActiveCategory(category);
      setVisibleCategories(prev => new Set([...prev, category]));

      // Reveal words in this wave
      items.forEach((word, index) => {
        setTimeout(() => {
          setVisibleWords(prev => new Set([...prev, word.id as number]));
        }, index * 300);
      });
    });

    stager.on('complete', () => {
      setActiveCategory(null);
    });

    stager.start();

    return () => {
      stager.dispose();
    };
  }, [words, categories]);

  const filterWordsByCategory = useCallback((category: string) => {
    return words.filter(w => w.category === category);
  }, [words]);

  return {
    words,
    visibleCategories,
    visibleWords,
    activeCategory,
    filterWordsByCategory,
    isComplete: visibleCategories.size === categories.length,
  };
}

/**
 * Generic content stager hook
 * For custom scenes or future expansion
 */
export function useContentStaging<T extends { id: number | string; timing?: string | number }>(
  content: T[],
  options?: {
    autoStart?: boolean;
    onEnter?: (item: T) => void;
    onExit?: (item: T) => void;
  }
) {
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const stagerRef = useRef<NarrativeStager<T> | null>(null);

  useEffect(() => {
    if (content.length === 0) return;

    const stager = new NarrativeStager(content as any);
    stagerRef.current = stager as any;

    stager.on('enter', (staged) => {
      setCurrentItem(staged.item);
      setVisibleItems(prev => [...prev, staged.item]);
      options?.onEnter?.(staged.item);
    });

    stager.on('exit', (staged) => {
      setVisibleItems(prev => prev.filter(i => i.id !== staged.item.id));
      setCurrentIndex(prev => prev + 1);
      options?.onExit?.(staged.item);
    });

    if (options?.autoStart !== false) {
      stager.start();
    }

    return () => {
      stager.dispose();
    };
  }, [content, options]);

  const start = useCallback(() => {
    stagerRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    stagerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    stagerRef.current?.resume();
  }, []);

  const skip = useCallback(() => {
    stagerRef.current?.skipToNext();
  }, []);

  return {
    currentItem,
    visibleItems,
    currentIndex,
    totalCount: content.length,
    progress: content.length > 0 ? currentIndex / content.length : 0,
    start,
    pause,
    resume,
    skip,
  };
}

export default {
  useWishStaging,
  useApologyStaging,
  usePromiseStaging,
  useSongStaging,
  useWordConstellationStaging,
  useContentStaging,
};
