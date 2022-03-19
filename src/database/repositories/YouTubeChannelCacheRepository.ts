import { BaseRepository } from "./BaseRepository";
import { YouTubeChannelCacheQuery } from "../queries/YouTubeChannelCacheQuery";
import { YouTubeChannelCache } from "../models/YouTubeChannelCache";

export class YouTubeChannelCacheRepository extends BaseRepository {
  async findEntry(videoId: string) {
    return this.findOne(new YouTubeChannelCacheQuery(videoId));
  }

  async insertEntry(videoId: string, videoTitle: string, channelId: string) {
    return this.insertOne(new YouTubeChannelCache(videoId, videoTitle, channelId));
  }

  async deleteEntry(videoId: string) {
    return this.deleteOne(new YouTubeChannelCacheQuery(videoId));
  }
}
