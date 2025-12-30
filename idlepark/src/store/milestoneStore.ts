import { create } from 'zustand';
import type { Milestone, MilestoneProgress, MilestoneRequirement } from '../core/types';
import { MILESTONES } from '../data/milestones';

// ============================================
// PURE REQUIREMENT EVALUATOR
// ============================================

const evaluateRequirement = (
  req: MilestoneRequirement,
  peakGuests: number
): boolean => {
  switch (req.type) {
    case 'peakGuests':
      return peakGuests >= req.amount;
    default:
      return false;
  }
};

// ============================================
// MILESTONE STORE
// ============================================

type MilestoneStore = MilestoneProgress & {
  // Pending unlocks for UI display
  pendingUnlocks: Milestone[];

  // Actions
  updatePeakGuests: (currentGuests: number) => void;
  checkMilestones: () => Milestone[];
  checkMilestonesWithPeak: (peakGuests: number) => Milestone[];
  clearPendingUnlocks: () => void;
  isCompleted: (milestoneId: string) => boolean;
  getProgress: () => MilestoneProgress;
  loadProgress: (progress: MilestoneProgress) => void;
  reset: () => void;
};

const createInitialProgress = (): MilestoneProgress => ({
  completedMilestones: [],
  completedAt: {},
  peakGuests: 0,
});

export const useMilestoneStore = create<MilestoneStore>((set, get) => ({
  ...createInitialProgress(),
  pendingUnlocks: [],

  updatePeakGuests: (currentGuests: number) => {
    const state = get();
    if (currentGuests > state.peakGuests) {
      set({ peakGuests: currentGuests });
    }
  },

  checkMilestones: () => {
    const { peakGuests } = get();
    return get().checkMilestonesWithPeak(peakGuests);
  },

  checkMilestonesWithPeak: (peakGuests: number) => {
    const { completedMilestones } = get();
    const newlyCompleted: Milestone[] = [];

    for (const milestone of MILESTONES) {
      // Skip already completed
      if (completedMilestones.includes(milestone.id)) continue;

      // Evaluate requirement
      if (evaluateRequirement(milestone.requirement, peakGuests)) {
        newlyCompleted.push(milestone);

        // Mark as complete
        set((state) => ({
          completedMilestones: [...state.completedMilestones, milestone.id],
          completedAt: {
            ...state.completedAt,
            [milestone.id]: Date.now(),
          },
        }));
      }
    }

    // Add to pending unlocks for UI display
    if (newlyCompleted.length > 0) {
      set((state) => ({
        pendingUnlocks: [...state.pendingUnlocks, ...newlyCompleted],
      }));
    }

    return newlyCompleted;
  },

  clearPendingUnlocks: () => {
    set({ pendingUnlocks: [] });
  },

  isCompleted: (milestoneId: string) => {
    return get().completedMilestones.includes(milestoneId);
  },

  getProgress: () => ({
    completedMilestones: get().completedMilestones,
    completedAt: get().completedAt,
    peakGuests: get().peakGuests,
  }),

  loadProgress: (progress: MilestoneProgress) => {
    set({
      completedMilestones: progress.completedMilestones ?? [],
      completedAt: progress.completedAt ?? {},
      peakGuests: progress.peakGuests ?? 0,
    });
  },

  reset: () => {
    set({ ...createInitialProgress(), pendingUnlocks: [] });
  },
}));
