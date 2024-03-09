import MutexManager from "../managers/MutexManager.js";
import { Constants } from "../utility/Constants.js";

setInterval(() => {
  const currentTime = Date.now();

  MutexManager.userMutexes.forEach((value, key) => {
    if (currentTime - value.lastUsed > 120000 && !value.mutex.isLocked()) {
      MutexManager.userMutexes.delete(key);
    }
  });
}, Constants.INTERVALS.MUTEX_CLEAR);
