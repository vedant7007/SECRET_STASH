/**
 * NarrativeBuffer.ts — PHASE 3.5: NARRATIVE BUFFER / FUTURE EXPANSION
 *
 * Abstraction layer for content insertion without refactoring
 * Allows future content packs (bonus scenes, memories, micro-moments)
 *
 * Philosophy: The story should grow, not be rebuilt.
 * Every addition should feel natural, not bolted on.
 */

import { EmotionalContent } from './ContentTypes';
import contentLoader from './ContentLoader';

/**
 * Content pack metadata
 */
export interface ContentPack {
  id: string;
  name: string;
  description: string;
  version: string;
  scenes: string[]; // Scene IDs this pack adds content to
  author?: string;
  createdAt?: string;
}

/**
 * Dynamic content source
 */
export interface ContentSource<T extends EmotionalContent> {
  id: string;
  type: 'json' | 'api' | 'inline';
  path?: string; // For JSON/API
  data?: T[]; // For inline
  priority: number; // Higher priority loads first
  enabled: boolean;
}

/**
 * Content registry for multi-source loading
 */
class NarrativeBufferRegistry {
  private sources: Map<string, ContentSource<any>[]> = new Map();
  private packs: Map<string, ContentPack> = new Map();
  private cache: Map<string, any[]> = new Map();

  /**
   * Register a content pack
   */
  registerPack(pack: ContentPack): void {
    this.packs.set(pack.id, pack);
    console.log(`[NarrativeBuffer] Registered pack: ${pack.name} (v${pack.version})`);
  }

  /**
   * Register a content source
   */
  registerSource<T extends EmotionalContent>(
    contentType: string,
    source: ContentSource<T>
  ): void {
    if (!this.sources.has(contentType)) {
      this.sources.set(contentType, []);
    }

    this.sources.get(contentType)!.push(source);

    // Sort by priority
    this.sources.get(contentType)!.sort((a, b) => b.priority - a.priority);

    console.log(`[NarrativeBuffer] Registered source: ${source.id} for ${contentType}`);
  }

  /**
   * Load content from all registered sources
   */
  async loadContent<T extends EmotionalContent>(contentType: string): Promise<T[]> {
    // Check cache
    if (this.cache.has(contentType)) {
      return this.cache.get(contentType)! as T[];
    }

    const sources = this.sources.get(contentType) || [];
    const enabledSources = sources.filter(s => s.enabled);

    if (enabledSources.length === 0) {
      console.warn(`[NarrativeBuffer] No enabled sources for ${contentType}`);
      return [];
    }

    // Load from all sources in parallel
    const results = await Promise.allSettled(
      enabledSources.map(source => this.loadFromSource<T>(source))
    );

    // Merge results
    const merged: T[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        merged.push(...result.value);
      } else {
        console.error(
          `[NarrativeBuffer] Failed to load from ${enabledSources[index].id}:`,
          result.reason
        );
      }
    });

    // Cache merged result
    this.cache.set(contentType, merged);

    console.log(`[NarrativeBuffer] Loaded ${merged.length} items for ${contentType}`);

    return merged;
  }

  /**
   * Load from a single source
   */
  private async loadFromSource<T extends EmotionalContent>(
    source: ContentSource<T>
  ): Promise<T[]> {
    switch (source.type) {
      case 'inline':
        return source.data || [];

      case 'json':
        if (!source.path) throw new Error('JSON source requires path');
        const response = await fetch(source.path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();

      case 'api':
        if (!source.path) throw new Error('API source requires path');
        const apiResponse = await fetch(source.path);
        if (!apiResponse.ok) throw new Error(`HTTP ${apiResponse.status}`);
        const data = await apiResponse.json();
        return data.items || data.content || data;

      default:
        throw new Error(`Unknown source type: ${source.type}`);
    }
  }

  /**
   * Enable/disable a source
   */
  setSourceEnabled(sourceId: string, enabled: boolean): void {
    for (const sources of this.sources.values()) {
      const source = sources.find(s => s.id === sourceId);
      if (source) {
        source.enabled = enabled;
        console.log(`[NarrativeBuffer] Source ${sourceId} ${enabled ? 'enabled' : 'disabled'}`);
      }
    }

    // Clear cache when sources change
    this.clearCache();
  }

  /**
   * Get all registered packs
   */
  getPacks(): ContentPack[] {
    return Array.from(this.packs.values());
  }

  /**
   * Get sources for a content type
   */
  getSources(contentType: string): ContentSource<any>[] {
    return this.sources.get(contentType) || [];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[NarrativeBuffer] Cache cleared');
  }

  /**
   * Hot reload a specific content type
   */
  async reloadContent<T extends EmotionalContent>(contentType: string): Promise<T[]> {
    this.cache.delete(contentType);
    return this.loadContent<T>(contentType);
  }
}

