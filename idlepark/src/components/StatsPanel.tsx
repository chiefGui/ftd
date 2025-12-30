import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useMilestoneStore } from '../store/milestoneStore';
import { formatMoney } from '../utils/formatters';
import { MILESTONES } from '../data/milestones';

type Props = {
  onClose: () => void;
};

// Animated circular progress
function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  color,
  bgColor = 'stroke-park-muted/20',
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={bgColor}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
}

// Need card component
function NeedCard({
  emoji,
  name,
  value,
  capacity,
  guests,
  tip,
}: {
  emoji: string;
  name: string;
  value: number;
  capacity: number;
  guests: number;
  tip: string;
}) {
  const percent = Math.round(value * 100);
  const status = percent >= 80 ? 'good' : percent >= 50 ? 'warning' : 'critical';
  const colors = {
    good: { bg: 'bg-park-success/10', border: 'border-park-success/30', text: 'text-park-success', stroke: 'stroke-park-success' },
    warning: { bg: 'bg-park-warning/10', border: 'border-park-warning/30', text: 'text-park-warning', stroke: 'stroke-park-warning' },
    critical: { bg: 'bg-park-danger/10', border: 'border-park-danger/30', text: 'text-park-danger', stroke: 'stroke-park-danger' },
  };
  const c = colors[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${c.bg} ${c.border} border rounded-xl p-3`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <CircularProgress value={value} size={56} strokeWidth={5} color={c.stroke} />
          <span className="absolute text-xl">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-semibold text-sm">{name}</span>
            <span className={`text-lg font-bold ${c.text}`}>{percent}%</span>
          </div>
          <div className="text-xs text-park-muted">
            {capacity > 0 ? `${capacity} capacity for ${Math.floor(guests)} guests` : tip}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat row component
function StatRow({
  label,
  value,
  valueColor = 'text-park-text',
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-park-muted/10 last:border-0">
      <span className="text-sm text-park-muted flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}

export function StatsPanel({ onClose }: Props) {
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const guests = useGameStore((s) => s.guests);

  const completedMilestones = useMilestoneStore((s) => s.completedMilestones);
  const peakGuests = useMilestoneStore((s) => s.peakGuests);

  const stats = calculateParkStats();

  // Get next milestone
  const nextMilestone = MILESTONES.find((m) => !completedMilestones.includes(m.id));
  const nextMilestoneProgress = nextMilestone?.requirement.type === 'peakGuests'
    ? Math.min(100, (peakGuests / nextMilestone.requirement.amount) * 100)
    : 0;

  // Determine what the player should focus on
  const getAdvice = () => {
    if (stats.reputation === 0) {
      return { emoji: '🎢', text: 'Build a ride to attract guests!', type: 'info' as const };
    }
    if (stats.entertainmentSatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🎢', text: 'Rides are overcrowded! Build more.', type: 'warning' as const };
    }
    if (stats.hungerSatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🍔', text: 'Guests are hungry! Add food shops.', type: 'warning' as const };
    }
    if (stats.comfortSatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🚻', text: 'Guests need restrooms and benches!', type: 'warning' as const };
    }
    if (stats.safetySatisfaction < 0.5 && stats.currentGuests > 5) {
      return { emoji: '🛡️', text: 'Guests feel unsafe! Add security.', type: 'warning' as const };
    }
    if (stats.netIncome < 0) {
      return { emoji: '💸', text: 'Losing money! Lower costs or ticket price.', type: 'danger' as const };
    }
    if (stats.overallSatisfaction >= 0.8 && stats.currentGuests >= stats.maxGuests * 0.8) {
      return { emoji: '🔓', text: 'Park is almost full! Unlock more slots.', type: 'success' as const };
    }
    if (stats.overallSatisfaction >= 0.8) {
      return { emoji: '✨', text: 'Park is running great!', type: 'success' as const };
    }
    return { emoji: '📈', text: 'Keep building to grow your park!', type: 'info' as const };
  };

  const advice = getAdvice();
  const adviceColors = {
    success: 'bg-park-success/10 border-park-success/30 text-park-success',
    warning: 'bg-park-warning/10 border-park-warning/30 text-park-warning',
    danger: 'bg-park-danger/10 border-park-danger/30 text-park-danger',
    info: 'bg-park-accent/10 border-park-accent/30 text-park-accent',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-50"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-park-card to-park-bg rounded-t-3xl z-50 max-h-[90vh] overflow-auto"
      >
        <div className="p-4 pb-8">
          {/* Handle */}
          <div className="w-12 h-1.5 bg-park-muted/40 rounded-full mx-auto mb-4" />

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📊</span> Park Stats
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-park-bg flex items-center justify-center text-park-muted"
            >
              ✕
            </button>
          </div>

          {/* Advice Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${adviceColors[advice.type]} border rounded-xl p-3 mb-5`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{advice.emoji}</span>
              <p className="font-medium text-sm">{advice.text}</p>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-park-bg rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-bold text-park-accent">{stats.reputation}</div>
              <div className="text-xs text-park-muted">Prestige</div>
            </div>
            <div className="bg-park-bg rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-lg font-bold">{Math.floor(guests)}</div>
              <div className="text-xs text-park-muted">of {stats.maxGuests} max</div>
            </div>
            <div className="bg-park-bg rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-lg font-bold text-yellow-400">{Math.floor(peakGuests)}</div>
              <div className="text-xs text-park-muted">Peak Record</div>
            </div>
          </div>

          {/* Guest Needs Section */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-park-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>💭</span> Guest Needs
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <NeedCard
                emoji="🎢"
                name="Entertainment"
                value={stats.entertainmentSatisfaction}
                capacity={stats.rideCapacity}
                guests={stats.currentGuests}
                tip="Build rides for entertainment"
              />
              <NeedCard
                emoji="🍔"
                name="Hunger"
                value={stats.hungerSatisfaction}
                capacity={stats.totalHungerCapacity}
                guests={stats.currentGuests}
                tip="Build food shops"
              />
              <NeedCard
                emoji="🚻"
                name="Comfort"
                value={stats.comfortSatisfaction}
                capacity={stats.totalComfortCapacity}
                guests={stats.currentGuests}
                tip="Build restrooms & benches"
              />
              <NeedCard
                emoji="🛡️"
                name="Safety"
                value={stats.safetySatisfaction}
                capacity={stats.totalSafetyCapacity}
                guests={stats.currentGuests}
                tip="Build security & first aid"
              />
            </div>

            {/* Overall Happiness */}
            <div className="mt-3 bg-park-bg rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {stats.overallSatisfaction >= 0.8 ? '😊' : stats.overallSatisfaction >= 0.5 ? '😐' : '😟'}
                  </span>
                  <span className="font-semibold">Overall Happiness</span>
                </div>
                <span className={`text-xl font-bold ${
                  stats.overallSatisfaction >= 0.8 ? 'text-park-success' :
                  stats.overallSatisfaction >= 0.5 ? 'text-park-warning' : 'text-park-danger'
                }`}>
                  {Math.round(stats.overallSatisfaction * 100)}%
                </span>
              </div>
              <div className="h-2 bg-park-muted/20 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(stats.overallSatisfaction * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    stats.overallSatisfaction >= 0.8 ? 'bg-park-success' :
                    stats.overallSatisfaction >= 0.5 ? 'bg-park-warning' : 'bg-park-danger'
                  }`}
                />
              </div>
              <p className="text-xs text-park-muted mt-2 text-center">
                Low happiness makes guests leave faster
              </p>
            </div>
          </div>

          {/* Income Section */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-park-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>💰</span> Finances
            </h3>
            <div className="bg-park-bg rounded-xl p-4">
              {/* Net Income Highlight */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-park-muted/20">
                <span className="font-semibold">Net Income</span>
                <span className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                  {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
                </span>
              </div>

              {/* Breakdown */}
              <StatRow icon="🎟️" label={`Tickets (${formatMoney(ticketPrice)} each)`} value={`+${formatMoney(stats.ticketIncome)}/s`} valueColor="text-park-success" />
              <StatRow icon="🛒" label="Shop sales" value={`+${formatMoney(stats.shopIncome)}/s`} valueColor="text-park-success" />
              <StatRow icon="🔧" label="Maintenance" value={`-${formatMoney(stats.totalMaintenance)}/s`} valueColor="text-park-danger" />

              {/* Projections */}
              <div className="mt-4 pt-4 border-t border-park-muted/20 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className={`text-lg font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                    {formatMoney(stats.netIncome * 60)}
                  </div>
                  <div className="text-xs text-park-muted">per minute</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                    {formatMoney(stats.netIncome * 3600)}
                  </div>
                  <div className="text-xs text-park-muted">per hour</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-park-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>🏆</span> Next Milestone
              </h3>
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{nextMilestone.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{nextMilestone.name}</div>
                    <div className="text-sm text-park-muted">{nextMilestone.description}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-park-muted mb-1">
                    <span>{Math.floor(peakGuests)} / {nextMilestone.requirement.amount}</span>
                    <span>{Math.floor(nextMilestoneProgress)}%</span>
                  </div>
                  <div className="h-2 bg-park-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nextMilestoneProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-yellow-400 text-center">
                  🎁 Reward: {nextMilestone.reward.type === 'money' && formatMoney(nextMilestone.reward.amount)}
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-semibold bg-park-accent text-white shadow-lg shadow-park-accent/20"
          >
            Got it
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
