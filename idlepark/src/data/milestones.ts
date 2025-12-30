import type { Milestone } from '../core/types';

export const MILESTONES: Milestone[] = [
  {
    id: 'peak_guests_100',
    name: 'Crowd Favorite',
    description: 'Have 100 guests in your park at once',
    icon: '👥',
    requirement: { type: 'peakGuests', amount: 100 },
    reward: { type: 'money', amount: 5000 },
  },
  {
    id: 'peak_guests_250',
    name: 'Popular Destination',
    description: 'Have 250 guests in your park at once',
    icon: '🎢',
    requirement: { type: 'peakGuests', amount: 250 },
    reward: { type: 'money', amount: 15000 },
  },
  {
    id: 'peak_guests_500',
    name: 'Theme Park Tycoon',
    description: 'Have 500 guests in your park at once',
    icon: '👑',
    requirement: { type: 'peakGuests', amount: 500 },
    reward: { type: 'money', amount: 50000 },
  },
];

export const getMilestoneById = (id: string): Milestone | undefined =>
  MILESTONES.find((m) => m.id === id);
