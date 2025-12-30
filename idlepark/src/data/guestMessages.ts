// Realistic guest names
export const GUEST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Sophia', 'Mason',
  'Isabella', 'Ethan', 'Mia', 'Aiden', 'Charlotte', 'Jackson', 'Luna', 'Sebastian',
  'Harper', 'James', 'Evelyn', 'Benjamin', 'Aria', 'Elijah', 'Chloe', 'Logan',
  'Scarlett', 'Alexander', 'Grace', 'William', 'Zoey', 'Michael', 'Lily', 'Daniel',
];

export type MessageTemplate = {
  emoji: string;
  text: string;
};

// More natural, human-like positive messages
export const POSITIVE_MESSAGES: MessageTemplate[] = [
  { emoji: '🎢', text: 'omg that ride was INSANE' },
  { emoji: '😍', text: 'this place is everything' },
  { emoji: '🎉', text: 'best. day. ever.' },
  { emoji: '🍦', text: 'ok the ice cream here hits different' },
  { emoji: '🌟', text: 'we\'re definitely coming back next weekend' },
  { emoji: '📸', text: 'got the cutest pics today!!' },
  { emoji: '🎠', text: 'the kids won\'t stop talking about the rides' },
  { emoji: '👍', text: 'honestly worth every penny' },
  { emoji: '🤩', text: 'I can\'t pick a favorite ride they\'re all so good' },
  { emoji: '💕', text: 'perfect date spot ngl' },
  { emoji: '🙌', text: 'the vibes here are immaculate' },
  { emoji: '😭', text: 'I don\'t want to leave lol' },
  { emoji: '✨', text: 'living my best life rn' },
  { emoji: '🎡', text: 'view from the ferris wheel is gorgeous' },
  { emoji: '🤤', text: 'the food is actually good here??' },
  { emoji: '💯', text: '10/10 would recommend' },
  { emoji: '🥳', text: 'birthday party here was a hit!' },
  { emoji: '😊', text: 'staff is so friendly' },
];

// Realistic complaints
export const NEGATIVE_MESSAGES: MessageTemplate[] = [
  { emoji: '😤', text: 'these prices are getting ridiculous' },
  { emoji: '😡', text: 'been waiting in line for 45 mins...' },
  { emoji: '🚫', text: 'why is there only one bathroom??' },
  { emoji: '💸', text: '$15 for a hot dog are you kidding me' },
  { emoji: '😞', text: 'leaving early, not worth the money' },
  { emoji: '🥵', text: 'need more water fountains its so hot' },
  { emoji: '😒', text: 'the lines are absolutely insane today' },
  { emoji: '🙄', text: 'way too crowded can barely move' },
  { emoji: '😫', text: 'my feet hurt and there\'s nowhere to sit' },
  { emoji: '👎', text: 'wouldn\'t come back at these prices tbh' },
  { emoji: '🤦', text: 'half the rides are closed??' },
  { emoji: '😑', text: 'the wait times are not it' },
];

// Casual neutral observations
export const NEUTRAL_MESSAGES: MessageTemplate[] = [
  { emoji: '🚶', text: 'just got here, where should we start?' },
  { emoji: '🎟️', text: 'finally got tickets let\'s goooo' },
  { emoji: '🗺️', text: 'this park is bigger than I thought' },
  { emoji: '☕', text: 'coffee first then rides' },
  { emoji: '👀', text: 'so many options what do we do first' },
  { emoji: '🤔', text: 'which line looks shorter?' },
  { emoji: '📍', text: 'checking in at the park!' },
  { emoji: '🎒', text: 'grabbed our wristbands ready to go' },
  { emoji: '👋', text: 'here with the fam for the day' },
  { emoji: '🌤️', text: 'perfect weather for the park' },
];

// New attraction reactions
export const NEW_BUILDING_MESSAGES: MessageTemplate[] = [
  { emoji: '🆕', text: 'wait they built something new??' },
  { emoji: '🎊', text: 'new ride just dropped let\'s check it out' },
  { emoji: '👀', text: 'ooh what\'s that new thing over there' },
  { emoji: '🎉', text: 'finally a new attraction!' },
  { emoji: '🏃', text: 'running to the new ride before the line gets crazy' },
  { emoji: '📢', text: 'heard they just opened something new!' },
];

// Ambient messages when nothing is happening
export const AMBIENT_MESSAGES: MessageTemplate[] = [
  { emoji: '🌳', text: 'nice day to be at the park' },
  { emoji: '🎵', text: 'love the music they play here' },
  { emoji: '🎈', text: 'saw a kid with the cutest balloon' },
  { emoji: '☀️', text: 'sun\'s out, fun\'s out' },
  { emoji: '🍿', text: 'popcorn smell is making me hungry' },
  { emoji: '😌', text: 'such a chill vibe today' },
  { emoji: '🦆', text: 'there\'s ducks in the pond lol' },
  { emoji: '🌸', text: 'the park looks so pretty this time of year' },
  { emoji: '👨‍👩‍👧', text: 'family time at its finest' },
  { emoji: '🎪', text: 'the decorations here are so cute' },
  { emoji: '🍃', text: 'nice breeze today' },
  { emoji: '🧢', text: 'forgot sunscreen oops' },
];

// Price-specific reactions
export const HIGH_PRICE_MESSAGES: MessageTemplate[] = [
  { emoji: '💰', text: 'did ticket prices go up again?' },
  { emoji: '😬', text: 'that ticket price tho...' },
  { emoji: '🤑', text: 'my wallet is crying rn' },
  { emoji: '📈', text: 'these prices are wild' },
  { emoji: '💳', text: 'good thing I saved up for this' },
];

export const LOW_PRICE_MESSAGES: MessageTemplate[] = [
  { emoji: '🎫', text: 'tickets are actually reasonable!' },
  { emoji: '💵', text: 'great deal on tickets today' },
  { emoji: '👏', text: 'love the affordable prices' },
  { emoji: '🙏', text: 'finally prices that make sense' },
];

// Helper to pick random item from array
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to pick random guest name
export function randomGuestName(): string {
  return pickRandom(GUEST_NAMES);
}
