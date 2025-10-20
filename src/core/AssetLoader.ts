/**
 * AssetLoader.ts — CINEMATIC REBUILD
 *
 * Smart asset prefetching and lazy loading
 * Ensures smooth scene transitions by preloading next scene assets
 *
 * Philosophy: Preparation is invisible care.
 * The next moment should arrive without hesitation.
 */

import * as THREE from 'three';

export type AssetType = 'image' | 'audio' | 'texture' | 'font' | 'video';

export interface AssetManifest {
  [sceneId: string]: {
    critical: Asset[]; // Must load before scene appears
    preload: Asset[]; // Load during previous scene
    lazy: Asset[]; // Load after scene appears
  };
}

export interface Asset {
  type: AssetType;
  url: string;
  id: string;
}

interface LoadedAsset {
  data: any;
  type: AssetType;
  timestamp: number;
}

export class AssetLoader {
  private cache: Map<string, LoadedAsset> = new Map();
  private loading: Map<string, Promise<any>> = new Map();
  private textureLoader: THREE.TextureLoader;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();

    // Initialize audio context if available
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Load a single asset
   */
  async loadAsset(asset: Asset): Promise<any> {
    // Check cache first
    if (this.cache.has(asset.id)) {
      const cached = this.cache.get(asset.id)!;
      console.log(`[AssetLoader] Cache hit: ${asset.id}`);
      return cached.data;
    }

    // Check if already loading
    if (this.loading.has(asset.id)) {
      console.log(`[AssetLoader] Already loading: ${asset.id}`);
      return this.loading.get(asset.id);
    }

    // Start loading
    console.log(`[AssetLoader] Loading: ${asset.id} (${asset.type})`);
    const loadPromise = this.loadByType(asset);
    this.loading.set(asset.id, loadPromise);

    try {
      const data = await loadPromise;

      // Cache the result
      this.cache.set(asset.id, {
        data,
        type: asset.type,
        timestamp: Date.now(),
      });

      this.loading.delete(asset.id);
      console.log(`[AssetLoader] Loaded: ${asset.id}`);

      return data;
    } catch (error) {
      this.loading.delete(asset.id);
      console.error(`[AssetLoader] Failed to load: ${asset.id}`, error);
      throw error;
    }
  }

  /**
   * Load asset based on type
   */
  private async loadByType(asset: Asset): Promise<any> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset.url);

      case 'texture':
        return this.loadTexture(asset.url);

      case 'audio':
        return this.loadAudio(asset.url);

      case 'font':
        return this.loadFont(asset.url);

      case 'video':
        return this.loadVideo(asset.url);

      default:
        throw new Error(`Unknown asset type: ${asset.type}`);
    }
  }

  /**
   * Load an image
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Load a Three.js texture
   */
  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Load audio file
   */
  private async loadAudio(url: string): Promise<AudioBuffer | HTMLAudioElement> {
    // If we have Web Audio API, use it for better control
    if (this.audioContext) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
      } catch (error) {
        console.warn('[AssetLoader] Web Audio API failed, falling back to HTMLAudioElement', error);
      }
    }

    // Fallback to HTML audio element
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = url;
      audio.load();
    });
  }

  /**
   * Load a font using CSS Font Loading API
   */
  private async loadFont(url: string): Promise<FontFace> {
    if (!('FontFace' in window)) {
      throw new Error('Font Loading API not supported');
    }

    const fontName = url.split('/').pop()?.split('.')[0] || 'CustomFont';
    const fontFace = new FontFace(fontName, `url(${url})`);

    await fontFace.load();
    document.fonts.add(fontFace);

    return fontFace;
  }

  /**
   * Load a video element
   */
  private loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.oncanplaythrough = () => resolve(video);
      video.onerror = reject;
      video.src = url;
      video.load();
    });
  }

  /**
   * Preload multiple assets in parallel
   */
  async preloadAssets(assets: Asset[]): Promise<void> {
    const promises = assets.map(asset =>
      this.loadAsset(asset).catch(error => {
        console.warn(`[AssetLoader] Failed to preload ${asset.id}, continuing anyway`, error);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`[AssetLoader] Preloaded ${assets.length} assets`);
  }

  /**
   * Get a cached asset
   */
  getAsset(id: string): any | null {
    const cached = this.cache.get(id);
    return cached ? cached.data : null;
  }

  /**
   * Check if an asset is loaded
   */
  isLoaded(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Clear old assets from cache (keep only recent ones)
   */
  clearOldCache(maxAge: number = 300000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((asset, id) => {
      if (now - asset.timestamp > maxAge) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => {
      const asset = this.cache.get(id);

      // Dispose Three.js textures
      if (asset && asset.type === 'texture' && asset.data.dispose) {
        asset.data.dispose();
      }

      this.cache.delete(id);
    });

    if (toDelete.length > 0) {
      console.log(`[AssetLoader] Cleared ${toDelete.length} old assets from cache`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      byType: this.getAssetsByType(),
    };
  }

  /**
   * Get breakdown of cached assets by type
   */
  private getAssetsByType(): Record<AssetType, number> {
    const breakdown: Record<string, number> = {};

    this.cache.forEach(asset => {
      breakdown[asset.type] = (breakdown[asset.type] || 0) + 1;
    });

    return breakdown as Record<AssetType, number>;
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    // Dispose Three.js textures
    this.cache.forEach(asset => {
      if (asset.type === 'texture' && asset.data.dispose) {
        asset.data.dispose();
      }
    });

    this.cache.clear();
    this.loading.clear();
    console.log('[AssetLoader] All cache cleared');
  }
}

// Singleton instance
const assetLoader = new AssetLoader();

export default assetLoader;
