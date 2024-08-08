import { google } from "googleapis";
import db from "../database/index.js";
import { YouTubeChannelCache } from "../database/models/YouTubeChannelCache.js";
import { handleError } from "./Logger.js";

const youtube = google.youtube("v3");

export default async function lookupYouTubeChannels(ids: string[]) {
  const idsNotInCache: string[] = [];
  const results: { videoTitle: string; channelId: string }[] = [];

  const resultPromises = ids.map(
    (id) =>
      db.youtubeChannelCacheRepo?.findEntry(id) as Promise<YouTubeChannelCache | null>,
  );
  const resultsArray = await Promise.all(resultPromises);

  resultsArray.forEach((result, i) => {
    if (result) {
      results.push({
        videoTitle: result.videoTitle,
        channelId: result.channelId,
      });
    } else {
      idsNotInCache.push(ids[i]);
    }
  });

  if (idsNotInCache.length > 0) {
    const response = await youtube.videos
      .list({
        part: ["snippet"],
        id: idsNotInCache,
        key: process.env.YOUTUBE_DATA_API_KEY as string,
      })
      .catch((err) => handleError(err));

    if (response?.data?.items != null) {
      const cachePromises = response.data.items
        .map((item, i) => {
          const videoTitle = item.snippet?.title;
          const channelId = item.snippet?.channelId;
          if (videoTitle != null && channelId != null) {
            results.push({ videoTitle, channelId });
            return db.youtubeChannelCacheRepo?.insertEntry(
              idsNotInCache[i],
              videoTitle,
              channelId,
            );
          }
          return null;
        })
        .filter(Boolean);

      await Promise.all(cachePromises);
    }
  }

  return results;
}
