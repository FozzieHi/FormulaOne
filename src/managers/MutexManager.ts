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

  publicUserMutexes: MutexMap;

  guildMutex: Mutex;

  constructor() {
    this.userMutexes = new Map();
    this.publicUserMutexes = new Map();
    this.guildMutex = new Mutex();
  }

  public getUserMutex(id: Snowflake) {
    return getMutex(id, this.userMutexes);
  }

  public getPublicUserMutex(id: Snowflake) {
    return getMutex(id, this.publicUserMutexes);
  }

  public getGuildMutex() {
    return this.guildMutex;
  }
})();
