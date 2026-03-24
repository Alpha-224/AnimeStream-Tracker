/**
 * watchHistory.ts
 *
 * localStorage-backed watch history.
 * Stores per-anime, per-episode progress including timestamp within the episode.
 */

export interface WatchEntry {
  mal_id: number;
  title: string;
  imageUrl: string;
  score: number | null;
  type: string;
  episode: number;
  /** seconds into the episode */
  timestamp: number;
  /** total duration of the episode in seconds (set when known) */
  duration: number;
  updatedAt: number; // Date.now()
}

const KEY = 'anime_watch_history';

function readAll(): Record<number, WatchEntry> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data: Record<number, WatchEntry>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** Upsert or update a watch entry */
export function saveWatchEntry(entry: Omit<WatchEntry, 'updatedAt'>) {
  const all = readAll();
  all[entry.mal_id] = { ...entry, updatedAt: Date.now() };
  writeAll(all);
  window.dispatchEvent(new Event('watchHistoryChange'));
}

/** Get a single entry by mal_id */
export function getWatchEntry(mal_id: number): WatchEntry | null {
  return readAll()[mal_id] ?? null;
}

/** Get all entries sorted by most recently updated */
export function getAllWatchHistory(): WatchEntry[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Remove an entry */
export function removeWatchEntry(mal_id: number) {
  const all = readAll();
  delete all[mal_id];
  writeAll(all);
  window.dispatchEvent(new Event('watchHistoryChange'));
}

/** Progress as 0–100 percentage */
export function getProgress(entry: WatchEntry): number {
  if (!entry.duration || entry.duration <= 0) return 0;
  return Math.min(100, Math.round((entry.timestamp / entry.duration) * 100));
}
