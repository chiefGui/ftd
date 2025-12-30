import { create } from 'zustand';
import {
  POSITIVE_MESSAGES,
  NEGATIVE_MESSAGES,
  NEUTRAL_MESSAGES,
  NEW_BUILDING_MESSAGES,
  AMBIENT_MESSAGES,
  HIGH_PRICE_MESSAGES,
  LOW_PRICE_MESSAGES,
  UPGRADE_MESSAGES,
  CROWDED_MESSAGES,
  EMPTY_PARK_MESSAGES,
  pickRandom,
  randomGuestProfile,
  type MessageTemplate,
} from '../data/guestMessages';

export type Notification = {
  id: number;
  name: string;
  visitorId: string; // Used for procedural avatar generation
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
    maxGuests: number;
  }) => void;
  generateAmbientMessage: () => void;
  generateNewBuildingMessage: () => void;
  generateUpgradeMessage: () => void;
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
      notifications: [newNotification, ...state.notifications].slice(0, 50),
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

  generateContextualMessage: ({ satisfaction, priceRatio, guests, maxGuests }) => {
    if (guests < 1) return;

    const rand = Math.random();
    const profile = randomGuestProfile();
    let pool: MessageTemplate[];
    let type: Notification['type'];

    const crowdRatio = maxGuests > 0 ? guests / maxGuests : 0;

    // Special situation messages (15% chance each when applicable)
    if (rand < 0.12 && priceRatio > 1.5) {
      pool = HIGH_PRICE_MESSAGES;
      type = 'negative';
    } else if (rand < 0.12 && priceRatio < 0.8) {
      pool = LOW_PRICE_MESSAGES;
      type = 'positive';
    } else if (rand < 0.15 && crowdRatio > 0.8) {
      // Park is very crowded
      pool = CROWDED_MESSAGES;
      type = satisfaction > 0.5 ? 'neutral' : 'negative';
    } else if (rand < 0.15 && crowdRatio < 0.2 && guests > 0) {
      // Park is very empty
      pool = EMPTY_PARK_MESSAGES;
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
      name: profile.name,
      visitorId: profile.visitorId,
      emoji: template.emoji,
      text: template.text,
      type,
    });
  },

  generateAmbientMessage: () => {
    const profile = randomGuestProfile();
    const template = pickRandom(AMBIENT_MESSAGES);
    get().addNotification({
      name: profile.name,
      visitorId: profile.visitorId,
      emoji: template.emoji,
      text: template.text,
      type: 'neutral',
    });
  },

  generateNewBuildingMessage: () => {
    const profile = randomGuestProfile();
    const template = pickRandom(NEW_BUILDING_MESSAGES);
    get().addNotification({
      name: profile.name,
      visitorId: profile.visitorId,
      emoji: template.emoji,
      text: template.text,
      type: 'positive',
    });
  },

  generateUpgradeMessage: () => {
    const profile = randomGuestProfile();
    const template = pickRandom(UPGRADE_MESSAGES);
    get().addNotification({
      name: profile.name,
      visitorId: profile.visitorId,
      emoji: template.emoji,
      text: template.text,
      type: 'positive',
    });
  },

  markAsRead: () => set({ hasUnread: false }),

  clearLatest: () => set({ latestNotification: null }),
}));
