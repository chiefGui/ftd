import Dexie, { type EntityTable } from 'dexie';
import type { GameState } from '../core/types';

interface SaveRecord {
  id: string;
  state: GameState;
  savedAt: number;
}

const db = new Dexie('IdleparkDB') as Dexie & {
  saves: EntityTable<SaveRecord, 'id'>;
};

db.version(1).stores({
  saves: 'id',
});

export async function saveGame(state: GameState): Promise<void> {
  await db.saves.put({
    id: 'main',
    state,
    savedAt: Date.now(),
  });
}

export async function loadGame(): Promise<GameState | null> {
  const record = await db.saves.get('main');
  return record?.state ?? null;
}

export async function clearSave(): Promise<void> {
  await db.saves.delete('main');
}

export { db };
