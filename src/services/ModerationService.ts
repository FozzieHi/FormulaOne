import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  MessageEmbedOptions,
  User,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants } from "../utility/Constants";
import { send } from "../utility/Sender";
import { NumberUtil } from "../utility/NumberUtil";

export class ModerationService {
  public static getPermLevel(member: GuildMember) {
    const modRoles = Constants.MOD_ROLES.sort(
      (a, b) => a.permissionLevel - b.permissionLevel
    );

    let permLevel = 0;
    modRoles.forEach((modRole) => {
      if (member.roles.cache.has(modRole.id)) {
        permLevel = modRole.permissionLevel;
      }
    });
    return member.permissions.has("ADMINISTRATOR") && permLevel < 2 ? 2 : permLevel;
  }
}

export function modLog(guild: Guild, moderator: User, fieldsAndValues: Array<string>) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.MOD_LOGS);
  if (logChannel == null) {
    container.logger.error("logChannel is null or undefined.");
  }

  const embedOptions: MessageEmbedOptions = {
    author: {
      name: moderator.tag,
      iconURL: moderator.displayAvatarURL(),
    },
    timestamp: new Date(),
  };

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i+=1) {
    if (NumberUtil.isEven(i)) {
      embedOptions.fields.push({
        name: fieldsAndValues[i],
        value: fieldsAndValues[i + 1].toString(),
      });
    }
  }

  return send(logChannel as GuildTextBasedChannel, undefined, embedOptions);
}

export function modLogCustom(guild: Guild, message: string, author: User) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.MOD_LOGS);
  if (logChannel == null) {
    container.logger.error("logChannel is null or undefined.");
  }

  const embedOptions: MessageEmbedOptions = {
    author: {
      name: author.tag,
      iconURL: author.displayAvatarURL(),
    },
  };

  return send(logChannel as GuildTextBasedChannel, message, embedOptions);
}
