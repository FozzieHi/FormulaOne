import { Snowflake } from "discord.js";

export class GuildQuery {
  guildId: Snowflake;

  constructor(guildId: Snowflake) {
    this.guildId = guildId;
  }
}
