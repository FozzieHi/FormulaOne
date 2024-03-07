import { Snowflake } from "discord.js";
import { Document, ObjectId } from "mongodb";

export interface PunInterface extends Document {
  _id: ObjectId;
  userId: Snowflake;
  guildId: Snowflake;
  punLength: number;
  punishedAt: number;
  amount: number;
}

export class Pun implements PunInterface {
  _id!: ObjectId;

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
