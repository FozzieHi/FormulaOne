import { Snowflake } from "discord.js";

export class Guild {
  guildId: Snowflake;

  caseNumber: number;

  lockdown: boolean;

  enabledChannels: Array<Snowflake>;

  youtubeChannels: { blocklisted: Array<string> };

  constructor(guildId: Snowflake) {
    this.guildId = guildId;
    this.caseNumber = 1;
    this.lockdown = false;
    this.enabledChannels = [];
    this.youtubeChannels = {
      blocklisted: [],
    };
  }
}
