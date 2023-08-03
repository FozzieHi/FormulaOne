import { Mutex } from "async-mutex";
import { Snowflake } from "discord.js";

type MutexMap = Map<Snowflake, { mutex: Mutex; lastUsed: number }>;

function getMutex(id: Snowflake, map: MutexMap) {
  const now = Date.now();
  const mutex = map.get(id)?.mutex;
  if (mutex != null) {
    map.set(id, { mutex, lastUsed: now });
    return mutex;
  }
  const newMutex = new Mutex();
  map.set(id, { mutex: newMutex, lastUsed: now });
  return newMutex;
}

export default new (class MutexManager {
  userMutexes: MutexMap;

  userPublicMutexes: MutexMap;

  interactionMutexes: MutexMap;

  guildMutex: Mutex;

  constructor() {
    this.userMutexes = new Map();
    this.userPublicMutexes = new Map();
    this.interactionMutexes = new Map();
    this.guildMutex = new Mutex();
  }

  public getUserMutex(id: Snowflake) {
    return getMutex(id, this.userMutexes);
  }

  public getUserPublicMutex(id: Snowflake) {
    return getMutex(id, this.userPublicMutexes);
  }

  public getInteractionMutex(id: Snowflake) {
    return getMutex(id, this.interactionMutexes);
  }

  public getGuildMutex() {
    return this.guildMutex;
  }
})();
