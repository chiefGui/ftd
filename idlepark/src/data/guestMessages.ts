// Guest profiles with names and avatar emojis
export type GuestProfile = {
  name: string;
  avatar: string;
};

export const GUEST_PROFILES: GuestProfile[] = [
  { name: 'Emma', avatar: '👩' },
  { name: 'Liam', avatar: '👨' },
  { name: 'Olivia', avatar: '👩‍🦰' },
  { name: 'Noah', avatar: '🧑' },
  { name: 'Ava', avatar: '👧' },
  { name: 'Lucas', avatar: '👦' },
  { name: 'Sophia', avatar: '👩‍🦱' },
  { name: 'Mason', avatar: '🧔' },
  { name: 'Isabella', avatar: '👩‍🦳' },
  { name: 'Ethan', avatar: '🧑‍🦱' },
  { name: 'Mia', avatar: '👱‍♀️' },
  { name: 'Aiden', avatar: '👱' },
  { name: 'Charlotte', avatar: '🧑‍🦰' },
  { name: 'Jackson', avatar: '👴' },
  { name: 'Luna', avatar: '👶' },
  { name: 'Sebastian', avatar: '🧑‍🦲' },
  { name: 'Harper', avatar: '👩‍🦲' },
  { name: 'James', avatar: '🤵' },
  { name: 'Evelyn', avatar: '👸' },
  { name: 'Benjamin', avatar: '🤴' },
  { name: 'Aria', avatar: '🧕' },
  { name: 'Elijah', avatar: '👳' },
  { name: 'Chloe', avatar: '💃' },
  { name: 'Logan', avatar: '🕺' },
  { name: 'Scarlett', avatar: '🧑‍🎤' },
  { name: 'Alexander', avatar: '👨‍🎤' },
  { name: 'Grace', avatar: '🧚' },
  { name: 'William', avatar: '🦸' },
  { name: 'Zoey', avatar: '🦹‍♀️' },
  { name: 'Michael', avatar: '🥷' },
  { name: 'Lily', avatar: '🧝‍♀️' },
  { name: 'Daniel', avatar: '🧙' },
  { name: 'Sophie', avatar: '👰' },
  { name: 'Ryan', avatar: '🤠' },
  { name: 'Zara', avatar: '🧑‍🚀' },
  { name: 'Tyler', avatar: '👨‍🍳' },
];

export type MessageTemplate = {
  emoji: string;
  text: string;
};

// === POSITIVE MESSAGES ===

export const POSITIVE_MESSAGES: MessageTemplate[] = [
  // General excitement
  { emoji: '🎢', text: 'omg that ride was INSANE' },
  { emoji: '😍', text: 'this place is everything' },
  { emoji: '🎉', text: 'best. day. ever.' },
  { emoji: '🌟', text: "we're definitely coming back next weekend" },
  { emoji: '📸', text: 'got the cutest pics today!!' },
  { emoji: '🎠', text: "the kids won't stop talking about the rides" },
  { emoji: '👍', text: 'honestly worth every penny' },
  { emoji: '🤩', text: "I can't pick a favorite ride they're all so good" },
  { emoji: '💕', text: 'perfect date spot ngl' },
  { emoji: '🙌', text: 'the vibes here are immaculate' },
  { emoji: '😭', text: "I don't want to leave lol" },
  { emoji: '✨', text: 'living my best life rn' },
  { emoji: '🎡', text: 'view from the ferris wheel is gorgeous' },
  { emoji: '💯', text: '10/10 would recommend' },
  { emoji: '🥳', text: 'birthday party here was a hit!' },
  { emoji: '😊', text: 'staff is so friendly' },

  // Food & drinks
  { emoji: '🍦', text: 'ok the ice cream here hits different' },
  { emoji: '🤤', text: 'the food is actually good here??' },
  { emoji: '🍕', text: 'this pizza is bussin fr' },
  { emoji: '🧁', text: 'the cupcakes are SO cute' },
  { emoji: '🥤', text: 'needed that lemonade, perfect on a hot day' },
  { emoji: '🌭', text: 'best hot dog ive had in ages' },
  { emoji: '🍿', text: 'the caramel popcorn is addicting' },

  // Rides & attractions
  { emoji: '🎪', text: 'that rollercoaster had me screaming lmaooo' },
  { emoji: '🚀', text: 'felt like I was flying!!' },
  { emoji: '💫', text: 'still dizzy from the spinner worth it tho' },
  { emoji: '🎠', text: 'carousel was so peaceful' },
  { emoji: '🏎️', text: 'bumper cars never get old' },
  { emoji: '🎯', text: 'finally won something at the games!' },

  // Social & vibes
  { emoji: '👯', text: 'girls trip to the park was elite' },
  { emoji: '🫶', text: 'making memories with the fam' },
  { emoji: '📱', text: 'my story is gonna be fire today' },
  { emoji: '🎶', text: 'the park music is actually a vibe' },
  { emoji: '🌈', text: 'this place makes me so happy' },
];

