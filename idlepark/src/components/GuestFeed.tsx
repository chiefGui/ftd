import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

type FeedMessage = {
  id: number;
  emoji: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
};

const GUEST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
  'Avery', 'Jamie', 'Drew', 'Skyler', 'Reese', 'Charlie', 'Frankie', 'Jessie',
];

const POSITIVE_MESSAGES = [
  { emoji: '🎢', text: 'just rode the {ride} - AMAZING!' },
  { emoji: '😍', text: 'this park is incredible!' },
  { emoji: '🎉', text: 'best day ever at this park!' },
  { emoji: '🍦', text: 'the ice cream here is so good!' },
  { emoji: '🌟', text: 'definitely coming back again!' },
  { emoji: '📸', text: 'taking so many photos!' },
  { emoji: '🎠', text: 'my kids love this place!' },
  { emoji: '👍', text: 'great value for the ticket price!' },
];

const NEGATIVE_MESSAGES = [
  { emoji: '😤', text: 'these ticket prices are insane!' },
  { emoji: '😡', text: 'waited forever in line...' },
  { emoji: '🚫', text: 'not enough restrooms!' },
  { emoji: '💸', text: 'way too expensive here' },
  { emoji: '😞', text: 'leaving early, not worth it' },
  { emoji: '🥵', text: 'need more shade and benches!' },
  { emoji: '😒', text: 'the queues are ridiculous' },
];

const NEUTRAL_MESSAGES = [
  { emoji: '🚶', text: 'just arrived at the park!' },
  { emoji: '🎟️', text: 'got my ticket, let\'s go!' },
  { emoji: '🗺️', text: 'checking out the map...' },
  { emoji: '☕', text: 'grabbing a coffee first' },
  { emoji: '👀', text: 'so many rides to choose from!' },
];

const NEW_BUILDING_MESSAGES = [
  { emoji: '🆕', text: 'ooh they built a new {building}!' },
  { emoji: '🎊', text: 'new {building} just opened!' },
  { emoji: '👀', text: 'can\'t wait to try the new {building}!' },
];

export function GuestFeed() {
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const messageIdRef = useRef(0);
  const lastBuildingCountRef = useRef(0);

  const guests = useGameStore((s) => s.guests);
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);
  const slots = useGameStore((s) => s.slots);

  const stats = calculateParkStats();
  const buildingCount = slots.filter(s => s.buildingId).length;

  // Generate contextual messages based on park state
  useEffect(() => {
    if (guests < 1) return;

    const interval = setInterval(() => {
      const name = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
      let pool: typeof POSITIVE_MESSAGES;
      let type: FeedMessage['type'];

      // Choose message pool based on satisfaction and price
      const satisfaction = stats.overallSatisfaction;
      const priceRatio = ticketPrice / 50; // normalized around $50

      const rand = Math.random();

      if (satisfaction < 0.4 || priceRatio > 2) {
        // Unhappy - more negative messages
        pool = rand < 0.7 ? NEGATIVE_MESSAGES : NEUTRAL_MESSAGES;
        type = rand < 0.7 ? 'negative' : 'neutral';
      } else if (satisfaction > 0.7 && priceRatio < 1.5) {
        // Happy - more positive messages
        pool = rand < 0.7 ? POSITIVE_MESSAGES : NEUTRAL_MESSAGES;
        type = rand < 0.7 ? 'positive' : 'neutral';
      } else {
        // Mixed
        if (rand < 0.4) {
          pool = POSITIVE_MESSAGES;
          type = 'positive';
        } else if (rand < 0.7) {
          pool = NEUTRAL_MESSAGES;
          type = 'neutral';
        } else {
          pool = NEGATIVE_MESSAGES;
          type = 'negative';
        }
      }

      const template = pool[Math.floor(Math.random() * pool.length)];
      const text = `${name}: "${template.text}"`;

      const newMessage: FeedMessage = {
        id: messageIdRef.current++,
        emoji: template.emoji,
        text,
        type,
      };

      setMessages(prev => [newMessage, ...prev].slice(0, 3));
    }, 3000 + Math.random() * 2000); // 3-5 seconds between messages

    return () => clearInterval(interval);
  }, [guests, stats.overallSatisfaction, ticketPrice]);

  // Detect new buildings
  useEffect(() => {
    if (buildingCount > lastBuildingCountRef.current && lastBuildingCountRef.current > 0) {
      const name = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
      const template = NEW_BUILDING_MESSAGES[Math.floor(Math.random() * NEW_BUILDING_MESSAGES.length)];

      const newMessage: FeedMessage = {
        id: messageIdRef.current++,
        emoji: template.emoji,
        text: `${name}: "${template.text.replace('{building}', 'attraction')}"`,
        type: 'positive',
      };

      setMessages(prev => [newMessage, ...prev].slice(0, 3));
    }
    lastBuildingCountRef.current = buildingCount;
  }, [buildingCount]);

  if (messages.length === 0) return null;

  return (
    <div className="px-4 py-2 space-y-1">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={`text-sm py-1 px-2 rounded-lg ${
              msg.type === 'positive' ? 'bg-park-success/10 text-park-success' :
              msg.type === 'negative' ? 'bg-park-danger/10 text-park-danger' :
              'bg-park-muted/10 text-park-muted'
            }`}
          >
            <span className="mr-1">{msg.emoji}</span>
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
