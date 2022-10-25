import { Snowflake } from "discord.js";
import { BaseRepository } from "./BaseRepository.js";
import { GuildQuery } from "../queries/GuildQuery.js";
import { DBGuild, Guild } from "../models/Guild.js";

export class GuildRepository extends BaseRepository {
  async anyGuild(guildId: Snowflake) {
    return this.any(new GuildQuery(guildId));
  }

  async getGuild(guildId: Snowflake): Promise<DBGuild> {
    const query = new GuildQuery(guildId);
    const fetchedGuild = await this.findOne(query);

    return (
      (fetchedGuild as DBGuild) ??
      (await this.findOneAndReplace(query, new Guild(guildId)))
    );
  }

  async updateGuild(guildId: Snowflake, update: object) {
    return this.updateOne(new GuildQuery(guildId), update);
  }

  async findGuildAndUpdate(guildId: Snowflake, update: object) {
    return this.findOneAndUpdate(new GuildQuery(guildId), update);
  }

  async upsertGuild(guildId: Snowflake, update: object) {
    if (await this.anyGuild(guildId)) {
      return this.updateGuild(guildId, update);
    }

    return this.updateOne(new Guild(guildId), update, true);
  }

  async findGuildAndUpsert(guildId: Snowflake, update: object) {
    if (await this.anyGuild(guildId)) {
      return this.findGuildAndUpdate(guildId, update);
    }

    return this.findOneAndUpdate(new Guild(guildId), update, true);
  }

  async deleteGuilds(guildId: Snowflake) {
    return this.deleteMany({ guildId });
  }
}