// === NEGATIVE MESSAGES ===

export const NEGATIVE_MESSAGES: MessageTemplate[] = [
  // Prices
  { emoji: '😤', text: 'these prices are getting ridiculous' },
  { emoji: '💸', text: '$15 for a hot dog are you kidding me' },
  { emoji: '😞', text: 'leaving early, not worth the money' },
  { emoji: '👎', text: "wouldn't come back at these prices tbh" },
  { emoji: '🤯', text: 'the markup on everything is crazy' },

  // Lines & crowds
  { emoji: '😡', text: 'been waiting in line for 45 mins...' },
  { emoji: '😒', text: 'the lines are absolutely insane today' },
  { emoji: '🙄', text: 'way too crowded can barely move' },
  { emoji: '😑', text: 'the wait times are not it' },
  { emoji: '⏰', text: 'spent more time waiting than riding smh' },
  { emoji: '🐌', text: 'this line isnt moving at all' },

  // Facilities
  { emoji: '🚫', text: 'why is there only one bathroom??' },
  { emoji: '🥵', text: 'need more water fountains its so hot' },
  { emoji: '😫', text: "my feet hurt and there's nowhere to sit" },
  { emoji: '🗑️', text: 'trash cans are overflowing gross' },
  { emoji: '🪑', text: 'not a single bench in sight' },
  { emoji: '🚻', text: 'bathroom line is longer than the ride line' },

  // Maintenance & issues
  { emoji: '🤦', text: 'half the rides are closed??' },
  { emoji: '🔧', text: 'another ride under maintenance smh' },
  { emoji: '💔', text: 'my favorite ride is broken :(' },
  { emoji: '😩', text: 'came all this way and the main ride is down' },

  // General complaints
  { emoji: '🥱', text: 'kinda underwhelming ngl' },
  { emoji: '😐', text: 'expected more for what we paid' },
  { emoji: '🤷', text: 'meh, seen better parks' },
  { emoji: '📉', text: 'quality has gone down since last time' },
];

// === NEUTRAL MESSAGES ===

export const NEUTRAL_MESSAGES: MessageTemplate[] = [
  // Arrival
  { emoji: '🚶', text: 'just got here, where should we start?' },
  { emoji: '🎟️', text: "finally got tickets let's goooo" },
  { emoji: '🗺️', text: 'this park is bigger than I thought' },
  { emoji: '☕', text: 'coffee first then rides' },
  { emoji: '👀', text: 'so many options what do we do first' },
  { emoji: '🤔', text: 'which line looks shorter?' },
  { emoji: '📍', text: 'checking in at the park!' },
  { emoji: '🎒', text: 'grabbed our wristbands ready to go' },
  { emoji: '👋', text: 'here with the fam for the day' },
  { emoji: '🌤️', text: 'perfect weather for the park' },

  // Throughout the day
  { emoji: '🧭', text: 'trying to find the food court' },
  { emoji: '📲', text: 'checking the wait times app' },
  { emoji: '👟', text: 'good thing I wore comfy shoes' },
  { emoji: '🎫', text: 'should we get the fast pass?' },
  { emoji: '🤳', text: 'taking a selfie break' },
  { emoji: '🧴', text: 'reapplying sunscreen real quick' },
  { emoji: '💭', text: 'what should we ride next' },
  { emoji: '⌚', text: 'we still have a few hours left' },
  { emoji: '🔋', text: 'phone dying need to find a charger' },
  { emoji: '🎁', text: 'checking out the gift shop' },
];

// === NEW BUILDING MESSAGES ===

export const NEW_BUILDING_MESSAGES: MessageTemplate[] = [
  { emoji: '🆕', text: 'wait they built something new??' },
  { emoji: '🎊', text: "new ride just dropped let's check it out" },
  { emoji: '👀', text: "ooh what's that new thing over there" },
  { emoji: '🎉', text: 'finally a new attraction!' },
  { emoji: '🏃', text: 'running to the new ride before the line gets crazy' },
  { emoji: '📢', text: 'heard they just opened something new!' },
  { emoji: '✨', text: 'the new addition looks amazing' },
  { emoji: '🙀', text: 'NO WAY they added a new ride' },
  { emoji: '🎬', text: 'first in line for the new attraction lol' },
  { emoji: '📸', text: 'gotta post about this new ride' },
];

