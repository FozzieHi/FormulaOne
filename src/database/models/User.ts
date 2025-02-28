import { Snowflake } from "discord.js";
import { Document, WithId } from "mongodb";

export interface DBUser extends WithId<Document> {
  userId: Snowflake;
  guildId: Snowflake;
  currentPunishment: number;
  warns: number;
  mutes: number;
  kicks: number;
  bans: number;
  punishments: Array<Punishment>;
  blocklisted: boolean;
  leftRoles: Array<Snowflake>;
  experience: number;
  level: number;
}

export type Punishment = {
  date: number;
  escalation: string;
  reason: string;
  mod: string;
  channelId: Snowflake;
  messageContent?: string;
};

export class User {
  userId: Snowflake;

  guildId: Snowflake;

  /** The amount of active Punishments. */
  currentPunishment: number;

  /** All-Time warnings this User received. */
  warns: number;

  /** All-Time mutes this User received. */
  mutes: number;

  /** All-Time kicks this User received. */
  kicks: number;

  /** All-Time bans this User received. */
  bans: number;

  punishments: Array<Punishment>;

  blocklisted: boolean;

  /** Roles this User had when they left the Guild. */
  leftRoles: Array<Snowflake>;

  experience: number;

  level: number;

  constructor(userId: Snowflake, guildId: Snowflake) {
    this.userId = userId;
    this.guildId = guildId;
    this.currentPunishment = 0;
    this.warns = 0;
    this.mutes = 0;
    this.kicks = 0;
    this.bans = 0;
    this.punishments = [];
    this.blocklisted = false;
    this.leftRoles = [];
    this.experience = 0;
    this.level = 1;
  }
}
