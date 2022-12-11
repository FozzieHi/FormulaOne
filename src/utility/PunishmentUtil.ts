import { Guild, User } from "discord.js";
import { getDBUser } from "./DatabaseUtil.js";
import { isEven } from "./NumberUtil.js";
import { boldify } from "./StringUtil.js";

export class PunishmentUtil {
  public static async getHistory(
    user: User,
    guild: Guild,
    start = 0
  ): Promise<Array<string>> {
    const dbUser = await getDBUser(user.id, guild.id);
    const allPunishments = dbUser?.punishments.sort((a, b) => b.date - a.date);
    if (allPunishments == null) {
      return [];
    }
    const punsMap: Map<number, Array<string>> = new Map();
    const end = start + 5;
    for (let i = start; i < Math.min(allPunishments.length, end); i += 1) {
      const pun = allPunishments.at(i);
      if (pun != null) {
        const vals = ["Escalation", pun.escalation, "Moderator", pun.mod];
        if (pun.reason != null) {
          vals.push("Reason", pun.reason);
        }
        if (pun.messageContent != null) {
          vals.push("Content", pun.messageContent);
        }
        const channel = guild.channels.cache.get(pun.channelId);
        if (channel != null) {
          vals.push("Channel", channel.toString());
        }
        punsMap.set(pun.date, vals);
      }
    }

    const fields: Array<string> = [];
    punsMap.forEach((punData, date) => {
      fields.push(new Date(date).toUTCString());
      const vals = [];
      for (let i = 0; i < punData.length - 1; i += 1) {
        if (isEven(i)) {
          const name = punData.at(i)?.toString();
          const value = punData.at(i + 1)?.toString();
          if (name != null && value != null) {
            vals.push(`${boldify(`${name}:`)} ${value}`);
          }
        }
      }
      fields.push(vals.join("\n"));
    });
    return fields;
  }
}
