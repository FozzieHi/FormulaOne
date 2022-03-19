import { Snowflake } from "discord.js";

export class Ban {
  userId: Snowflake;

  guildId: Snowflake;

  banLength: number;

  bannedAt: number;

  constructor(userId: Snowflake, guildId: Snowflake, banLength: number) {
    this.userId = userId;
    this.guildId = guildId;
    this.banLength = banLength;
    this.bannedAt = Date.now();
  }
}
