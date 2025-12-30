import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationBubble() {
  const latestNotification = useNotificationStore((s) => s.latestNotification);
  const clearLatest = useNotificationStore((s) => s.clearLatest);

  return (
    <AnimatePresence>
      {latestNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={clearLatest}
          className="fixed bottom-24 left-4 right-4 z-30"
        >
          <div className={`
            rounded-2xl p-3 shadow-lg backdrop-blur-sm
            flex items-start gap-3 cursor-pointer
            ${latestNotification.type === 'positive'
              ? 'bg-park-success/90 text-white'
              : latestNotification.type === 'negative'
              ? 'bg-park-danger/90 text-white'
              : 'bg-park-card/95 text-park-text'}
          `}>
            {/* Balloon icon */}
            <motion.span
              className="text-2xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              🎈
            </motion.span>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm opacity-80">
                {latestNotification.name}
              </div>
              <div className="text-sm mt-0.5">
                <span className="mr-1">{latestNotification.emoji}</span>
                {latestNotification.text}
              </div>
            </div>

            {/* Tap to dismiss hint */}
            <span className="text-xs opacity-50 self-center">tap</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
