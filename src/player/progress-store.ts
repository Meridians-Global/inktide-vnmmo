import { coercePrefs, type ReaderPrefs } from '../core/reader-prefs';
import type { ReaderState } from '../core/reader-state';

export type ProgressRecord = {
  experienceId: string;
  state: ReaderState;
  savedAt: string;
};

const DB_NAME = 'vnmmo';
const DB_VERSION = 2;
const STORE = 'progress';
const PREFS_STORE = 'prefs';
const PREFS_KEY = 'reader';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Per-Experience reader progress in IndexedDB. Every method degrades to a no-op/null when storage is unavailable. */
export class ProgressStore {
  private db: Promise<IDBDatabase | null>;

  constructor() {
    this.db = this.open();
  }

  private open(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'experienceId' });
          if (!req.result.objectStoreNames.contains(PREFS_STORE)) req.result.createObjectStore(PREFS_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async all(): Promise<Map<string, ProgressRecord>> {
    const db = await this.db;
    if (!db) return new Map();
    try {
      const records = await request(db.transaction(STORE, 'readonly').objectStore(STORE).getAll()) as ProgressRecord[];
      return new Map(records.map((record) => [record.experienceId, record]));
    } catch {
      return new Map();
    }
  }

  async get(experienceId: string): Promise<ProgressRecord | null> {
    const db = await this.db;
    if (!db) return null;
    try {
      return (await request(db.transaction(STORE, 'readonly').objectStore(STORE).get(experienceId)) as ProgressRecord | undefined) ?? null;
    } catch {
      return null;
    }
  }

  async put(record: Omit<ProgressRecord, 'savedAt'>): Promise<void> {
    const db = await this.db;
    if (!db) return;
    try {
      await request(db.transaction(STORE, 'readwrite').objectStore(STORE).put({ ...record, savedAt: new Date().toISOString() } satisfies ProgressRecord));
    } catch {
      // Progress is a convenience; a blocked store never blocks reading.
    }
  }

  async prefs(): Promise<ReaderPrefs> {
    const db = await this.db;
    if (!db) return coercePrefs(undefined);
    try {
      return coercePrefs(await request(db.transaction(PREFS_STORE, 'readonly').objectStore(PREFS_STORE).get(PREFS_KEY)));
    } catch {
      return coercePrefs(undefined);
    }
  }

  async putPrefs(prefs: ReaderPrefs): Promise<void> {
    const db = await this.db;
    if (!db) return;
    try {
      await request(db.transaction(PREFS_STORE, 'readwrite').objectStore(PREFS_STORE).put(prefs, PREFS_KEY));
    } catch {
      // see put
    }
  }

  async clear(experienceId: string): Promise<void> {
    const db = await this.db;
    if (!db) return;
    try {
      await request(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(experienceId));
    } catch {
      // see put
    }
  }
}
