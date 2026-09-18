import type { ReaderState } from '../core/reader-state';

export type ProgressRecord = {
  experienceId: string;
  state: ReaderState;
  savedAt: string;
};

const DB_NAME = 'vnmmo';
const DB_VERSION = 1;
const STORE = 'progress';

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
