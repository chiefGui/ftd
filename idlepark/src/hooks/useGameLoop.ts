import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { TICK_RATE, AUTO_SAVE_INTERVAL } from '../data/constants';

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const save = useGameStore((s) => s.save);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const lastTickRef = useRef(Date.now());

  // Game tick loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      tick(deltaSeconds);
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [tick, isGameOver]);

  // Auto-save loop
  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [save]);

  // Save on visibility change (when app goes to background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        save();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [save]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      save();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);
}
