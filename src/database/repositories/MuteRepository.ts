import { Snowflake } from "discord.js";
import { BaseRepository } from "./BaseRepository.js";
import { UserQuery } from "../queries/UserQuery.js";
import { Mute } from "../models/Mute.js";

export class MuteRepository extends BaseRepository {
  async anyMute(userId: Snowflake, guildId: Snowflake) {
    return this.any(new UserQuery(userId, guildId));
  }

  async insertMute(userId: Snowflake, guildId: Snowflake, muteLength: number) {
    return this.insertOne(new Mute(userId, guildId, muteLength));
  }

  async findMute(userId: Snowflake, guildId: Snowflake) {
    return this.findMany(new UserQuery(userId, guildId));
  }

  async deleteMute(userId: Snowflake, guildId: Snowflake) {
    return this.deleteOne(new UserQuery(userId, guildId));
  }
}
