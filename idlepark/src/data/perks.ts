export type Perk = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
};

export const PERKS: Perk[] = [
  {
    id: 'park_rank_2',
    name: 'Park Expansion I',
    emoji: '🌟',
    description: 'Unlock standard-tier attractions',
    cost: 50000,
  },
  {
    id: 'park_rank_3',
    name: 'Park Expansion II',
    emoji: '✨',
    description: 'Unlock premium-tier attractions',
    cost: 200000,
  },
];

export const getPerkById = (id: string): Perk | undefined => {
  return PERKS.find((p) => p.id === id);
};
