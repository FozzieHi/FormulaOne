/* eslint-disable @typescript-eslint/no-unused-vars */
import MutexManager from "../managers/MutexManager";
import { Constants } from "../utility/Constants";

setInterval(() => {
  [...MutexManager.mutexes]
    .filter(
      ([_, value]) => Date.now() - value.lastUsed > 120000 && !value.mutex.isLocked()
    )
    .forEach(([key]) => MutexManager.mutexes.delete(key));
}, Constants.INTERVALS.MUTEXES);
