import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  User,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants } from "../utility/Constants";
import { send } from "../utility/Sender";
import { NumberUtil } from "../utility/NumberUtil";
import TryVal from "../utility/TryVal";

export class ModerationService {
  public static async getPermLevel(guild: Guild, user: User) {
    const member = (await TryVal(guild.members.fetch(user))) as GuildMember;
    if (member == null) {
      return 0;
    }
    const modRoles = Constants.MOD_ROLES.sort(
      (a, b) => b.permissionLevel - a.permissionLevel
    );
    const permLevel =
      modRoles.find((modRole) => member.roles.cache.has(modRole.id))?.permissionLevel ??
      0;
    return member.permissions.has("ADMINISTRATOR") && permLevel < 2 ? 2 : permLevel;
  }

  public static async isModerator(guild: Guild, user: User) {
    return user.bot || (await this.getPermLevel(guild, user)) > 0;
  }
}

export async function genericLog(
  guild: Guild,
  user: User,
  fieldsAndValues: Array<string>,
  color: number
) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.LOGS);
  if (logChannel == null) {
    container.logger.error("LOGS is null or undefined.");
    return;
  }

  const messageOptions: MessageOptions = {};
  const embedOptions: MessageEmbedOptions = {
    author: {
      name: user.tag,
      iconURL: user.displayAvatarURL(),
    },
    footer: {
      text: `User ID: ${user.id}`,
    },
    color,
    timestamp: new Date(),
  };

  const buttons = [
    [
      new MessageButton()
        .setCustomId(`userid-${user.id}`)
        .setLabel("User ID")
        .setStyle("SECONDARY"),
    ],
  ];
  messageOptions.components = buttons.map((b) => ({ type: 1, components: b }));

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      embedOptions.fields.push({
        name: fieldsAndValues[i],
        value: fieldsAndValues[i + 1].toString(),
      });
    }
  }

  await send(
    logChannel as GuildTextBasedChannel,
    undefined,
    embedOptions,
    messageOptions
  );
}

export async function modLog(
  guild: Guild,
  moderator: User | null,
  fieldsAndValues: Array<string>,
  color: number,
  target?: User
) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.MOD_LOGS);
  if (logChannel == null) {
    container.logger.error("MOD_LOGS is null or undefined.");
    return;
  }

  const messageOptions: MessageOptions = {};
  const embedOptions: MessageEmbedOptions = {
    color,
    timestamp: new Date(),
  };

  if (moderator != null) {
    embedOptions.author = {
      name: moderator.tag,
      iconURL: moderator.displayAvatarURL(),
    };
  }

  if (target != null) {
    const buttons = [
      [
        new MessageButton()
          .setCustomId(`userid-${target.id}`)
          .setLabel("User ID")
          .setStyle("SECONDARY"),
      ],
    ];
    messageOptions.components = buttons.map((b) => ({ type: 1, components: b }));
  }

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      embedOptions.fields.push({
        name: fieldsAndValues[i],
        value: fieldsAndValues[i + 1].toString(),
      });
    }
  }

  await send(
    logChannel as GuildTextBasedChannel,
    undefined,
    embedOptions,
    messageOptions
  );
}
