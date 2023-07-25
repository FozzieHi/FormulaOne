import { Snowflake } from "discord.js";
import { Document, WithId } from "mongodb";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Pun extends WithId<Document> {
  userId: Snowflake;
  guildId: Snowflake;
  punLength: number;
  punishedAt: number;
  amount: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
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
    amount: number,
  ) {
    this.userId = userId;
    this.guildId = guildId;
    this.punLength = punLength;
    this.punishedAt = Date.now();
    this.amount = amount;
  }
}
