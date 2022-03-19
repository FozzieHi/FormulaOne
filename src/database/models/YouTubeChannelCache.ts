export class YouTubeChannelCache {
  videoId: string;

  videoTitle: string;

  channelId: string;

  cachedAt: number;

  constructor(videoId: string, videoTitle: string, channelId: string) {
    this.videoId = videoId;
    this.videoTitle = videoTitle;
    this.channelId = channelId;
    this.cachedAt = Date.now();
  }
}