// Singleton instance
const narrativeBuffer = new NarrativeBufferRegistry();

/**
 * Register default sources (from existing JSON files)
 */
narrativeBuffer.registerSource('wishes', {
  id: 'core-wishes',
  type: 'json',
  path: '/src/data/wishes.json',
  priority: 100,
  enabled: true,
});

narrativeBuffer.registerSource('apologies', {
  id: 'core-apologies',
  type: 'json',
  path: '/src/data/apologies.json',
  priority: 100,
  enabled: true,
});

narrativeBuffer.registerSource('promises', {
  id: 'core-promises',
  type: 'json',
  path: '/src/data/promises.json',
  priority: 100,
  enabled: true,
});

narrativeBuffer.registerSource('songs', {
  id: 'core-songs',
  type: 'json',
  path: '/src/data/songs.json',
  priority: 100,
  enabled: true,
});

narrativeBuffer.registerSource('words', {
  id: 'core-words',
  type: 'json',
  path: '/src/data/words.json',
  priority: 100,
  enabled: true,
});

/**
 * Helper: Add inline content (for quick testing or user-generated content)
 */
export function addInlineContent<T extends EmotionalContent>(
  contentType: string,
  data: T[],
  sourceId?: string
): void {
  narrativeBuffer.registerSource(contentType, {
    id: sourceId || `inline-${Date.now()}`,
    type: 'inline',
    data,
    priority: 50, // Lower than core content
    enabled: true,
  });
}

/**
 * Helper: Add API-based content source
 */
export function addAPISource(
  contentType: string,
  apiUrl: string,
  sourceId?: string
): void {
  narrativeBuffer.registerSource(contentType, {
    id: sourceId || `api-${Date.now()}`,
    type: 'api',
    path: apiUrl,
    priority: 60,
    enabled: true,
  });
}

/**
 * Helper: Load content with buffer system
 */
export async function loadBufferedContent<T extends EmotionalContent>(
  contentType: string
): Promise<T[]> {
  return narrativeBuffer.loadContent<T>(contentType);
}

/**
 * Example: Install a bonus content pack
 */
export async function installContentPack(pack: ContentPack): Promise<void> {
  narrativeBuffer.registerPack(pack);

  // Future: Download and register pack's content sources
  console.log(`[NarrativeBuffer] Installed pack: ${pack.name}`);
}

/**
 * Example: Create a custom micro-moment
 */
export interface MicroMoment extends EmotionalContent {
  sceneId: string;
  trigger: 'time' | 'interaction' | 'progress';
  condition?: any;
}

export function addMicroMoment(moment: MicroMoment): void {
  addInlineContent('micro-moments', [moment], `micro-${moment.id}`);
  console.log(`[NarrativeBuffer] Added micro-moment: ${moment.text.substring(0, 30)}...`);
}

/**
 * Export singleton
 */
export default narrativeBuffer;

/**
 * React hook for buffered content loading
 */
import { useState, useEffect } from 'react';

export function useBufferedContent<T extends EmotionalContent>(contentType: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const content = await narrativeBuffer.loadContent<T>(contentType);
        if (!cancelled) {
          setData(content);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [contentType]);

  const reload = async () => {
    setIsLoading(true);
    const content = await narrativeBuffer.reloadContent<T>(contentType);
    setData(content);
    setIsLoading(false);
  };

  return {
    data,
    isLoading,
    error,
    reload,
  };
}