// === AMBIENT MESSAGES ===

export const AMBIENT_MESSAGES: MessageTemplate[] = [
  { emoji: '🌳', text: 'nice day to be at the park' },
  { emoji: '🎵', text: 'love the music they play here' },
  { emoji: '🎈', text: 'saw a kid with the cutest balloon' },
  { emoji: '☀️', text: "sun's out, fun's out" },
  { emoji: '🍿', text: 'popcorn smell is making me hungry' },
  { emoji: '😌', text: 'such a chill vibe today' },
  { emoji: '🦆', text: "there's ducks in the pond lol" },
  { emoji: '🌸', text: 'the park looks so pretty this time of year' },
  { emoji: '👨‍👩‍👧', text: 'family time at its finest' },
  { emoji: '🎪', text: 'the decorations here are so cute' },
  { emoji: '🍃', text: 'nice breeze today' },
  { emoji: '🧢', text: 'forgot sunscreen oops' },
  { emoji: '🐿️', text: 'just saw a squirrel steal someones fries lmao' },
  { emoji: '🎠', text: 'the carousel music is kinda nostalgic' },
  { emoji: '🌅', text: 'park looks beautiful at sunset' },
  { emoji: '💡', text: 'the lights at night are gonna be so pretty' },
];

// === PRICE-SPECIFIC MESSAGES ===

export const HIGH_PRICE_MESSAGES: MessageTemplate[] = [
  { emoji: '💰', text: 'did ticket prices go up again?' },
  { emoji: '😬', text: 'that ticket price tho...' },
  { emoji: '🤑', text: 'my wallet is crying rn' },
  { emoji: '📈', text: 'these prices are wild' },
  { emoji: '💳', text: 'good thing I saved up for this' },
  { emoji: '🏧', text: 'gonna need a second mortgage lol' },
  { emoji: '💀', text: 'rip to my bank account' },
  { emoji: '🙃', text: 'casually spending my rent money here' },
];

export const LOW_PRICE_MESSAGES: MessageTemplate[] = [
  { emoji: '🎫', text: 'tickets are actually reasonable!' },
  { emoji: '💵', text: 'great deal on tickets today' },
  { emoji: '👏', text: 'love the affordable prices' },
  { emoji: '🙏', text: 'finally prices that make sense' },
  { emoji: '🎁', text: 'this feels like a steal tbh' },
  { emoji: '💚', text: 'affordable AND fun? yes please' },
  { emoji: '🤝', text: 'respect for keeping it budget friendly' },
];

// === UPGRADE MESSAGES ===

export const UPGRADE_MESSAGES: MessageTemplate[] = [
  { emoji: '⬆️', text: 'did they upgrade something? looks better' },
  { emoji: '🔄', text: 'this ride feels different... faster?' },
  { emoji: '💪', text: 'improvements are showing!' },
  { emoji: '📊', text: 'park keeps getting better' },
  { emoji: '🌟', text: 'love that theyre investing in the rides' },
  { emoji: '🛠️', text: 'that renovation was worth it' },
];

// === CROWDED MESSAGES ===

export const CROWDED_MESSAGES: MessageTemplate[] = [
  { emoji: '🎢', text: 'worth the wait honestly' },
  { emoji: '👥', text: 'packed today but still having fun' },
  { emoji: '🎪', text: 'busy day at the park!' },
  { emoji: '📅', text: 'should have come on a weekday' },
  { emoji: '🐜', text: 'feels like everyone had the same idea today' },
];

// === EMPTY PARK MESSAGES ===

export const EMPTY_PARK_MESSAGES: MessageTemplate[] = [
  { emoji: '🎯', text: 'no lines?? this is perfect' },
  { emoji: '👻', text: 'park is so empty its kinda eerie lol' },
  { emoji: '🏃', text: 'sprinting between rides bc no wait' },
  { emoji: '💨', text: 'walked right onto every ride today' },
  { emoji: '🎰', text: 'jackpot - empty park day!' },
];

// === HELPER FUNCTIONS ===

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomGuestProfile(): GuestProfile {
  return pickRandom(GUEST_PROFILES);
}

// Legacy support
export function randomGuestName(): string {
  return randomGuestProfile().name;
}
