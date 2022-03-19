import { Snowflake } from "discord.js";
import { UserQuery } from "../queries/UserQuery";
import { Ban } from "../models/Ban";
import { BaseRepository } from "./BaseRepository";

export class BanRepository extends BaseRepository {
  async anyBan(userId: Snowflake, guildId: Snowflake) {
    return this.any(new UserQuery(userId, guildId));
  }

  async insertBan(userId: Snowflake, guildId: Snowflake, banLength: number) {
    return this.insertOne(new Ban(userId, guildId, banLength));
  }

  async findBan(userId: Snowflake, guildId: Snowflake) {
    return this.findMany(new UserQuery(userId, guildId));
  }

  async deleteBan(userId: Snowflake, guildId: Snowflake) {
    return this.deleteOne(new UserQuery(userId, guildId));
  }
}
