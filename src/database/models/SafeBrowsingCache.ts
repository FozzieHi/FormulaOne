export class SafeBrowsingCache {
  hash: string;

  threatType: string;

  platformType: string;

  cacheLength: number;

  cachedAt: number;

  constructor(
    hash: string,
    threatType: string,
    platformType: string,
    cacheLength: number,
  ) {
    this.hash = hash;
    this.threatType = threatType;
    this.platformType = platformType;
    this.cacheLength = cacheLength;
    this.cachedAt = Date.now();
  }
}
