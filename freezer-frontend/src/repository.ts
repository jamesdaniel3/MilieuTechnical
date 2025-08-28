import { get, set, del } from "idb-keyval";
import type { FreezerItem } from "./types";
import { Location } from "./types";
import { shouldSimulateFailure, getFailureDelay } from "./config";

const STORE_KEY_PREFIX = "freezer:item:";
const INDEX_ALL_KEYS = "freezer:index:all-keys";

// Custom error for simulated failures
export class SimulatedFailureError extends Error {
  constructor(message: string = "Simulated failure for testing") {
    super(message);
    this.name = "SimulatedFailureError";
  }
}

class FreezerRepository {
  private cacheById: Map<string, FreezerItem> = new Map();
  private initialized: boolean = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    const allKeys = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    if (allKeys.length > 0) {
      const items = await Promise.all(
        allKeys.map((id) => get<FreezerItem>(this.keyFor(id)))
      );
      for (const item of items) {
        if (item) this.cacheById.set(item.id, item);
      }
    } else {
      await set(INDEX_ALL_KEYS, []);
    }
    this.initialized = true;
  }

  private keyFor(id: string): string {
    return `${STORE_KEY_PREFIX}${id}`;
  }

  async create(item: FreezerItem): Promise<void> {
    // Simulate failure in development with delay
    if (shouldSimulateFailure()) {
      await new Promise(resolve => setTimeout(resolve, getFailureDelay()));
      throw new SimulatedFailureError("Simulated failure during item creation");
    }

    await this.ensureInitialized();
    await set(this.keyFor(item.id), item);
    this.cacheById.set(item.id, item);
    const all = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    if (!all.includes(item.id)) {
      all.push(item.id);
      await set(INDEX_ALL_KEYS, all);
    }
  }

  async update(item: FreezerItem): Promise<void> {
    // Simulate failure in development with delay
    if (shouldSimulateFailure()) {
      await new Promise(resolve => setTimeout(resolve, getFailureDelay()));
      throw new SimulatedFailureError("Simulated failure during item update");
    }

    await this.ensureInitialized();
    await set(this.keyFor(item.id), item);
    this.cacheById.set(item.id, item);
    const all = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    if (!all.includes(item.id)) {
      all.push(item.id);
      await set(INDEX_ALL_KEYS, all);
    }
  }

  async delete(id: string): Promise<void> {
    // Simulate failure in development with delay
    if (shouldSimulateFailure()) {
      await new Promise(resolve => setTimeout(resolve, getFailureDelay()));
      throw new SimulatedFailureError("Simulated failure during item deletion");
    }

    await this.ensureInitialized();
    await del(this.keyFor(id));
    this.cacheById.delete(id);
    const all = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    const next = all.filter((k) => k !== id);
    await set(INDEX_ALL_KEYS, next);
  }

  async getById(id: string): Promise<FreezerItem | undefined> {
    await this.ensureInitialized();
    const fromCache = this.cacheById.get(id);
    if (fromCache) return fromCache;
    const fromDb = await get<FreezerItem>(this.keyFor(id));
    if (fromDb) this.cacheById.set(id, fromDb);
    return fromDb ?? undefined;
  }

  async getAll(): Promise<FreezerItem[]> {
    await this.ensureInitialized();
    // read from cache for speed; hydrate if empty but index exists
    if (this.cacheById.size > 0) return Array.from(this.cacheById.values());
    const allKeys = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    if (allKeys.length === 0) return [];
    const items = await Promise.all(
      allKeys.map((id) => get<FreezerItem>(this.keyFor(id)))
    );
    const present = items.filter(Boolean) as FreezerItem[];
    for (const item of present) this.cacheById.set(item.id, item);
    return present;
  }

  async getByLocation(location: Location): Promise<FreezerItem[]> {
    const all = await this.getAll();
    return all.filter((i) => i.location === location);
  }

  async clearAll(): Promise<void> {
    // helper for tests/dev to reset store and cache
    const allKeys = (await get<string[]>(INDEX_ALL_KEYS)) ?? [];
    await Promise.all(allKeys.map((id) => del(this.keyFor(id))));
    await set(INDEX_ALL_KEYS, []);
    this.cacheById.clear();
    this.initialized = true;
  }
}

export const freezerRepository = new FreezerRepository();
