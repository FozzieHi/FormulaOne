import { Snowflake } from "discord.js";
import { Document, WithId } from "mongodb";

export interface DBGuild extends WithId<Document> {
  guildId: Snowflake;
  caseNumber: number;
  lockdown: boolean;
  enabledChannels: Array<Snowflake>;
  youtubeChannels: { blocklisted: Array<string> };
  protectionActivatedAt: number;
}

export class Guild {
  guildId: Snowflake;

  caseNumber: number;

  lockdown: boolean;

  enabledChannels: Array<Snowflake>;

  youtubeChannels: { blocklisted: Array<string> };

  protectionActivatedAt: number;

  constructor(guildId: Snowflake) {
    this.guildId = guildId;
    this.caseNumber = 1;
    this.lockdown = false;
    this.enabledChannels = [];
    this.youtubeChannels = {
      blocklisted: [],
    };
    this.protectionActivatedAt = 0;
  }
}
