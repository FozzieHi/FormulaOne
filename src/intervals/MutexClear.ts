import MutexManager from "../managers/MutexManager";
import { Constants } from "../utility/Constants";

setInterval(() => {
  [...MutexManager.mutexes]
    .filter(
      ([, value]) => Date.now() - value.lastUsed > 120000 && !value.mutex.isLocked()
    )
    .forEach(([key]) => MutexManager.mutexes.delete(key));
}, Constants.INTERVALS.MUTEXES);
