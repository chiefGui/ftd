import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getBuildingById } from '../data/buildings';
import { formatMoney } from '../utils/formatters';
import { STAT_LEVEL_MULTIPLIER, MAINTENANCE_LEVEL_MULTIPLIER } from '../data/constants';
import type { Slot } from '../core/types';

type Props = {
  onClose: () => void;
};

type Tab = 'overview' | 'buildings' | 'income' | 'insights';

// Calculate per-building stats
function getBuildingStats(slot: Slot, currentGuests: number) {
  const def = getBuildingById(slot.buildingId);
  if (!def) return null;

  const levelMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level - 1);
  const maintenanceMultiplier = Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);
  const maintenance = def.maintenanceCost * maintenanceMultiplier;

  // Calculate spending rate for this building (used for relative comparison)
  const spendingRate = def.category === 'shop'
    ? (def.spendingRate ?? 0) * levelMultiplier
    : 0;

  // Actual income based on current guests
  const income = spendingRate * currentGuests;

  const profit = income - maintenance;
  const baseCost = def.baseCost;
  const totalInvested = baseCost + Array.from(
    { length: slot.level - 1 },
    (_, i) => Math.floor(baseCost * Math.pow(1.15, i + 1))
  ).reduce((a, b) => a + b, 0);

  return {
    slot,
    def,
    level: slot.level,
    spendingRate,
    income,
    maintenance,
    profit,
    totalInvested,
    prestige: def.category === 'ride' ? Math.floor((def.prestige ?? 0) * levelMultiplier) : 0,
    capacity: def.category === 'ride' ? Math.floor((def.rideCapacity ?? 0) * levelMultiplier) : 0,
    coverage: def.category === 'infrastructure' ? Math.floor((def.coverage ?? 0) * levelMultiplier) : 0,
  };
}

// Cost bar chart component (for maintenance breakdown)
function CostBarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; emoji?: string }[];
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map(d => Math.abs(d.value)), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm mb-1">
            <div className="flex items-center gap-2">
              {item.emoji && <span>{item.emoji}</span>}
              <span className="text-park-muted">{item.label}</span>
            </div>
            <span className="text-park-danger font-medium">
              {formatMoney(item.value)}/s
            </span>
          </div>
          <div className="h-2 bg-park-muted/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (Math.abs(item.value) / max) * 100)}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="h-full rounded-full bg-park-danger"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut chart component
