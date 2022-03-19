import { Snowflake } from "discord.js";

export class Mute {
  userId: Snowflake;

  guildId: Snowflake;

  muteLength: number;

  mutedAt: number;

  constructor(userId: Snowflake, guildId: Snowflake, muteLength: number) {
    this.userId = userId;
    this.guildId = guildId;
    this.muteLength = muteLength;
    this.mutedAt = Date.now();
  }
}
