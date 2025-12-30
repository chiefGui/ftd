import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import {
  POSITIVE_MESSAGES,
  NEGATIVE_MESSAGES,
  NEUTRAL_MESSAGES,
  NEW_BUILDING_MESSAGES,
  pickRandom,
  randomGuestName,
} from '../data/guestMessages';

type FeedMessage = {
  id: number;
  emoji: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
};

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
      const name = randomGuestName();
      const satisfaction = stats.overallSatisfaction;
      const priceRatio = ticketPrice / 50;
      const rand = Math.random();

      let pool: typeof POSITIVE_MESSAGES;
      let type: FeedMessage['type'];

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

      const template = pickRandom(pool);
      setMessages(prev => [{
        id: messageIdRef.current++,
        emoji: template.emoji,
        text: `${name}: "${template.text}"`,
        type,
      }, ...prev].slice(0, 3));
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [guests, stats.overallSatisfaction, ticketPrice]);

  // Detect new buildings
  useEffect(() => {
    if (buildingCount > lastBuildingCountRef.current && lastBuildingCountRef.current > 0) {
      const template = pickRandom(NEW_BUILDING_MESSAGES);
      const newMsg: FeedMessage = {
        id: messageIdRef.current++,
        emoji: template.emoji,
        text: `${randomGuestName()}: "${template.text.replace('{building}', 'attraction')}"`,
        type: 'positive',
      };
      setMessages(prev => [newMsg, ...prev].slice(0, 3));
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
