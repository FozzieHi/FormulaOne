import { Snowflake } from "discord.js";

export class Pun {
  userId: Snowflake;

  guildId: Snowflake;

  punLength: number;

  punishedAt: number;

  amount: number;

  constructor(
    userId: Snowflake,
    guildId: Snowflake,
    punLength: number,
    amount: number
  ) {
    this.userId = userId;
    this.guildId = guildId;
    this.punLength = punLength;
    this.punishedAt = Date.now();
    this.amount = amount;
  }
}
