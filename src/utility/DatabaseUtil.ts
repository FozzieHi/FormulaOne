import { Snowflake } from "discord.js";
import db from "../database";
import { DBGuild } from "../database/models/Guild";
import { DBUser } from "../database/models/User";

export async function getDBGuild(guildId: Snowflake): Promise<DBGuild | undefined> {
  return db.guildRepo?.getGuild(guildId);
}

export async function getDBUser(
  userId: Snowflake,
  guildId: Snowflake
): Promise<DBUser | undefined> {
  return db.userRepo?.getUser(userId, guildId);
}
