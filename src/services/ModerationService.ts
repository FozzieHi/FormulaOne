import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  Snowflake,
  User,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants";
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

function getModerationQueueButtons(
  buttons: Array<ModerationQueueButtons>,
  targetUserId: Snowflake,
  channelId: Snowflake,
  messageId: Snowflake
) {
  const returnButtons: Array<MessageButton> = [];
  buttons.forEach((button) => {
    if (button === "PUNISH") {
      returnButtons.push(
        new MessageButton({
          customId: `showamountselect-${channelId}-${messageId}`,
          label: "Punish",
          style: "DANGER",
        })
      );
    } else if (button === "BAN") {
      returnButtons.push(
        new MessageButton({
          customId: `showreasonoption-ban-${targetUserId}-${channelId}`,
          label: "Ban",
          style: "DANGER",
        })
      );
    } else if (button === "UNMUTE") {
      returnButtons.push(
        new MessageButton({
          customId: `showreasonoption-unmute-${targetUserId}`,
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
        new MessageButton({
          customId: `userid-${target.id}`,
          label: `User ID`,
          style: "SECONDARY",
        }),
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

export async function modQueue(
  guild: Guild,
  target: User,
  channelId: Snowflake,
  messageId: Snowflake,
  fieldsAndValues: Array<string>,
  color: number,
  buttons: Array<ModerationQueueButtons>
) {
  const logChannel = guild.channels.cache.get(Constants.CHANNELS.MOD_QUEUE);
  if (logChannel == null) {
    container.logger.error("MOD_QUEUE is null or undefined.");
    return;
  }

  const messageOptions: MessageOptions = {};
  const embedOptions: MessageEmbedOptions = {
    footer: {
      text: `User ID: ${target.id} - Message ID: ${messageId}`,
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
  getModerationQueueButtons(buttons, target.id, channelId, messageId).forEach(
    (button) => msgButtons[0].push(button)
  );
  messageOptions.components = msgButtons.map((b) => ({ type: 1, components: b }));

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
