import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  MessageButton,
  MessageEmbed,
  MessageEmbedOptions,
  MessageOptions,
  Snowflake,
  User,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { send } from "../utility/Sender.js";
import { NumberUtil } from "../utility/NumberUtil.js";
import TryVal from "../utility/TryVal.js";
import { StringUtil } from "../utility/StringUtil.js";

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

function getModerationQueueButtons(
  buttons: Array<ModerationQueueButtons>,
  targetUserId: Snowflake,
  targetChannelId: Snowflake,
  targetMessageId: Snowflake
) {
  const returnButtons: Array<MessageButton> = [];
  buttons.forEach((button) => {
    if (button === "PUNISH") {
      returnButtons.push(
        new MessageButton({
          customId: `showamountselect-${targetUserId}-${targetChannelId}-${targetMessageId}`,
          label: "Punish",
          style: "DANGER",
        })
      );
    } else if (button === "ESCALATE") {
      returnButtons.push(
        new MessageButton({
          customId: `escalate-${targetUserId}-${targetChannelId}-${targetChannelId}`,
          label: "Escalate",
          style: "PRIMARY",
        })
      );
    } else if (button === "BAN") {
      returnButtons.push(
        new MessageButton({
          customId: `showreasonoption-ban-${targetUserId}-${targetChannelId}`,
          label: "Ban",
          style: "DANGER",
        })
      );
    } else if (button === "UNMUTE") {
      returnButtons.push(
        new MessageButton({
          customId: `unmute-${targetUserId}`,
          label: "Unmute",
          style: "SUCCESS",
        })
      );
    } else if (button === "IGNORE") {
      returnButtons.push(
        new MessageButton({
          customId: `ignore-${targetUserId}`,
          label: "Ignore",
          style: "SECONDARY",
        })
      );
    }
  });
  return returnButtons;
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
      new MessageButton({
        customId: `userid-${user.id}`,
        label: `User ID`,
        style: "SECONDARY",
      }),
    ],
  ];
  messageOptions.components = buttons.map((b) => ({
    type: "ACTION_ROW",
    components: b,
  }));

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      const name = fieldsAndValues.at(i)?.toString();
      const value = fieldsAndValues.at(i + 1)?.toString();
      if (name != null && value != null) {
        embedOptions.fields.push({
          name,
          value,
        });
      }
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
        new MessageButton({
          customId: `userid-${target.id}`,
          label: `User ID`,
          style: "SECONDARY",
        }),
      ],
    ];
    messageOptions.components = buttons.map((b) => ({
      type: "ACTION_ROW",
      components: b,
    }));
  }

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      const name = fieldsAndValues.at(i)?.toString();
      const value = fieldsAndValues.at(i + 1)?.toString();
      if (name != null && value != null) {
        embedOptions.fields.push({
          name,
          value,
        });
      }
    }
  }

  await send(
    logChannel as GuildTextBasedChannel,
    undefined,
    embedOptions,
    messageOptions
  );
}

export async function modQueue(
  guild: Guild,
  target: User,
  targetChannelId: Snowflake,
  targetMessageId: Snowflake,
  fieldsAndValues: Array<string>,
  color: number,
  buttons: Array<ModerationQueueButtons>,
  mention = false
) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.MOD_QUEUE);
  if (logChannel == null) {
    container.logger.error("MOD_QUEUE is null or undefined.");
    return;
  }

  const messageOptions: MessageOptions = {};
  if (mention) {
    messageOptions.content = `<@&${Constants.ROLES.MODS}>`;
  }
  const embedOptions: MessageEmbedOptions = {
    footer: {
      text: `User ID: ${target.id} - Message ID: ${targetMessageId}`,
    },
    color,
    timestamp: new Date(),
  };

  embedOptions.author = {
    name: target.tag,
    iconURL: target.displayAvatarURL(),
  };

  const msgButtons = [
    [
      new MessageButton({
        customId: `userid-${target.id}`,
        label: `User ID`,
        style: "SECONDARY",
      }),
    ],
  ];
  getModerationQueueButtons(
    buttons,
    target.id,
    targetChannelId,
    targetMessageId
  ).forEach((button) => msgButtons.at(0)?.push(button));
  messageOptions.components = msgButtons.map((b) => ({
    type: "ACTION_ROW",
    components: b,
  }));

  embedOptions.fields = [];
  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      const name = fieldsAndValues.at(i)?.toString();
      const value = fieldsAndValues.at(i + 1)?.toString();
      if (name != null && value != null) {
        embedOptions.fields.push({
          name,
          value,
        });
      }
    }
  }

  await send(
    logChannel as GuildTextBasedChannel,
    undefined,
    embedOptions,
    messageOptions
  );
}

export async function escalate(
  guild: Guild,
  moderator: User,
  target: User,
  targetChannelId: Snowflake,
  targetMessageId: Snowflake,
  embed: MessageEmbed,
  buttons: Array<ModerationQueueButtons>
): Promise<Message | null> {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.STEWARDS_QUEUE);
  if (logChannel == null) {
    container.logger.error("STEWARDS_QUEUE is null or undefined.");
    return null;
  }

  const messageOptions: MessageOptions = {};
  messageOptions.content = `<@&${
    Constants.ROLES.STEWARDS
  }>, Escalated by ${StringUtil.boldify(moderator.tag)}`;

  const msgButtons = [
    [
      new MessageButton({
        customId: `userid-${target.id}`,
        label: `User ID`,
        style: "SECONDARY",
      }),
    ],
  ];
  getModerationQueueButtons(
    buttons,
    target.id,
    targetChannelId,
    targetMessageId
  ).forEach((button) => msgButtons.at(0)?.push(button));
  messageOptions.components = msgButtons.map((b) => ({
    type: "ACTION_ROW",
    components: b,
  }));
  messageOptions.embeds = [embed];

  return send(logChannel as GuildTextBasedChannel, undefined, null, messageOptions);
}
