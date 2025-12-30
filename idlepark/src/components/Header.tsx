import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney, formatNumber } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';
import { TicketPriceModal } from './TicketPriceModal';
import { StatsPanel } from './StatsPanel';
import { UpgradesMenu } from './UpgradesMenu';

export function Header() {
  const [showStats, setShowStats] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const ticketPrice = useGameStore((s) => s.ticketPrice);

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
      <header className="sticky top-0 z-10 bg-park-card border-b border-park-muted/30 shadow-lg px-4 py-2">
        {/* Top row: Money + Net income + Settings */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{formatMoney(money)}</span>
            <span className={`text-sm font-medium ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
              {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpgrades(true)}
              className="w-10 h-10 rounded-full bg-park-bg flex items-center justify-center text-xl active:bg-park-muted/30"
            >
              🌟
            </button>
            <SettingsMenu />
          </div>
        </div>

        {/* Bottom row: All stats in a compact line */}
        <button
          onClick={() => setShowStats(true)}
          className="w-full flex items-center justify-between text-sm active:bg-park-muted/10 rounded-lg py-1"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-medium">{formatNumber(stats.reputation)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span className="font-medium">{formatNumber(Math.floor(guests))}/{formatNumber(stats.maxGuests)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{getSatisfactionEmoji()}</span>
              <span className={`font-medium ${
                satisfactionPercent >= 80 ? 'text-park-success' :
                satisfactionPercent >= 50 ? 'text-park-text' : 'text-park-danger'
              }`}>{satisfactionPercent}%</span>
            </span>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowTicketModal(true);
            }}
            className="flex items-center gap-1.5 bg-park-bg rounded-lg px-3 py-1.5 active:bg-park-muted/30"
          >
            <span className="text-lg">🎟️</span>
            <span className="font-semibold">{formatMoney(ticketPrice)}</span>
          </div>
        </button>
      </header>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      </AnimatePresence>

      {/* Ticket Price Modal */}
      <AnimatePresence>
        {showTicketModal && <TicketPriceModal onClose={() => setShowTicketModal(false)} />}
      </AnimatePresence>

      {/* Upgrades Menu */}
      <AnimatePresence>
        {showUpgrades && <UpgradesMenu onClose={() => setShowUpgrades(false)} />}
      </AnimatePresence>
    </>
  );
}
