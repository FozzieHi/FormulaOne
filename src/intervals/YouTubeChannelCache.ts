import { ObjectId } from "mongodb";
import { Constants } from "../utility/Constants.js";
import db from "../database/index.js";
import { handleError } from "../utility/Logger.js";

setInterval(() => {
  (async function run() {
    const entries = (await db.youtubeChannelCacheRepo?.findMany()) || [];

    for (let i = 0; i < entries.length; i += 1) {
      if (entries[i].cachedAt + 1.21e9 > Date.now()) {
        // 1.21e+9 = 14 days.
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await db.youtubeChannelCacheRepo?.deleteById(entries[i]._id as ObjectId);
    }
  })().catch((err) => handleError(err));
}, Constants.INTERVALS.YOUTUBE_CHANNEL_CACHE);
