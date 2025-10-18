/**
 * PromisesChamber.v2.tsx
 * Golden sanctuary with floating promise cards
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import useSceneStore from '../core/SceneManager';
import promisesData from '../data/promises.json';
import '../styles/PromisesChamber.v2.css';

interface Promise {
  id: number;
  text: string;
  type: 'forever' | 'daily' | 'always';
}

const PromisesChamberV2 = () => {
  const [selectedPromise, setSelectedPromise] = useState<number | null>(null);
  const { nextScene } = useSceneStore();
  const promises: Promise[] = promisesData as Promise[];

  return (
    <div className="promises-v2-container">
      <motion.div
        className="promises-v2-glow"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="promises-v2-content">
        <motion.h2
          className="promises-v2-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          Sanctuary of Promises
        </motion.h2>

        <motion.p
          className="promises-v2-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 2 }}
        >
          Vows written in light, eternal and unbreakable
        </motion.p>

        <div className="promises-v2-grid">
          {promises.map((promise, index) => (
            <motion.div
              key={promise.id}
              className={`promise-v2-card ${promise.type} ${selectedPromise === index ? 'selected' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + index * 0.15, duration: 1 }}
              onClick={() => setSelectedPromise(index)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 203, 164, 0.6)' }}
            >
              <div className="promise-icon">{promise.type === 'forever' ? '∞' : promise.type === 'daily' ? '☀' : '★'}</div>
              <p className="promise-text">{promise.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          className="promises-v2-continue-btn"
          onClick={nextScene}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          Continue to Music
        </motion.button>
      </div>
    </div>
  );
};

export default PromisesChamberV2;
