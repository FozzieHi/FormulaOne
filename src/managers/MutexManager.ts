import { Mutex } from "async-mutex";
import { Snowflake } from "discord.js";

export default new (class MutexManager {
  mutexes: Map<Snowflake, { mutex: Mutex; lastUsed: number }>;

  constructor() {
    this.mutexes = new Map();
  }

  public getMutex(id: Snowflake) {
    const now = Date.now();
    const mutex = this.mutexes.get(id)?.mutex;
    if (mutex != null) {
      this.mutexes.set(id, { mutex, lastUsed: now });
      return mutex;
    }
    const newMutex = new Mutex();
    this.mutexes.set(id, { mutex: newMutex, lastUsed: now });
    return newMutex;
  }
})();
