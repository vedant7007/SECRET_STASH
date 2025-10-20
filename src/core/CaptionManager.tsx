/**
 * CaptionManager.tsx
 *
 * Accessible caption/subtitle system for audio voiceovers
 * Ensures the experience is inclusive for deaf and hard-of-hearing users
 *
 * Philosophy: Every word should be felt, whether heard or read.
 */

import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import useSettingsStore from './SettingsManager';

export interface Caption {
  id: string;
  text: string;
  duration: number; // milliseconds
  speaker?: string; // e.g., "Vedant" or "Narrator"
}

interface CaptionStore {
  currentCaption: Caption | null;
  queue: Caption[];

  showCaption: (caption: Caption) => void;
  clearCaption: () => void;
  queueCaptions: (captions: Caption[]) => void;
}

const useCaptionStore = create<CaptionStore>((set, get) => ({
  currentCaption: null,
  queue: [],

  showCaption: (caption: Caption) => {
    set({ currentCaption: caption });

    // Auto-clear after duration
    setTimeout(() => {
      if (get().currentCaption?.id === caption.id) {
        const queue = get().queue;
        if (queue.length > 0) {
          // Show next caption in queue
          const next = queue[0];
          set({
            currentCaption: next,
            queue: queue.slice(1),
          });
        } else {
          set({ currentCaption: null });
        }
      }
    }, caption.duration);
  },

  clearCaption: () => {
    set({ currentCaption: null, queue: [] });
  },

  queueCaptions: (captions: Caption[]) => {
    if (captions.length === 0) return;

    const [first, ...rest] = captions;
    get().showCaption(first);
    set({ queue: rest });
  },
}));

// Caption display component
export const CaptionDisplay = () => {
  const { currentCaption } = useCaptionStore();
  const { accessibility } = useSettingsStore();

  if (!accessibility.enableCaptions || !currentCaption) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        pointerEvents: 'none',
        width: '90%',
        maxWidth: '800px',
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {currentCaption && (
          <motion.div
            key={currentCaption.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(14, 0, 26, 0.95)',
              border: '1px solid rgba(255, 182, 193, 0.3)',
              borderRadius: '12px',
              padding: '16px 24px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            {currentCaption.speaker && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#FFB6C1',
                  marginBottom: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {currentCaption.speaker}
              </div>
            )}
            <div
              style={{
                fontSize: '18px',
                color: '#F0F0F0', // Off-white for better contrast
                lineHeight: '1.6',
                fontWeight: 400,
              }}
            >
              {currentCaption.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to create caption from audio
export function createCaption(
  id: string,
  text: string,
  duration: number,
  speaker?: string
): Caption {
  return { id, text, duration, speaker };
}

export default useCaptionStore;
