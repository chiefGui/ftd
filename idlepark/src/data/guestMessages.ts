// Guest names for the feed
export const GUEST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
  'Avery', 'Jamie', 'Drew', 'Skyler', 'Reese', 'Charlie', 'Frankie', 'Jessie',
];

export type MessageTemplate = {
  emoji: string;
  text: string;
};

export const POSITIVE_MESSAGES: MessageTemplate[] = [
  { emoji: '🎢', text: 'just rode the {ride} - AMAZING!' },
  { emoji: '😍', text: 'this park is incredible!' },
  { emoji: '🎉', text: 'best day ever at this park!' },
  { emoji: '🍦', text: 'the ice cream here is so good!' },
  { emoji: '🌟', text: 'definitely coming back again!' },
  { emoji: '📸', text: 'taking so many photos!' },
  { emoji: '🎠', text: 'my kids love this place!' },
  { emoji: '👍', text: 'great value for the ticket price!' },
  { emoji: '🤩', text: 'the rides are amazing!' },
  { emoji: '💕', text: 'perfect day out with friends!' },
];

export const NEGATIVE_MESSAGES: MessageTemplate[] = [
  { emoji: '😤', text: 'these ticket prices are insane!' },
  { emoji: '😡', text: 'waited forever in line...' },
  { emoji: '🚫', text: 'not enough restrooms!' },
  { emoji: '💸', text: 'way too expensive here' },
  { emoji: '😞', text: 'leaving early, not worth it' },
  { emoji: '🥵', text: 'need more shade and benches!' },
  { emoji: '😒', text: 'the queues are ridiculous' },
  { emoji: '🙄', text: 'overpriced and overcrowded' },
];

export const NEUTRAL_MESSAGES: MessageTemplate[] = [
  { emoji: '🚶', text: 'just arrived at the park!' },
  { emoji: '🎟️', text: 'got my ticket, let\'s go!' },
  { emoji: '🗺️', text: 'checking out the map...' },
  { emoji: '☕', text: 'grabbing a coffee first' },
  { emoji: '👀', text: 'so many rides to choose from!' },
  { emoji: '🤔', text: 'where should we go first?' },
];

export const NEW_BUILDING_MESSAGES: MessageTemplate[] = [
  { emoji: '🆕', text: 'ooh they built a new {building}!' },
  { emoji: '🎊', text: 'new {building} just opened!' },
  { emoji: '👀', text: 'can\'t wait to try the new {building}!' },
  { emoji: '🎉', text: 'finally, a new {building}!' },
];

// Helper to pick random item from array
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to pick random guest name
export function randomGuestName(): string {
  return pickRandom(GUEST_NAMES);
}
