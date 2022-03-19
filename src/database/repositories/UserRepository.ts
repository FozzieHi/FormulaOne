import { Snowflake } from "discord.js";
import { BaseRepository } from "./BaseRepository";
import { UserQuery } from "../queries/UserQuery";
import { DBUser, User } from "../models/User";

export class UserRepository extends BaseRepository {
  async anyUser(userId: Snowflake, guildId: Snowflake) {
    return this.any(new UserQuery(userId, guildId));
  }

  async getUser(userId: Snowflake, guildId: Snowflake): Promise<DBUser> {
    const query = new UserQuery(userId, guildId);
    const fetchedUser = await this.findOne(query);

    return (
      (fetchedUser as DBUser) ??
      (await this.findOneAndReplace(query, new User(userId, guildId)))
    );
  }

  async updateUser(userId: Snowflake, guildId: Snowflake, update: object) {
    return this.updateOne(new UserQuery(userId, guildId), update);
  }

  async findUserAndUpdate(userId: Snowflake, guildId: Snowflake, update: object) {
    return this.findOneAndUpdate(new UserQuery(userId, guildId), update);
  }

  async upsertUser(userId: Snowflake, guildId: Snowflake, update: object) {
    if (await this.anyUser(userId, guildId)) {
      return this.updateUser(userId, guildId, update);
    }

    return this.updateOne(new User(userId, guildId), update, true);
  }

  async findUserAndUpsert(userId: Snowflake, guildId: Snowflake, update: object) {
    if (await this.anyUser(userId, guildId)) {
      return this.findUserAndUpdate(userId, guildId, update);
    }

    return this.findOneAndUpdate(new User(userId, guildId), update, true);
  }

  async deleteUser(userId: Snowflake, guildId: Snowflake) {
    return this.deleteOne(new UserQuery(userId, guildId));
  }

  async deleteUsers(guildId: Snowflake) {
    return this.deleteMany({ guildId });
  }
}
