import { Guild, User } from "discord.js";
import { getDBUser } from "./DatabaseUtil";
import { StringUtil } from "./StringUtil";
import { NumberUtil } from "./NumberUtil";

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
      const pun = allPunishments[i];
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

    const fields: Array<string> = [];
    punsMap.forEach((punData, date) => {
      fields.push(new Date(date).toUTCString());
      const vals = [];
      for (let i = 0; i < punData.length - 1; i += 1) {
        if (NumberUtil.isEven(i)) {
          vals.push(`${StringUtil.boldify(`${punData[i]}:`)} ${punData[i + 1]}`);
        }
      }
      fields.push(vals.join("\n"));
    });
    return fields;
  }
}
