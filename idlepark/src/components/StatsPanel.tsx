import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';

type Props = {
  onClose: () => void;
};

export function StatsPanel({ onClose }: Props) {
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);
  const ticketPrice = useGameStore((s) => s.ticketPrice);

  const stats = calculateParkStats();

  const getSatisfactionEmoji = (value: number) => {
    if (value >= 0.8) return '😊';
    if (value >= 0.5) return '😐';
    return '😟';
  };

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50 max-h-[80vh] overflow-auto"
      >
        <div className="p-4">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-6">Park Stats</h2>

          {/* Guests Section */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>👥</span> Guests
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-park-muted">Current</span>
                <span className="font-medium">{Math.floor(stats.currentGuests)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">Target (from reputation)</span>
                <span className="font-medium">{Math.floor(stats.targetGuests)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">Max capacity (slots)</span>
                <span className="font-medium">{stats.maxGuests}</span>
              </div>
            </div>
            {stats.reputation === 0 && (
              <p className="text-xs text-park-danger mt-3">
                No rides! Build rides to attract guests.
              </p>
            )}
          </div>

          {/* Reputation Section */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>⭐</span> Park Reputation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-park-muted">Total prestige</span>
                <span className="font-medium">{Math.floor(stats.reputation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">Ticket price</span>
                <span className="font-medium">{formatMoney(ticketPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">Demand at this price</span>
                <span className={`font-medium ${stats.demandMultiplier >= 0.7 ? 'text-park-success' : stats.demandMultiplier >= 0.4 ? 'text-yellow-500' : 'text-park-danger'}`}>
                  {formatPercent(stats.demandMultiplier)}
                </span>
              </div>
            </div>
            <p className="text-xs text-park-muted mt-3">
              Higher ticket price = more money per guest but fewer want to come
            </p>
          </div>

          {/* Satisfaction Section */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>{getSatisfactionEmoji(stats.overallSatisfaction)}</span> Satisfaction
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-park-muted">Ride queues</span>
                  <span className={`font-medium ${stats.rideSatisfaction >= 0.8 ? 'text-park-success' : stats.rideSatisfaction >= 0.5 ? 'text-yellow-500' : 'text-park-danger'}`}>
                    {formatPercent(stats.rideSatisfaction)}
                  </span>
                </div>
                <div className="text-xs text-park-muted">
                  Capacity: {Math.floor(stats.rideCapacity)} / Guests: {Math.floor(stats.currentGuests)}
                </div>
                {stats.rideSatisfaction < 1 && stats.currentGuests > 0 && (
                  <p className="text-xs text-park-danger mt-1">
                    Rides are overcrowded! Build more rides.
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-park-muted">Facilities</span>
                  <span className={`font-medium ${stats.facilitySatisfaction >= 0.8 ? 'text-park-success' : stats.facilitySatisfaction >= 0.5 ? 'text-yellow-500' : 'text-park-danger'}`}>
                    {formatPercent(stats.facilitySatisfaction)}
                  </span>
                </div>
                <div className="text-xs text-park-muted">
                  Coverage: {Math.floor(stats.infrastructureCoverage)} / Guests: {Math.floor(stats.currentGuests)}
                </div>
                {stats.facilitySatisfaction < 1 && stats.currentGuests > 0 && (
                  <p className="text-xs text-park-danger mt-1">
                    Not enough facilities! Build restrooms, benches, etc.
                  </p>
                )}
              </div>

              <div className="border-t border-park-muted/30 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Overall</span>
                  <span className={`font-bold ${stats.overallSatisfaction >= 0.8 ? 'text-park-success' : stats.overallSatisfaction >= 0.5 ? 'text-yellow-500' : 'text-park-danger'}`}>
                    {formatPercent(stats.overallSatisfaction)}
                  </span>
                </div>
              </div>
            </div>
            {stats.overallSatisfaction < 1 && (
              <p className="text-xs text-park-muted mt-3">
                Low satisfaction = guests leave faster = less income
              </p>
            )}
          </div>

          {/* Income Section */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>💰</span> Income
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-park-muted">From tickets</span>
                <span className="text-park-success font-medium">+{formatMoney(stats.ticketIncome)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">From shops</span>
                <span className="text-park-success font-medium">+{formatMoney(stats.shopIncome)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">Maintenance</span>
                <span className="text-park-danger font-medium">-{formatMoney(stats.totalMaintenance)}/s</span>
              </div>
              <div className="border-t border-park-muted/30 pt-2 flex justify-between">
                <span className="font-medium">Net income</span>
                <span className={`font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                  {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium bg-park-bg text-park-muted mb-4"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}
