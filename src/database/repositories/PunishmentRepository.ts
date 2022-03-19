import { Snowflake } from "discord.js";
import { BaseRepository } from "./BaseRepository";
import { UserQuery } from "../queries/UserQuery";
import { Pun } from "../models/Pun";

export class PunishmentRepository extends BaseRepository {
  async anyPun(userId: Snowflake, guildId: Snowflake) {
    return this.any(new UserQuery(userId, guildId));
  }

  async insertPun(userId: Snowflake, guildId: Snowflake, amount: number) {
    return this.insertOne(new Pun(userId, guildId, 2.592e9, amount)); // 2.592e+9 = 30 days.
  }

  async findPun(userId: Snowflake, guildId: Snowflake) {
    return this.findMany(new UserQuery(userId, guildId));
  }

  async deletePun(userId: Snowflake, guildId: Snowflake) {
    return this.deleteOne(new UserQuery(userId, guildId));
  }
}
