import { Snowflake } from "discord.js";
import { Document } from "mongodb";
import { BaseRepository } from "./BaseRepository";
import { GuildQuery } from "../queries/GuildQuery";
import { Guild } from "../models/Guild";

export class GuildRepository extends BaseRepository {
  async anyGuild(guildId: Snowflake) {
    return this.any(new GuildQuery(guildId));
  }

  async getGuild(guildId: Snowflake): Promise<Document> {
    const query = new GuildQuery(guildId);
    const fetchedGuild = await this.findOne(query);

    return fetchedGuild ?? (await this.findOneAndReplace(query, new Guild(guildId)));
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
