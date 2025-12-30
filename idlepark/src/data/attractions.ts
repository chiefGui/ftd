import type { AttractionDefinition } from '../core/types';

export const ATTRACTIONS: AttractionDefinition[] = [
  {
    id: 'carousel',
    name: 'Carousel',
    emoji: '🎠',
    tier: 'basic',
    baseCost: 3000,
    baseIncome: 2,
    capacity: 12,
    description: 'A classic merry-go-round',
  },
  {
    id: 'bumper_cars',
    name: 'Bumper Cars',
    emoji: '🚗',
    tier: 'basic',
    baseCost: 8000,
    baseIncome: 5,
    capacity: 8,
    description: 'Crash into your friends!',
  },
  {
    id: 'ferris_wheel',
    name: 'Ferris Wheel',
    emoji: '🎡',
    tier: 'standard',
    baseCost: 25000,
    baseIncome: 15,
    capacity: 20,
    description: 'See the whole park from above',
  },
  {
    id: 'log_flume',
    name: 'Log Flume',
    emoji: '🌊',
    tier: 'standard',
    baseCost: 45000,
    baseIncome: 25,
    capacity: 12,
    description: 'Get soaked on this water ride',
  },
  {
    id: 'roller_coaster',
    name: 'Roller Coaster',
    emoji: '🎢',
    tier: 'premium',
    baseCost: 150000,
    baseIncome: 75,
    capacity: 24,
    description: 'The ultimate thrill ride',
  },
  {
    id: 'drop_tower',
    name: 'Drop Tower',
    emoji: '🗼',
    tier: 'premium',
    baseCost: 200000,
    baseIncome: 100,
    capacity: 16,
    description: 'Free fall from the sky',
  },
];

export const getAttractionById = (id: string): AttractionDefinition | undefined => {
  return ATTRACTIONS.find((a) => a.id === id);
};
