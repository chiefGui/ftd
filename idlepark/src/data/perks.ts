export type PerkEffect = {
  type: 'bonusSlots' | 'unlockBuildings';
  value: number | string;
};

export type Perk = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  effects: PerkEffect[];
};

export const PERKS: Perk[] = [
  {
    id: 'park_rank_2',
    name: 'Park Expansion',
    emoji: '🌟',
    description: 'Unlock +12 land slots',
    cost: 1000000,
    effects: [
      { type: 'bonusSlots', value: 12 },
    ],
  },
];

export const getPerkById = (id: string): Perk | undefined => {
  return PERKS.find((p) => p.id === id);
};

// Calculate total bonus slots from unlocked perks
export const getBonusSlots = (unlockedPerks: string[]): number => {
  let bonus = 0;
  for (const perkId of unlockedPerks) {
    const perk = getPerkById(perkId);
    if (!perk) continue;
    for (const effect of perk.effects) {
      if (effect.type === 'bonusSlots') {
        bonus += effect.value as number;
      }
    }
  }
  return bonus;
};
