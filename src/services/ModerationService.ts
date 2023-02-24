import {
  ButtonStyle,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  ButtonBuilder,
  APIEmbed,
  BaseMessageOptions,
  PermissionsBitField,
  Snowflake,
  User,
  ComponentType,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { send } from "../utility/Sender.js";
import TryVal from "../utility/TryVal.js";
import { isEven } from "../utility/NumberUtil.js";
import { boldify } from "../utility/StringUtil.js";

export async function getPermLevel(guild: Guild, user: User) {
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
  return member.permissions.has(PermissionsBitField.Flags.Administrator) &&
    permLevel < 2
    ? 2
    : permLevel;
}

export async function isModerator(guild: Guild, user: User) {
  return user.bot || (await getPermLevel(guild, user)) > 0;
}

function getModerationQueueButtons(
  buttons: Array<ModerationQueueButtons>,
  targetUserId: Snowflake,
  targetChannelId: Snowflake,
  targetMessageId: Snowflake | null
) {
  const returnButtons: Array<ButtonBuilder> = [];
  buttons.forEach((button) => {
    if (button === "PUNISH") {
      returnButtons.push(
        new ButtonBuilder({
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          customId: `showamountselect-${targetUserId}-${targetChannelId}$-${targetMessageId}`,
          label: "Punish",
          style: ButtonStyle.Danger,
        })
      );
    } else if (button === "ESCALATE") {
      returnButtons.push(
        new ButtonBuilder({
          customId: `escalate-${targetUserId}-${targetChannelId}-${targetChannelId}`,
          label: "Escalate",
          style: ButtonStyle.Primary,
        })
      );
    } else if (button === "BAN") {
      returnButtons.push(
        new ButtonBuilder({
          customId: `showreasonoption-ban-${targetUserId}-${targetChannelId}`,
          label: "Ban",
          style: ButtonStyle.Danger,
        })
      );
    } else if (button === "UNMUTE") {
      returnButtons.push(
        new ButtonBuilder({
          customId: `unmute-${targetUserId}`,
          label: "Unmute",
          style: ButtonStyle.Success,
        })
      );
    } else if (button === "IGNORE") {
      returnButtons.push(
        new ButtonBuilder({
          customId: `ignore-${targetUserId}`,
          label: "Ignore",
          style: ButtonStyle.Secondary,
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
  const logChannel = await TryVal(guild.channels.fetch(Constants.CHANNELS.LOGS));
  if (logChannel == null) {
    container.logger.error("LOGS is null or undefined.");
    return;
  }

  const messageOptions: BaseMessageOptions = {};
  const embedOptions: APIEmbed = {
    author: {
      name: user.tag,
      icon_url: user.displayAvatarURL(),
    },
    footer: {
      text: `User ID: ${user.id}`,
    },
    color,
    timestamp: new Date().toISOString(),
  };

  const buttons = [
    [
      new ButtonBuilder({
        customId: `userid-${user.id}`,
        label: `User ID`,
        style: ButtonStyle.Secondary,
      }),
    ],
  ];
  messageOptions.components = buttons.map((b) => ({
    type: ComponentType.ActionRow,
    components: b,
  }));

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (isEven(i)) {
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
  const logChannel = await TryVal(guild.channels.fetch(Constants.CHANNELS.MOD_LOGS));
  if (logChannel == null) {
    container.logger.error("MOD_LOGS is null or undefined.");
    return;
  }

  const messageOptions: BaseMessageOptions = {};
  const embedOptions: APIEmbed = {
    color,
    timestamp: new Date().toISOString(),
  };

  if (moderator != null) {
    embedOptions.author = {
      name: moderator.tag,
      icon_url: moderator.displayAvatarURL(),
    };
  }

  if (target != null) {
    const buttons = [
      [
        new ButtonBuilder({
          customId: `userid-${target.id}`,
          label: `User ID`,
          style: ButtonStyle.Secondary,
        }),
      ],
    ];
    messageOptions.components = buttons.map((b) => ({
      type: ComponentType.ActionRow,
      components: b,
    }));
  }

  embedOptions.fields = [];

  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (isEven(i)) {
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
  targetMessageId: Snowflake | null,
  fieldsAndValues: Array<string>,
  color: number,
  buttons: Array<ModerationQueueButtons>,
  mention = false
) {
  const logChannel = await TryVal(guild.channels.fetch(Constants.CHANNELS.MOD_QUEUE));
  if (logChannel == null) {
    container.logger.error("MOD_QUEUE is null or undefined.");
    return;
  }

  const messageOptions: BaseMessageOptions = {};
  if (mention) {
    messageOptions.content = `<@&${Constants.ROLES.MODS}>`;
  }
  const embedOptions: APIEmbed = {
    footer: {
      text: `User ID: ${target.id}${
        targetMessageId != null ? ` - Message ID: ${targetMessageId}` : ""
      }`,
    },
    color,
    timestamp: new Date().toISOString(),
  };

  embedOptions.author = {
    name: target.tag,
    icon_url: target.displayAvatarURL(),
  };

  const msgButtons = [
    [
      new ButtonBuilder({
        customId: `userid-${target.id}`,
        label: `User ID`,
        style: ButtonStyle.Secondary,
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
    type: ComponentType.ActionRow,
    components: b,
  }));

  embedOptions.fields = [];
  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (isEven(i)) {
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
  embed: APIEmbed,
  buttons: Array<ModerationQueueButtons>
): Promise<Message | null> {
  const logChannel = await TryVal(
    guild.channels.fetch(Constants.CHANNELS.STEWARDS_QUEUE)
  );
  if (logChannel == null) {
    container.logger.error("STEWARDS_QUEUE is null or undefined.");
    return null;
  }

  const messageOptions: BaseMessageOptions = {};
  messageOptions.content = `${
    (await getPermLevel(guild, moderator)) > 1
      ? ""
      : `<@&${Constants.ROLES.STEWARDS}>, `
  }Escalated by ${boldify(moderator.tag)}`;

  const msgButtons = [
    [
      new ButtonBuilder({
        customId: `userid-${target.id}`,
        label: `User ID`,
        style: ButtonStyle.Secondary,
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
    type: ComponentType.ActionRow,
    components: b,
  }));
  messageOptions.embeds = [embed];

  return send(logChannel as GuildTextBasedChannel, undefined, null, messageOptions);
}
