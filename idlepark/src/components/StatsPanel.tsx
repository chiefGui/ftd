import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getBuildingById } from '../data/buildings';
import { formatMoney } from '../utils/formatters';

type Props = {
  onClose: () => void;
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  const percent = Math.min(100, Math.round(value * 100));
  return (
    <div className="h-2 bg-park-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function StatusBadge({ good, text }: { good: boolean; text: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      good ? 'bg-park-success/20 text-park-success' : 'bg-park-danger/20 text-park-danger'
    }`}>
      {text}
    </span>
  );
}

export function StatsPanel({ onClose }: Props) {
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const slots = useGameStore((s) => s.slots);

  const stats = calculateParkStats();

  // Determine what the player should do next
  const getAdvice = () => {
    if (stats.reputation === 0) {
      return { emoji: '🎢', text: 'Build a ride to attract guests!' };
    }
    if (stats.rideSatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🎢', text: 'Rides are overcrowded. Build more rides!' };
    }
    if (stats.facilitySatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🚻', text: 'Guests need facilities. Add restrooms or benches!' };
    }
    if (stats.shopIncome === 0 && stats.currentGuests > 10) {
      return { emoji: '🛒', text: 'Build shops to earn money from guests!' };
    }
    if (stats.overallSatisfaction >= 0.8 && stats.currentGuests >= stats.maxGuests * 0.8) {
      return { emoji: '🔓', text: 'Park is almost full! Unlock more slots.' };
    }
    if (stats.netIncome < 0) {
      return { emoji: '⚠️', text: 'Losing money! Lower ticket price or build more.' };
    }
    return { emoji: '✨', text: 'Park is running great!' };
  };

  const advice = getAdvice();
  const hasRides = slots.some(s => {
    const b = getBuildingById(s.buildingId);
    return b?.category === 'ride';
  });

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
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50 max-h-[85vh] overflow-auto"
      >
        <div className="p-4">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-4" />

          {/* Advice Banner */}
          <div className="bg-park-accent/10 border border-park-accent/30 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{advice.emoji}</span>
              <p className="font-medium text-park-text">{advice.text}</p>
            </div>
          </div>

          {/* Prestige / Reputation */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">⭐ Prestige</span>
              <span className="text-2xl font-bold text-park-accent">{stats.reputation}</span>
            </div>
            <p className="text-sm text-park-muted">
              Your park's fame. Higher prestige attracts more guests.
            </p>
            {stats.reputation > 0 && (
              <p className="text-xs text-park-muted mt-2">
                💡 Upgrade rides to increase their prestige
              </p>
            )}
            {stats.reputation === 0 && (
              <p className="text-sm text-park-danger mt-2">
                Build rides to gain prestige!
              </p>
            )}
          </div>

          {/* Guest Count - Simple */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">👥 Guests</span>
              <span className="text-2xl font-bold">{Math.floor(stats.currentGuests)}</span>
            </div>
            <p className="text-sm text-park-muted mb-3">
              Visitors in your park. More guests = more income.
            </p>
            <ProgressBar
              value={stats.maxGuests > 0 ? stats.currentGuests / stats.maxGuests : 0}
              color="bg-park-accent"
            />
            <div className="flex justify-between text-xs text-park-muted mt-2">
              <span>0</span>
              <span>Capacity: {stats.maxGuests}</span>
            </div>
            {!hasRides && (
              <p className="text-sm text-park-danger mt-3">
                No rides = no guests coming
              </p>
            )}
          </div>

          {/* Happiness - Two bars */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">
                {stats.overallSatisfaction >= 0.8 ? '😊' : stats.overallSatisfaction >= 0.5 ? '😐' : '😟'} Happiness
              </span>
              <StatusBadge
                good={stats.overallSatisfaction >= 0.8}
                text={stats.overallSatisfaction >= 0.8 ? 'Happy' : stats.overallSatisfaction >= 0.5 ? 'Okay' : 'Unhappy'}
              />
            </div>
            <p className="text-sm text-park-muted mb-4">
              How guests feel. Happy guests stay longer!
            </p>

            {/* Rides */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>🎢 Ride queues</span>
                <span className={stats.rideSatisfaction >= 0.8 ? 'text-park-success' : stats.rideSatisfaction >= 0.5 ? 'text-yellow-500' : 'text-park-danger'}>
                  {stats.rideSatisfaction >= 1 ? 'Short' : stats.rideSatisfaction >= 0.5 ? 'Medium' : 'Long!'}
                </span>
              </div>
              <ProgressBar
                value={stats.rideSatisfaction}
                color={stats.rideSatisfaction >= 0.8 ? 'bg-park-success' : stats.rideSatisfaction >= 0.5 ? 'bg-yellow-500' : 'bg-park-danger'}
              />
              {stats.rideSatisfaction < 0.8 && stats.currentGuests > 0 && (
                <p className="text-xs text-park-muted mt-1">
                  Need more ride capacity for {Math.floor(stats.currentGuests)} guests
                </p>
              )}
            </div>

            {/* Facilities */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🚻 Facilities</span>
                <span className={stats.facilitySatisfaction >= 0.8 ? 'text-park-success' : stats.facilitySatisfaction >= 0.5 ? 'text-yellow-500' : 'text-park-danger'}>
                  {stats.facilitySatisfaction >= 1 ? 'Plenty' : stats.facilitySatisfaction >= 0.5 ? 'Some' : 'Not enough!'}
                </span>
              </div>
              <ProgressBar
                value={stats.facilitySatisfaction}
                color={stats.facilitySatisfaction >= 0.8 ? 'bg-park-success' : stats.facilitySatisfaction >= 0.5 ? 'bg-yellow-500' : 'bg-park-danger'}
              />
              {stats.facilitySatisfaction < 0.8 && stats.currentGuests > 0 && (
                <p className="text-xs text-park-muted mt-1">
                  Guests need restrooms, benches, trash cans
                </p>
              )}
            </div>

            {stats.overallSatisfaction < 0.8 && (
              <p className="text-sm text-park-danger mt-4 text-center">
                Unhappy guests leave faster!
              </p>
            )}
          </div>

          {/* Money - Simple */}
          <div className="bg-park-bg rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">💰 Money</span>
              <span className={`text-xl font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
              </span>
            </div>
            <p className="text-sm text-park-muted mb-3">
              Income per second after costs.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-park-muted">🎟️ Tickets ({formatMoney(ticketPrice)} each)</span>
                <span className="text-park-success">+{formatMoney(stats.ticketIncome)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">🛒 Shop sales</span>
                <span className="text-park-success">+{formatMoney(stats.shopIncome)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-park-muted">🔧 Running costs</span>
                <span className="text-park-danger">-{formatMoney(stats.totalMaintenance)}/s</span>
              </div>
            </div>

            {stats.shopIncome === 0 && stats.currentGuests > 0 && (
              <p className="text-xs text-park-muted mt-3 text-center">
                Build shops to earn from your guests!
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium bg-park-accent text-white"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </>
  );
}
