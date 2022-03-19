import { Snowflake } from "discord.js";

export class UserQuery {
  userId: Snowflake;

  guildId: Snowflake;

  constructor(userId: Snowflake, guildId: Snowflake) {
    this.userId = userId;
    this.guildId = guildId;
  }
}
