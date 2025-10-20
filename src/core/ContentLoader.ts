/**
 * ContentLoader.ts — PHASE 3: EMOTIONAL INTEGRATION
 *
 * Dynamic JSON content loader with caching and validation
 * Fetches emotional content from /src/data/ and transforms it for scenes
 *
 * Philosophy: Content is the soul. The loader is the bridge
 * between written emotion and rendered experience.
 */

import {
  Wish,
  Apology,
  Promise,
  Song,
  Word,
  ContentLoadResult,
  EmotionalContent,
} from './ContentTypes';

class ContentLoader {
  private cache: Map<string, any> = new Map();
  private loading: Map<string, Promise<any>> = new Map();

  /**
   * Load wishes from wishes.json
   */
  async loadWishes(): Promise<ContentLoadResult<Wish>> {
    return this.loadJSON<Wish>('/src/data/wishes.json', 'wishes');
  }

  /**
   * Load apologies from apologies.json
   */
  async loadApologies(): Promise<ContentLoadResult<Apology>> {
    return this.loadJSON<Apology>('/src/data/apologies.json', 'apologies');
  }

  /**
   * Load promises from promises.json
   */
  async loadPromises(): Promise<ContentLoadResult<Promise>> {
    return this.loadJSON<Promise>('/src/data/promises.json', 'promises');
  }

  /**
   * Load songs from songs.json
   */
  async loadSongs(): Promise<ContentLoadResult<Song>> {
    return this.loadJSON<Song>('/src/data/songs.json', 'songs');
  }

  /**
   * Load words from words.json
   */
  async loadWords(): Promise<ContentLoadResult<Word>> {
    return this.loadJSON<Word>('/src/data/words.json', 'words');
  }

  /**
   * Generic JSON loader with caching and validation
   */
  private async loadJSON<T extends EmotionalContent>(
    path: string,
    cacheKey: string
  ): Promise<ContentLoadResult<T>> {
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      console.log(`[ContentLoader] Cache hit: ${cacheKey}`);
      return {
        data: cached,
        count: cached.length,
        loaded: true,
      };
    }

    // Check if already loading
    if (this.loading.has(cacheKey)) {
      console.log(`[ContentLoader] Already loading: ${cacheKey}`);
      const data = await this.loading.get(cacheKey);
      return {
        data,
        count: data.length,
        loaded: true,
      };
    }

    // Start loading
    console.log(`[ContentLoader] Loading: ${cacheKey} from ${path}`);
    const loadPromise = this.fetchAndValidate<T>(path, cacheKey);
    this.loading.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;

      // Cache the result
      this.cache.set(cacheKey, data);
      this.loading.delete(cacheKey);

      console.log(`[ContentLoader] Loaded: ${cacheKey} (${data.length} items)`);

      return {
        data,
        count: data.length,
        loaded: true,
      };
    } catch (error) {
      this.loading.delete(cacheKey);
      console.error(`[ContentLoader] Failed to load ${cacheKey}:`, error);

      return {
        data: [],
        count: 0,
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch JSON and validate structure
   */
  private async fetchAndValidate<T>(path: string, type: string): Promise<T[]> {
    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      // Validate structure
      if (!Array.isArray(json)) {
        throw new Error(`Expected array, got ${typeof json}`);
      }

      // Basic validation: ensure each item has required fields
      const validated = json.map((item, index) => {
        if (!item.id) {
          console.warn(`[ContentLoader] Item ${index} missing 'id', using index`);
          item.id = index;
        }
        if (!item.text) {
          console.warn(`[ContentLoader] Item ${item.id} missing 'text'`);
        }
        if (!item.emotion) {
          console.warn(`[ContentLoader] Item ${item.id} missing 'emotion', defaulting to 'wonder'`);
          item.emotion = 'wonder';
        }
        if (!item.effect) {
          console.warn(`[ContentLoader] Item ${item.id} missing 'effect', defaulting to 'fade'`);
          item.effect = 'fade';
        }

        return item as T;
      });

      return validated;
    } catch (error) {
      console.error(`[ContentLoader] Fetch error for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Preload all content for smooth transitions
   */
  async preloadAll(): Promise<void> {
    console.log('[ContentLoader] Preloading all content...');

    await Promise.allSettled([
      this.loadWishes(),
      this.loadApologies(),
      this.loadPromises(),
      this.loadSongs(),
      this.loadWords(),
    ]);

    console.log('[ContentLoader] Preload complete');
  }

  /**
   * Filter content by emotion
   */
  filterByEmotion<T extends EmotionalContent>(items: T[], emotion: string): T[] {
    return items.filter(item => item.emotion.toLowerCase() === emotion.toLowerCase());
  }

  /**
   * Filter content by theme
   */
  filterByTheme<T extends Word>(items: T[], theme: string): T[] {
    return items.filter(item => item.theme?.toLowerCase() === theme.toLowerCase());
  }

  /**
   * Get random item from array
   */
  getRandomItem<T>(items: T[]): T | null {
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Get random items (no duplicates)
   */
  getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, items.length));
  }

  /**
   * Clear cache (useful for hot reloading during development)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ContentLoader] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loading.keys()),
      size: this.cache.size,
    };
  }
}

// Singleton instance
const contentLoader = new ContentLoader();

export default contentLoader;

/**
 * React hook for loading content
 */
export function useContent<T extends EmotionalContent>(
  loader: () => Promise<ContentLoadResult<T>>
): ContentLoadResult<T> & { isLoading: boolean; reload: () => void } {
  const [result, setResult] = React.useState<ContentLoadResult<T>>({
    data: [],
    count: 0,
    loaded: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    const loaded = await loader();
    setResult(loaded);
    setIsLoading(false);
  }, [loader]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    ...result,
    isLoading,
    reload: load,
  };
}

// React import for hook
import React from 'react';

/**
 * Specialized hooks for each content type
 */
export function useWishes() {
  return useContent(() => contentLoader.loadWishes());
}

export function useApologies() {
  return useContent(() => contentLoader.loadApologies());
}

export function usePromises() {
  return useContent(() => contentLoader.loadPromises());
}

export function useSongs() {
  return useContent(() => contentLoader.loadSongs());
}

export function useWords() {
  return useContent(() => contentLoader.loadWords());
}
