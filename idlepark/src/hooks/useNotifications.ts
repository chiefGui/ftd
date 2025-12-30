import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNotificationStore } from '../store/notificationStore';

export function useNotifications() {
  const lastBuildingCountRef = useRef(0);

  const guests = useGameStore((s) => s.guests);
  const ticketPrice = useGameStore((s) => s.ticketPrice);
  const slots = useGameStore((s) => s.slots);
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);

  const generateContextualMessage = useNotificationStore((s) => s.generateContextualMessage);
  const generateAmbientMessage = useNotificationStore((s) => s.generateAmbientMessage);
  const generateNewBuildingMessage = useNotificationStore((s) => s.generateNewBuildingMessage);

  const stats = calculateParkStats();
  const buildingCount = slots.filter((s) => s.buildingId).length;

  // Generate contextual messages based on park state
  useEffect(() => {
    if (guests < 1) return;

    const interval = setInterval(() => {
      generateContextualMessage({
        satisfaction: stats.overallSatisfaction,
        priceRatio: ticketPrice / 50,
        guests,
      });
    }, 4000 + Math.random() * 3000); // 4-7 seconds

    return () => clearInterval(interval);
  }, [guests, stats.overallSatisfaction, ticketPrice, generateContextualMessage]);

  // Generate ambient messages when there are no guests
  useEffect(() => {
    if (guests >= 1) return;
    if (buildingCount === 0) return;

    const interval = setInterval(() => {
      generateAmbientMessage();
    }, 8000 + Math.random() * 4000); // 8-12 seconds when idle

    return () => clearInterval(interval);
  }, [guests, buildingCount, generateAmbientMessage]);

  // Detect new buildings
  useEffect(() => {
    if (buildingCount > lastBuildingCountRef.current && lastBuildingCountRef.current > 0) {
      generateNewBuildingMessage();
    }
    lastBuildingCountRef.current = buildingCount;
  }, [buildingCount, generateNewBuildingMessage]);
}
