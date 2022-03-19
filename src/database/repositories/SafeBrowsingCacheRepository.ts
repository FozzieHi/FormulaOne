import { BaseRepository } from "./BaseRepository";
import { SafeBrowsingCacheQuery } from "../queries/SafeBrowsingCacheQuery";
import { SafeBrowsingCache } from "../models/SafeBrowsingCache";

export class SafeBrowsingCacheRepository extends BaseRepository {
  async findEntry(hash: string) {
    return this.findOne(new SafeBrowsingCacheQuery(hash));
  }

  async insertEntry(
    hash: string,
    threatType: string,
    platformType: string,
    cacheLength: number
  ) {
    return this.insertOne(
      new SafeBrowsingCache(hash, threatType, platformType, cacheLength)
    );
  }

  async deleteEntry(hash: string) {
    return this.deleteOne(new SafeBrowsingCacheQuery(hash));
  }
}
