import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { AttractionCard } from './components/AttractionCard';
import { BuildMenu } from './components/BuildMenu';
import { GameOverModal } from './components/GameOverModal';
import { OfflineModal } from './components/OfflineModal';
import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);

  const attractions = useGameStore((s) => s.attractions);
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

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {attractions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="text-6xl mb-4">🎡</div>
            <h2 className="text-xl font-bold mb-2">Welcome to Idlepark!</h2>
            <p className="text-park-muted mb-6">
              Build your first attraction to start earning money.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        )}
      </main>

      <BuildMenu />
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
