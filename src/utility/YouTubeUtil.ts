import { google } from "googleapis";
import db from "../database/index.js";
import { YouTubeChannelCache } from "../database/models/YouTubeChannelCache.js";
import { handleError } from "./Logger.js";

const youtube = google.youtube("v3");

export default async function lookupYouTubeChannels(ids: string[]) {
  let idsFiltered = ids;
  const results = [];

  for (let i = 0; i < ids.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const result = (await db.youtubeChannelCacheRepo?.findEntry(
      ids[i],
    )) as YouTubeChannelCache;
    if (result) {
      results.push({
        videoTitle: result.videoTitle,
        channelId: result.channelId,
      });
      idsFiltered = idsFiltered.filter((item) => item !== ids[i]);
    }
  }

  if (idsFiltered.length > 0) {
    const request = {
      part: ["snippet"],
      id: idsFiltered,
      key: process.env.YOUTUBE_DATA_API_KEY as string,
    };

    const response = await youtube.videos
      .list(request)
      .catch((err) => handleError(err));

    if (response?.data?.items) {
      for (let i = 0; i < response.data.items.length; i += 1) {
        const videoTitle = response.data.items[i].snippet?.title;
        const channelId = response.data.items[i].snippet?.channelId;
        if (videoTitle && channelId) {
          // eslint-disable-next-line no-await-in-loop
          await db.youtubeChannelCacheRepo?.insertEntry(
            idsFiltered[i],
            videoTitle,
            channelId,
          );
          results.push({ videoTitle, channelId });
        }
      }
    }
  }

  return results;
}
