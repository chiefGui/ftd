import Dexie, { type EntityTable } from 'dexie';
import type { GameState, MilestoneProgress } from '../core/types';

interface SaveRecord {
  id: string;
  state: GameState;
  milestones?: MilestoneProgress;
  savedAt: number;
}

const db = new Dexie('IdleparkDB') as Dexie & {
  saves: EntityTable<SaveRecord, 'id'>;
};

db.version(1).stores({
  saves: 'id',
});

export async function saveGame(
  state: GameState,
  milestones?: MilestoneProgress
): Promise<void> {
  await db.saves.put({
    id: 'main',
    state,
    milestones,
    savedAt: Date.now(),
  });
}

export interface LoadedSave {
  state: GameState;
  milestones?: MilestoneProgress;
}

export async function loadGame(): Promise<LoadedSave | null> {
  const record = await db.saves.get('main');
  if (!record) return null;
  return {
    state: record.state,
    milestones: record.milestones,
  };
}

export async function clearSave(): Promise<void> {
  await db.saves.delete('main');
}

export { db };
