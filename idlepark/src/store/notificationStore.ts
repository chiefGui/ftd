import { create } from 'zustand';
import {
  POSITIVE_MESSAGES,
  NEGATIVE_MESSAGES,
  NEUTRAL_MESSAGES,
  NEW_BUILDING_MESSAGES,
  AMBIENT_MESSAGES,
  HIGH_PRICE_MESSAGES,
  LOW_PRICE_MESSAGES,
  pickRandom,
  randomGuestName,
  type MessageTemplate,
} from '../data/guestMessages';

export type Notification = {
  id: number;
  name: string;
  emoji: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  timestamp: number;
};

type NotificationStore = {
  notifications: Notification[];
  latestNotification: Notification | null;
  hasUnread: boolean;

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  generateContextualMessage: (context: {
    satisfaction: number;
    priceRatio: number;
    guests: number;
  }) => void;
  generateAmbientMessage: () => void;
  generateNewBuildingMessage: () => void;
  markAsRead: () => void;
  clearLatest: () => void;
};

let nextId = 1;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  latestNotification: null,
  hasUnread: false,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: nextId++,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      latestNotification: newNotification,
      hasUnread: true,
    }));

    // Auto-clear latest after 4 seconds
    setTimeout(() => {
      const current = get().latestNotification;
      if (current?.id === newNotification.id) {
        set({ latestNotification: null });
      }
    }, 4000);
  },

  generateContextualMessage: ({ satisfaction, priceRatio, guests }) => {
    if (guests < 1) return;

    const rand = Math.random();
    let pool: MessageTemplate[];
    let type: Notification['type'];

    // Price-specific messages occasionally
    if (rand < 0.15 && priceRatio > 1.5) {
      pool = HIGH_PRICE_MESSAGES;
      type = 'negative';
    } else if (rand < 0.15 && priceRatio < 0.8) {
      pool = LOW_PRICE_MESSAGES;
      type = 'positive';
    }
    // Satisfaction-based messages
    else if (satisfaction < 0.4) {
      pool = rand < 0.8 ? NEGATIVE_MESSAGES : NEUTRAL_MESSAGES;
      type = rand < 0.8 ? 'negative' : 'neutral';
    } else if (satisfaction > 0.7) {
      pool = rand < 0.75 ? POSITIVE_MESSAGES : NEUTRAL_MESSAGES;
      type = rand < 0.75 ? 'positive' : 'neutral';
    } else {
      // Mixed satisfaction
      if (rand < 0.35) {
        pool = POSITIVE_MESSAGES;
        type = 'positive';
      } else if (rand < 0.65) {
        pool = NEUTRAL_MESSAGES;
        type = 'neutral';
      } else {
        pool = NEGATIVE_MESSAGES;
        type = 'negative';
      }
    }

    const template = pickRandom(pool);
    get().addNotification({
      name: randomGuestName(),
      emoji: template.emoji,
      text: template.text,
      type,
    });
  },

  generateAmbientMessage: () => {
    const template = pickRandom(AMBIENT_MESSAGES);
    get().addNotification({
      name: randomGuestName(),
      emoji: template.emoji,
      text: template.text,
      type: 'neutral',
    });
  },

  generateNewBuildingMessage: () => {
    const template = pickRandom(NEW_BUILDING_MESSAGES);
    get().addNotification({
      name: randomGuestName(),
      emoji: template.emoji,
      text: template.text,
      type: 'positive',
    });
  },

  markAsRead: () => set({ hasUnread: false }),

  clearLatest: () => set({ latestNotification: null }),
}));
