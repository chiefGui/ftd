import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { NotificationBubble } from './components/NotificationBubble';
import { SlotGrid } from './components/SlotGrid';
import { GameOverModal } from './components/GameOverModal';
import { OfflineModal } from './components/OfflineModal';
import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);

  const load = useGameStore((s) => s.load);
  const applyOfflineProgress = useGameStore((s) => s.applyOfflineProgress);

  // Load saved game on mount
  useEffect(() => {
    const init = async () => {
      await load();
      const earnings = applyOfflineProgress();
      if (Math.abs(earnings) > 1) {
        setOfflineEarnings(earnings);
      }
      setIsLoading(false);
    };
    init();
  }, [load, applyOfflineProgress]);

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

      <AnimatePresence>
        {offlineEarnings !== null && (
          <OfflineModal
            earnings={offlineEarnings}
            onClose={() => setOfflineEarnings(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
