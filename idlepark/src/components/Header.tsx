import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney, formatNumber } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';
import { TicketPriceModal } from './TicketPriceModal';
import { StatsPanel } from './StatsPanel';
import { UpgradesMenu } from './UpgradesMenu';

// Mini progress bar for needs
function NeedIndicator({
  emoji,
  value,
  label,
  capacity,
  guests,
}: {
  emoji: string;
  value: number;
  label: string;
  capacity: number;
  guests: number;
}) {
  const percent = Math.round(value * 100);
  const color = percent >= 80 ? 'bg-park-success' : percent >= 50 ? 'bg-park-warning' : 'bg-park-danger';
  const status = percent >= 80 ? 'Good' : percent >= 50 ? 'Strained' : 'Critical';
  const guestCount = Math.floor(guests);
  const tooltipText = capacity > 0 && guestCount > 0
    ? `${label}: ${status} (${capacity}/${guestCount})`
    : `${label}: ${status}`;

  return (
    <div className="flex flex-col items-center gap-0.5" title={tooltipText}>
      <span className="text-xs">{emoji}</span>
      <div className="w-6 h-1 bg-park-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

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

  const incomeColor = stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger';

  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-b from-park-card to-park-card/95 backdrop-blur-sm border-b border-park-accent/20 shadow-xl">
        {/* Top Section: Money & Actions */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            {/* Money Display */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  key={Math.floor(money / 1000)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold tracking-tight"
                >
                  {formatMoney(money)}
                </motion.div>
                <motion.div
                  key={stats.netIncome > 0 ? 'pos' : 'neg'}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-semibold ${incomeColor}`}
                >
                  {stats.netIncome >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(stats.netIncome))}/s
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpgrades(true)}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center text-lg shadow-lg"
              >
                🌟
              </motion.button>
              <SettingsMenu />
            </div>
          </div>
        </div>

        {/* Bottom Section: Stats Bar (clickable) */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowStats(true)}
          className="w-full px-4 pb-3 pt-1"
        >
          <div className="flex items-center justify-between bg-park-bg/50 rounded-xl px-3 py-2 border border-park-muted/20">
            {/* Left: Core Stats */}
            <div className="flex items-center gap-4">
              {/* Prestige */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-sm font-semibold text-park-accent">{formatNumber(stats.reputation)}</span>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👥</span>
                <span className="text-sm font-semibold">
                  {formatNumber(Math.floor(guests))}
                  <span className="text-park-muted text-xs">/{stats.maxGuests}</span>
                </span>
              </div>

              {/* Overall Happiness */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{getSatisfactionEmoji()}</span>
                <span className={`text-sm font-semibold ${
                  satisfactionPercent >= 80 ? 'text-park-success' :
                  satisfactionPercent >= 50 ? 'text-park-warning' : 'text-park-danger'
                }`}>
                  {satisfactionPercent}%
                </span>
              </div>
            </div>

            {/* Right: Need Indicators + Ticket */}
            <div className="flex items-center gap-3">
              {/* Mini Need Bars */}
              <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-park-muted/30">
                <NeedIndicator emoji="🎢" value={stats.entertainmentSatisfaction} label="Entertainment" capacity={stats.rideCapacity} guests={guests} />
                <NeedIndicator emoji="🍔" value={stats.hungerSatisfaction} label="Hunger" capacity={stats.totalHungerCapacity} guests={guests} />
                <NeedIndicator emoji="🚻" value={stats.comfortSatisfaction} label="Comfort" capacity={stats.totalComfortCapacity} guests={guests} />
                <NeedIndicator emoji="🛡️" value={stats.safetySatisfaction} label="Safety" capacity={stats.totalSafetyCapacity} guests={guests} />
              </div>

              {/* Ticket Price Button */}
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTicketModal(true);
                }}
                className="flex items-center gap-1.5 bg-park-accent/10 border border-park-accent/30 rounded-lg px-2.5 py-1.5"
              >
                <span className="text-base">🎟️</span>
                <span className="text-sm font-bold text-park-accent">{formatMoney(ticketPrice)}</span>
              </motion.div>
            </div>
          </div>
        </motion.button>
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
