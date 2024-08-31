import { Snowflake } from "discord.js";
import { Binary, Document, WithId } from "mongodb";

export interface DBGuild extends WithId<Document> {
  guildId: Snowflake;
  caseNumber: number;
  lockdown: boolean;
  enabledChannels: Array<Snowflake>;
  roles: { muted?: string };
  youtubeChannels: { blocklisted: Array<string> };
  protectionActivatedAt: number;
  images: { guidelines: Binary | null };
}

export class Guild {
  guildId: Snowflake;

  caseNumber: number;

  lockdown: boolean;

  enabledChannels: Array<Snowflake>;

  roles: { muted?: string };

  youtubeChannels: { blocklisted: Array<string> };

  protectionActivatedAt: number;

  images: { guidelines: Binary | null };

  constructor(guildId: Snowflake) {
    this.guildId = guildId;
    this.caseNumber = 1;
    this.lockdown = false;
    this.enabledChannels = [];
    this.roles = {
      muted: undefined,
    };
    this.youtubeChannels = {
      blocklisted: [],
    };
    this.protectionActivatedAt = 0;
    this.images = { guidelines: null };
  }
}
