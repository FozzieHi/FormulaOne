/* eslint-disable @typescript-eslint/no-unused-vars */
import MutexService from "../services/MutexService";
import { Constants } from "../utility/Constants";

setInterval(() => {
  [...MutexService.mutexes]
    .filter(
      ([_, value]) => Date.now() - value.lastUsed > 120000 && !value.mutex.isLocked()
    )
    .forEach(([key]) => MutexService.mutexes.delete(key));
}, Constants.INTERVALS.MUTEXES);
