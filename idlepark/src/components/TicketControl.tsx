import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import { TICKET_PRICE_MIN, TICKET_PRICE_MAX, TICKET_PRICE_STEP } from '../data/constants';

export function TicketControl() {
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const setTicketPrice = useGameStore((s) => s.setTicketPrice);

  const canDecrease = ticketPrice > TICKET_PRICE_MIN;
  const canIncrease = ticketPrice < TICKET_PRICE_MAX;

  return (
    <div className="flex items-center gap-2 bg-park-bg rounded-lg px-2 py-1">
      <span className="text-lg">🎟️</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTicketPrice(ticketPrice - TICKET_PRICE_STEP)}
        disabled={!canDecrease}
        className={`w-7 h-7 rounded-full font-bold text-lg flex items-center justify-center ${
          canDecrease
            ? 'bg-park-card text-park-text active:bg-park-muted/50'
            : 'bg-park-muted/20 text-park-muted/50'
        }`}
      >
        -
      </motion.button>
      <span className="font-semibold min-w-[50px] text-center">
        {formatMoney(ticketPrice)}
      </span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTicketPrice(ticketPrice + TICKET_PRICE_STEP)}
        disabled={!canIncrease}
        className={`w-7 h-7 rounded-full font-bold text-lg flex items-center justify-center ${
          canIncrease
            ? 'bg-park-card text-park-text active:bg-park-muted/50'
            : 'bg-park-muted/20 text-park-muted/50'
        }`}
      >
        +
      </motion.button>
    </div>
  );
}
