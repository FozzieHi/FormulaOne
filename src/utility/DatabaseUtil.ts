import { Snowflake } from "discord.js";
import db from "../database/index.js";
import { DBGuild } from "../database/models/Guild.js";
import { DBUser } from "../database/models/User.js";

export async function getDBGuild(guildId: Snowflake): Promise<DBGuild | undefined> {
  return db.guildRepo?.getGuild(guildId);
}

export async function getDBUser(
  userId: Snowflake,
  guildId: Snowflake
): Promise<DBUser | undefined> {
  return db.userRepo?.getUser(userId, guildId);
}
