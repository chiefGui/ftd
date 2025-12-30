import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import { TICKET_PRICE_MIN, TICKET_PRICE_MAX, TICKET_PRICE_STEP, calculateDemand } from '../data/constants';

interface Props {
  onClose: () => void;
}

export function TicketPriceModal({ onClose }: Props) {
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const setTicketPrice = useGameStore((s) => s.setTicketPrice);

  const canDecrease = ticketPrice > TICKET_PRICE_MIN;
  const canIncrease = ticketPrice < TICKET_PRICE_MAX;
  const demand = Math.round(calculateDemand(ticketPrice) * 100);

  const handleDecrease = () => {
    if (canDecrease) setTicketPrice(ticketPrice - TICKET_PRICE_STEP);
  };

  const handleIncrease = () => {
    if (canIncrease) setTicketPrice(ticketPrice + TICKET_PRICE_STEP);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTicketPrice(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-park-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎟️</div>
          <h2 className="text-xl font-bold">Ticket Price</h2>
          <p className="text-park-muted text-sm mt-1">
            Higher prices mean more profit per guest, but fewer visitors
          </p>
        </div>

        {/* Price display with +/- buttons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrease}
            disabled={!canDecrease}
            className={`w-12 h-12 rounded-full font-bold text-2xl flex items-center justify-center ${
              canDecrease
                ? 'bg-park-bg text-park-text active:bg-park-muted/50'
                : 'bg-park-muted/20 text-park-muted/50'
            }`}
          >
            -
          </motion.button>
          <span className="text-4xl font-bold min-w-[100px] text-center">
            {formatMoney(ticketPrice)}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrease}
            disabled={!canIncrease}
            className={`w-12 h-12 rounded-full font-bold text-2xl flex items-center justify-center ${
              canIncrease
                ? 'bg-park-bg text-park-text active:bg-park-muted/50'
                : 'bg-park-muted/20 text-park-muted/50'
            }`}
          >
            +
          </motion.button>
        </div>

        {/* Slider */}
        <div className="mb-6 px-2">
          <input
            type="range"
            min={TICKET_PRICE_MIN}
            max={TICKET_PRICE_MAX}
            step={TICKET_PRICE_STEP}
            value={ticketPrice}
            onChange={handleSliderChange}
            className="w-full h-2 bg-park-bg rounded-lg appearance-none cursor-pointer accent-park-accent"
          />
          <div className="flex justify-between text-xs text-park-muted mt-1">
            <span>{formatMoney(TICKET_PRICE_MIN)}</span>
            <span>{formatMoney(TICKET_PRICE_MAX)}</span>
          </div>
        </div>

        {/* Demand indicator */}
        <div className="bg-park-bg rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-park-muted">Guest Demand</span>
            <span className={`font-bold ${
              demand >= 70 ? 'text-park-success' :
              demand >= 40 ? 'text-yellow-500' : 'text-park-danger'
            }`}>
              {demand}%
            </span>
          </div>
          <div className="w-full h-2 bg-park-muted/30 rounded-full mt-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                demand >= 70 ? 'bg-park-success' :
                demand >= 40 ? 'bg-yellow-500' : 'bg-park-danger'
              }`}
              initial={false}
              animate={{ width: `${demand}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <p className="text-xs text-park-muted mt-2">
            {demand >= 70 ? 'Great! Lots of guests want to visit.' :
             demand >= 40 ? 'Moderate demand. Consider lowering prices.' :
             'Low demand. Fewer guests are willing to pay this much.'}
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full bg-park-accent text-white py-3 rounded-xl font-semibold"
        >
          Done
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
