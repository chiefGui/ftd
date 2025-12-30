import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useNotificationStore } from '../store/notificationStore';
import { formatMoney } from '../utils/formatters';
import { getAvatarUrl } from '../data/guestMessages';
import { StatsDashboard } from './StatsDashboard';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const totalEarnings = useGameStore((s) => s.totalEarnings);
  const gameStartedAt = useGameStore((s) => s.gameStartedAt);
  const resetGame = useGameStore((s) => s.resetGame);

  const notifications = useNotificationStore((s) => s.notifications);
  const hasUnread = useNotificationStore((s) => s.hasUnread);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const handleOpen = () => {
    setIsOpen(true);
    markAsRead();
  };

  const handleReset = () => {
    if (confirmReset) {
      resetGame();
      setConfirmReset(false);
      setIsOpen(false);
    } else {
      setConfirmReset(true);
    }
  };

  const formatPlayTime = () => {
    const seconds = Math.floor((Date.now() - gameStartedAt) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <>
      {/* Hamburger button with notification dot */}
      <button
        onClick={handleOpen}
        className="p-2 -mr-2 flex flex-col gap-1 opacity-70 active:opacity-100 relative"
      >
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-park-accent rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setConfirmReset(false); }}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-park-card z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-park-muted/30 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => { setIsOpen(false); setConfirmReset(false); }}
                  className="text-2xl text-park-muted"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Stats Dashboard Button */}
                <div className="p-4 border-b border-park-muted/30">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsOpen(false);
                      setShowStats(true);
                    }}
                    className="w-full flex items-center gap-3 bg-gradient-to-r from-park-accent/20 to-park-success/20 hover:from-park-accent/30 hover:to-park-success/30 border border-park-accent/30 rounded-xl p-4 transition-colors"
                  >
                    <span className="text-2xl">📊</span>
                    <div className="text-left">
                      <div className="font-semibold">Park Analytics</div>
                      <div className="text-xs text-park-muted">View detailed stats & insights</div>
                    </div>
                    <span className="ml-auto text-park-muted">→</span>
                  </motion.button>
                </div>

                {/* Guest Feed */}
                <div className="p-4 border-b border-park-muted/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">💬</span>
                    <span className="text-xs text-park-muted uppercase tracking-wide font-medium">Guest Feed</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="text-3xl mb-2 block">🎈</span>
                      <p className="text-sm text-park-muted">No messages yet...</p>
                      <p className="text-xs text-park-muted mt-1">Build rides to attract guests!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 12).map((notif) => (
                        <div
                          key={notif.id}
                          className="flex gap-3"
                        >
                          {/* Avatar */}
                          <div className={`
                            w-9 h-9 rounded-full overflow-hidden shrink-0
                            ${notif.type === 'positive'
                              ? 'bg-park-success/20'
                              : notif.type === 'negative'
                              ? 'bg-park-danger/20'
                              : 'bg-park-muted/20'}
                          `}>
                            <img
                              src={getAvatarUrl(notif.visitorId)}
                              alt={notif.name}
                              className="w-full h-full"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-sm ${
                                notif.type === 'positive'
                                  ? 'text-park-success'
                                  : notif.type === 'negative'
                                  ? 'text-park-danger'
                                  : 'text-park-text'
                              }`}>
                                {notif.name}
                              </span>
                              <span className="text-xs text-park-muted">
                                @{notif.name.toLowerCase()}
                              </span>
                              <span className="text-xs text-park-muted">·</span>
                              <span className="text-xs text-park-muted">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-park-text mt-0.5 leading-relaxed">
                              <span className="mr-1">{notif.emoji}</span>
                              {notif.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-park-muted/30">
                  <div className="text-xs text-park-muted uppercase tracking-wide mb-3">Stats</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-park-muted text-sm">Play time</span>
                      <span className="font-medium">{formatPlayTime()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-park-muted text-sm">Total earned</span>
                      <span className="font-medium text-park-success">{formatMoney(totalEarnings)}</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4">
                  <div className="text-xs text-park-muted uppercase tracking-wide mb-3">Danger Zone</div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      confirmReset
                        ? 'bg-park-danger text-white'
                        : 'bg-park-danger/20 text-park-danger'
                    }`}
                  >
                    {confirmReset ? 'Tap again to confirm' : 'Reset Game'}
                  </motion.button>
                  {confirmReset && (
                    <p className="text-xs text-park-muted text-center mt-2">
                      This will delete all progress!
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-park-muted/30 shrink-0">
                <p className="text-xs text-park-muted text-center">
                  Idlepark v0.1
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats Dashboard Modal */}
      <AnimatePresence>
        {showStats && (
          <StatsDashboard onClose={() => setShowStats(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
