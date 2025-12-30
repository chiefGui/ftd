import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';
import { TicketControl } from './TicketControl';
import { StatsPanel } from './StatsPanel';

export function Header() {
  const [showStats, setShowStats] = useState(false);

  const money = useGameStore((s) => s.money);
  const guests = useGameStore((s) => s.guests);
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);

  const stats = calculateParkStats();
  const satisfactionPercent = Math.round(stats.overallSatisfaction * 100);

  const getSatisfactionEmoji = () => {
    if (satisfactionPercent >= 80) return '😊';
    if (satisfactionPercent >= 50) return '😐';
    return '😟';
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-park-card border-b border-park-muted/30 shadow-lg">
        {/* Stats row - all balanced */}
        <button
          onClick={() => setShowStats(true)}
          className="w-full px-4 py-3 active:bg-park-muted/10"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Money */}
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-park-text">{formatMoney(money)}</span>
              <span className={`text-xs font-medium ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
              </span>
            </div>

            {/* Prestige */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span className="font-semibold">{stats.reputation}</span>
              </div>
              <span className="text-xs text-park-muted">prestige</span>
            </div>

            {/* Guests */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span className="font-semibold">{Math.floor(guests)}</span>
              </div>
              <span className="text-xs text-park-muted">of {stats.maxGuests}</span>
            </div>

            {/* Satisfaction */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span>{getSatisfactionEmoji()}</span>
                <span className={`font-semibold ${
                  satisfactionPercent >= 80 ? 'text-park-success' :
                  satisfactionPercent >= 50 ? 'text-park-text' : 'text-park-danger'
                }`}>
                  {satisfactionPercent}%
                </span>
              </div>
              <span className="text-xs text-park-muted">happy</span>
            </div>

            {/* Settings */}
            <div onClick={(e) => e.stopPropagation()}>
              <SettingsMenu />
            </div>
          </div>

          {/* Ticket control row */}
          <div className="mt-2 pt-2 border-t border-park-muted/20" onClick={(e) => e.stopPropagation()}>
            <TicketControl />
          </div>
        </button>
      </header>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      </AnimatePresence>
    </>
  );
}
