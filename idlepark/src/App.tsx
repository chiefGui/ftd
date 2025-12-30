import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { NotificationBubble } from './components/NotificationBubble';
import { SlotGrid } from './components/SlotGrid';
import { GameOverModal } from './components/GameOverModal';
import { OfflineModal } from './components/OfflineModal';
import { MilestoneUnlockModal } from './components/MilestoneUnlockModal';
import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { useNotifications } from './hooks/useNotifications';
import { useMilestoneStore } from './store/milestoneStore';
import type { Milestone } from './core/types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [offlineData, setOfflineData] = useState<{
    earnings: number;
    milestones: Milestone[];
  } | null>(null);

  const load = useGameStore((s) => s.load);
  const applyOfflineProgress = useGameStore((s) => s.applyOfflineProgress);
  const clearPendingUnlocks = useMilestoneStore((s) => s.clearPendingUnlocks);

  // Load saved game on mount
  useEffect(() => {
    const init = async () => {
      await load();
      // Clear any pending unlocks from previous session before applying offline progress
      clearPendingUnlocks();
      const result = applyOfflineProgress();
      if (Math.abs(result.earnings) > 1 || result.milestones.length > 0) {
        setOfflineData(result);
      }
      setIsLoading(false);
    };
    init();
  }, [load, applyOfflineProgress, clearPendingUnlocks]);

  // Start game loop
  useGameLoop();

  // Start notification system
  useNotifications();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-park-bg">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎢</div>
          <div className="text-park-muted">Loading your park...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-park-bg">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <SlotGrid />
      </main>

      {/* Floating notification bubble */}
      <NotificationBubble />

      <GameOverModal />

      {/* Milestone unlock modal (real-time) */}
      <MilestoneUnlockModal />

      {/* Offline progress modal */}
      <AnimatePresence>
        {offlineData !== null && (
          <OfflineModal
            earnings={offlineData.earnings}
            milestones={offlineData.milestones}
            onClose={() => setOfflineData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