function DonutChart({
  segments,
  size = 120,
  thickness = 20,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {total === 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-park-muted/20"
          />
        ) : (
          segments.map((segment, i) => {
            const segmentLength = (Math.max(0, segment.value) / total) * circumference;
            const offset = currentOffset;
            currentOffset += segmentLength;

            if (segment.value <= 0) return null;

            return (
              <motion.circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={-offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${segmentLength} ${circumference}` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            );
          })
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold">{formatMoney(total)}</div>
          <div className="text-xs text-park-muted">/sec</div>
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  emoji,
  label,
  value,
  subValue,
  trend,
}: {
  emoji: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-park-bg rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{emoji}</span>
        <span className="text-xs text-park-muted uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{value}</span>
        {trend && (
          <span className={trend === 'up' ? 'text-park-success' : trend === 'down' ? 'text-park-danger' : 'text-park-muted'}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subValue && <div className="text-xs text-park-muted mt-1">{subValue}</div>}
    </div>
  );
}

// Ranking item component
function RankingItem({
  rank,
  emoji,
  name,
  value,
  valueColor = 'text-park-text',
  level,
}: {
  rank: number;
  emoji: string;
  name: string;
  value: string;
  valueColor?: string;
  level?: number;
}) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center gap-3 py-2 border-b border-park-muted/10 last:border-0">
      <span className="w-6 text-center text-sm">
        {rank <= 3 ? medals[rank - 1] : `#${rank}`}
      </span>
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{name}</span>
          {level && level > 1 && (
            <span className="text-xs text-park-accent">{'★'.repeat(level)}</span>
          )}
        </div>
      </div>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}

export function StatsDashboard({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const slots = useGameStore((s) => s.slots);
  const money = useGameStore((s) => s.money);
  const totalEarnings = useGameStore((s) => s.totalEarnings);
  const gameStartedAt = useGameStore((s) => s.gameStartedAt);
  const guests = useGameStore((s) => s.guests);
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);

  const stats = calculateParkStats();

  // Calculate all building stats using actual guest count
  const buildingStats = useMemo(() => {
    return slots
      .map(slot => getBuildingStats(slot, guests))
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [slots, guests]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ride: 0, shop: 0, infrastructure: 0 };
    buildingStats.forEach(b => {
      counts[b.def.category]++;
    });
    return counts;
  }, [buildingStats]);

  // Top performers by profit (shops only)
  const topProfitBuildings = useMemo(() => {
    return [...buildingStats]
      .filter(b => b.def.category === 'shop')
      .sort((a, b) => b.profit - a.profit);
  }, [buildingStats]);

  // Top rides by prestige
  const topPrestigeRides = useMemo(() => {
    return [...buildingStats]
      .filter(b => b.def.category === 'ride')
      .sort((a, b) => b.prestige - a.prestige);
  }, [buildingStats]);

  // Highest maintenance costs
  const highestMaintenance = useMemo(() => {
    return [...buildingStats]
      .sort((a, b) => b.maintenance - a.maintenance)
      .slice(0, 5);
  }, [buildingStats]);

  // Total investment value
  const totalInvestment = useMemo(() => {
    return buildingStats.reduce((sum, b) => sum + b.totalInvested, 0);
  }, [buildingStats]);

  // Maintenance by category
  const maintenanceByCategory = useMemo(() => {
    const result = { ride: 0, shop: 0, infrastructure: 0 };
    buildingStats.forEach(b => {
      result[b.def.category] += b.maintenance;
    });
    return result;
  }, [buildingStats]);

  // Play time calculation
  const playTime = useMemo(() => {
    const seconds = Math.floor((Date.now() - gameStartedAt) / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [gameStartedAt]);

  // Insights calculations
  const insights = useMemo(() => {
    const result: { emoji: string; title: string; description: string; type: 'success' | 'warning' | 'info' }[] = [];

    // Best performing shop
    if (topProfitBuildings.length > 0) {
      const best = topProfitBuildings[0];
      result.push({
        emoji: best.def.emoji,
        title: `${best.def.name} is your top earner`,
        description: `Generating ${formatMoney(best.profit)}/s profit`,
        type: 'success',
      });
    }

    // Shops losing money (profit < 0)
    const losingShops = [...buildingStats]
      .filter(b => b.def.category === 'shop' && b.profit < 0)
      .sort((a, b) => a.profit - b.profit);
    if (losingShops.length > 0) {
      const worst = losingShops[0];
      result.push({
        emoji: worst.def.emoji,
        title: `${worst.def.name} is losing money`,
        description: `Costs ${formatMoney(Math.abs(worst.profit))}/s more than it earns`,
        type: 'warning',
      });
    }

    // Ride capacity warning
    if (stats.rideSatisfaction < 0.6 && stats.currentGuests > 10) {
      result.push({
        emoji: '🎢',
        title: 'Rides are overcrowded',
        description: `Only ${Math.round(stats.rideSatisfaction * 100)}% capacity for ${Math.floor(stats.currentGuests)} guests`,
        type: 'warning',
      });
    }

    // Facility coverage warning
    if (stats.facilitySatisfaction < 0.6 && stats.currentGuests > 10) {
      result.push({
        emoji: '🚻',
        title: 'Not enough facilities',
        description: `Guests need more restrooms and amenities`,
        type: 'warning',
      });
    }

    // High maintenance alert
    if (stats.totalMaintenance > stats.ticketIncome + stats.shopIncome) {
      result.push({
        emoji: '💸',
        title: 'Costs exceed income',
        description: `Losing ${formatMoney(Math.abs(stats.netIncome))}/s`,
        type: 'warning',
      });
    }

    // Profit milestone
    if (stats.netIncome > 100) {
      result.push({
        emoji: '📈',
        title: 'Park is highly profitable',
        description: `Making ${formatMoney(stats.netIncome)}/s`,
        type: 'success',
      });
    }

    // Diversification suggestion
    if (categoryCounts.shop === 0 && stats.currentGuests > 20) {
      result.push({
        emoji: '🛍️',
        title: 'No shops in your park',
        description: 'Build shops to earn from guests in the park',
        type: 'info',
      });
    }

    // High prestige
    if (stats.reputation > 200) {
      result.push({
        emoji: '⭐',
        title: 'Your park is famous!',
        description: `${stats.reputation} prestige attracting guests`,
        type: 'success',
      });
    }

    return result;
  }, [buildingStats, topProfitBuildings, stats, categoryCounts]);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'buildings', label: 'Buildings', emoji: '🏗️' },
    { id: 'income', label: 'Income', emoji: '💰' },
    { id: 'insights', label: 'Insights', emoji: '💡' },
  ];

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
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-park-muted/20 shrink-0">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📈</span> Park Analytics
            </h2>
            <button onClick={onClose} className="text-2xl text-park-muted">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-park-bg rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-park-accent text-white'
                    : 'text-park-muted'
                }`}
              >
                <span className="mr-1">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    emoji="💵"
                    label="Net Income"
                    value={`${stats.netIncome >= 0 ? '+' : ''}${formatMoney(stats.netIncome)}/s`}
                    trend={stats.netIncome > 0 ? 'up' : stats.netIncome < 0 ? 'down' : 'neutral'}
                  />
                  <StatCard
                    emoji="👥"
                    label="Guests"
                    value={Math.floor(guests)}
                    subValue={`of ${stats.maxGuests} max`}
                  />
                  <StatCard
                    emoji="⭐"
                    label="Prestige"
                    value={stats.reputation}
                    subValue="Park fame"
                  />
                  <StatCard
                    emoji="😊"
                    label="Happiness"
                    value={`${Math.round(stats.overallSatisfaction * 100)}%`}
                    trend={stats.overallSatisfaction >= 0.8 ? 'up' : stats.overallSatisfaction < 0.5 ? 'down' : 'neutral'}
                  />
                </div>

                {/* Building Summary */}
                <div className="bg-park-bg rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🏗️</span> Your Buildings
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-park-accent">{categoryCounts.ride}</div>
                      <div className="text-xs text-park-muted">🎢 Rides</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-park-success">{categoryCounts.shop}</div>
                      <div className="text-xs text-park-muted">🛍️ Shops</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-park-warning">{categoryCounts.infrastructure}</div>
                      <div className="text-xs text-park-muted">🚻 Facilities</div>
                    </div>
                  </div>
                </div>

                {/* Lifetime Stats */}
                <div className="bg-park-bg rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📜</span> Lifetime Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-park-muted">Play time</span>
                      <span className="font-medium">{playTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-park-muted">Total earned</span>
                      <span className="font-medium text-park-success">{formatMoney(totalEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-park-muted">Total invested</span>
                      <span className="font-medium text-park-accent">{formatMoney(totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-park-muted">Current balance</span>
                      <span className="font-medium">{formatMoney(money)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'buildings' && (
              <motion.div
                key="buildings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Top Earning Shops */}
                {topProfitBuildings.length > 0 && (
                  <div className="bg-park-bg rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>💰</span> Top Earning Shops
                    </h3>
                    {topProfitBuildings.slice(0, 5).map((b, i) => (
                      <RankingItem
                        key={b.slot.id}
                        rank={i + 1}
                        emoji={b.def.emoji}
                        name={b.def.name}
                        value={`${formatMoney(b.profit)}/s`}
                        valueColor={b.profit >= 0 ? 'text-park-success' : 'text-park-danger'}
                        level={b.level}
                      />
                    ))}
                  </div>
                )}

                {/* Top Prestige Rides */}
                {topPrestigeRides.length > 0 && (
                  <div className="bg-park-bg rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>⭐</span> Most Popular Rides
                    </h3>
                    {topPrestigeRides.slice(0, 5).map((b, i) => (
                      <RankingItem
                        key={b.slot.id}
                        rank={i + 1}
                        emoji={b.def.emoji}
                        name={b.def.name}
                        value={`${b.prestige} prestige`}
                        valueColor="text-park-accent"
                        level={b.level}
                      />
                    ))}
                  </div>
                )}

                {/* Highest Maintenance */}
                {highestMaintenance.length > 0 && (
                  <div className="bg-park-bg rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>🔧</span> Highest Maintenance Costs
                    </h3>
                    {highestMaintenance.map((b, i) => (
                      <RankingItem
                        key={b.slot.id}
                        rank={i + 1}
                        emoji={b.def.emoji}
                        name={b.def.name}
                        value={`-${formatMoney(b.maintenance)}/s`}
                        valueColor="text-park-danger"
                        level={b.level}
                      />
                    ))}
                  </div>
                )}

                {buildingStats.length === 0 && (
                  <div className="text-center py-12 text-park-muted">
                    <div className="text-4xl mb-3">🏗️</div>
                    <p>No buildings yet!</p>
                    <p className="text-sm mt-1">Build something to see stats</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'income' && (
              <motion.div
                key="income"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Income Breakdown Donut */}
                <div className="bg-park-bg rounded-xl p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>📈</span> Income Sources
                  </h3>
                  <div className="flex items-center justify-center gap-6">
                    <DonutChart
                      segments={[
                        { value: stats.ticketIncome, color: '#7aa2f7', label: 'Tickets' },
                        { value: stats.shopIncome, color: '#9ece6a', label: 'Shops' },
                      ]}
                    />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-park-accent" />
                        <div>
                          <div className="text-sm font-medium">Tickets</div>
                          <div className="text-xs text-park-muted">{formatMoney(stats.ticketIncome)}/s</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-park-success" />
                        <div>
                          <div className="text-sm font-medium">Shops</div>
                          <div className="text-xs text-park-muted">{formatMoney(stats.shopIncome)}/s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Costs Breakdown */}
                <div className="bg-park-bg rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>💸</span> Maintenance Costs
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-park-muted">Total costs</span>
                    <span className="text-lg font-bold text-park-danger">
                      -{formatMoney(stats.totalMaintenance)}/s
                    </span>
                  </div>
                  <CostBarChart
                    data={[
                      { label: 'Rides', value: maintenanceByCategory.ride, emoji: '🎢' },
                      { label: 'Shops', value: maintenanceByCategory.shop, emoji: '🛍️' },
                      { label: 'Facilities', value: maintenanceByCategory.infrastructure, emoji: '🚻' },
                    ].filter(d => d.value > 0)}
                  />
                </div>

                {/* Profit Summary */}
                <div className="bg-park-bg rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>💵</span> Profit Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-park-muted/10">
                      <span>Total Income</span>
                      <span className="text-park-success font-medium">
                        +{formatMoney(stats.ticketIncome + stats.shopIncome)}/s
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-park-muted/10">
                      <span>Total Costs</span>
                      <span className="text-park-danger font-medium">
                        -{formatMoney(stats.totalMaintenance)}/s
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold">Net Profit</span>
                      <span className={`text-xl font-bold ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                        {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
                      </span>
                    </div>
                  </div>

                  {/* Hourly/Daily projections */}
                  <div className="mt-4 pt-4 border-t border-park-muted/20">
                    <div className="text-xs text-park-muted mb-2">Projections</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-park-card rounded-lg p-2 text-center">
                        <div className={`font-medium ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                          {formatMoney(stats.netIncome * 60)}
                        </div>
                        <div className="text-xs text-park-muted">per minute</div>
                      </div>
                      <div className="bg-park-card rounded-lg p-2 text-center">
                        <div className={`font-medium ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                          {formatMoney(stats.netIncome * 3600)}
                        </div>
                        <div className="text-xs text-park-muted">per hour</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {insights.length === 0 ? (
                  <div className="text-center py-12 text-park-muted">
                    <div className="text-4xl mb-3">💡</div>
                    <p>No insights yet!</p>
                    <p className="text-sm mt-1">Build more to get personalized tips</p>
                  </div>
                ) : (
                  insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-xl p-4 ${
                        insight.type === 'success'
                          ? 'bg-park-success/10 border border-park-success/30'
                          : insight.type === 'warning'
                          ? 'bg-park-warning/10 border border-park-warning/30'
                          : 'bg-park-accent/10 border border-park-accent/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{insight.emoji}</span>
                        <div>
                          <h4 className={`font-semibold ${
                            insight.type === 'success'
                              ? 'text-park-success'
                              : insight.type === 'warning'
                              ? 'text-park-warning'
                              : 'text-park-accent'
                          }`}>
                            {insight.title}
                          </h4>
                          <p className="text-sm text-park-muted mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Demand Curve */}
                <div className="bg-park-bg rounded-xl p-4 mt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🎟️</span> Ticket Price Impact
                  </h3>
                  <p className="text-sm text-park-muted mb-3">
                    How ticket price affects guest demand
                  </p>
                  <div className="space-y-2">
                    {[
                      { price: 5, demand: 100 },
                      { price: 25, demand: 85 },
                      { price: 50, demand: 70 },
                      { price: 100, demand: 50 },
                      { price: 200, demand: 30 },
                      { price: 500, demand: 5 },
                    ].map((item) => (
                      <div key={item.price} className="flex items-center gap-2">
                        <span className="w-12 text-xs text-park-muted text-right">
                          ${item.price}
                        </span>
                        <div className="flex-1 h-2 bg-park-muted/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-park-accent rounded-full"
                            style={{ width: `${item.demand}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-park-muted">
                          {item.demand}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
