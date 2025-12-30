import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';
import { getAvatarUrl } from '../data/guestMessages';

export function NotificationBubble() {
  const latestNotification = useNotificationStore((s) => s.latestNotification);
  const clearLatest = useNotificationStore((s) => s.clearLatest);

  return (
    <AnimatePresence>
      {latestNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={clearLatest}
          className="fixed bottom-24 left-4 right-4 z-30"
        >
          <div className={`
            rounded-2xl p-3 shadow-xl backdrop-blur-md border
            flex items-center gap-3 cursor-pointer
            ${latestNotification.type === 'positive'
              ? 'bg-park-success/95 border-park-success/50 text-white'
              : latestNotification.type === 'negative'
              ? 'bg-park-danger/95 border-park-danger/50 text-white'
              : 'bg-park-card/95 border-park-muted/30 text-park-text'}
          `}>
            {/* Avatar */}
            <div className={`
              w-10 h-10 rounded-full overflow-hidden shrink-0
              ${latestNotification.type === 'positive'
                ? 'bg-white/20'
                : latestNotification.type === 'negative'
                ? 'bg-white/20'
                : 'bg-park-muted/20'}
            `}>
              <img
                src={getAvatarUrl(latestNotification.visitorId)}
                alt={latestNotification.name}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Name and handle */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {latestNotification.name}
                </span>
                <span className={`text-xs ${
                  latestNotification.type === 'neutral' ? 'text-park-muted' : 'opacity-60'
                }`}>
                  @{latestNotification.name.toLowerCase()}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm mt-0.5 leading-snug">
                <span className="mr-1">{latestNotification.emoji}</span>
                {latestNotification.text}
              </p>
            </div>

            {/* Dismiss indicator */}
            <div className={`
              text-xs px-2 py-1 rounded-full shrink-0
              ${latestNotification.type === 'neutral'
                ? 'bg-park-muted/20 text-park-muted'
                : 'bg-white/20'}
            `}>
              tap
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
