import {
  CommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  Snowflake,
} from "discord.js";
import { Constants, PunishmentLevel, PunishmentType } from "./Constants.js";
import {
  dm,
  replyInteraction,
  replyInteractionError,
  replyInteractionPublic,
  send,
  updateInteraction,
} from "./Sender.js";
import db from "../database/index.js";
import { modLog } from "../services/ModerationService.js";
import { PushUpdate } from "../database/updates/PushUpdate.js";
import { getDBGuild, getDBUser } from "./DatabaseUtil.js";
import { millisecondsToUnits } from "./NumberUtil.js";
import { PopUpdate } from "../database/updates/PopUpdate.js";
import { Punishment } from "../database/models/User.js";
import { Pun } from "../database/models/Pun.js";
import { boldify, getDisplayTag, getUserTag, maxLength } from "./StringUtil.js";
import TryVal from "./TryVal.js";

async function increasePunishment(
  memberId: Snowflake,
  guildId: Snowflake,
  amount: number
) {
  await db.punRepo?.insertPun(memberId, guildId, amount);
  await db.userRepo?.upsertUser(memberId, guildId, {
    $inc: { currentPunishment: amount },
  });
}

async function decreasePunishment(memberId: Snowflake, guildId: Snowflake) {
  const puns = (await db.punRepo?.findPun(memberId, guildId)) as Array<Pun>;
  if (puns == null) {
    return;
  }

  const pun = puns.at(-1);
  if (pun == null) {
    return;
  }
  await db.punRepo?.deleteById(pun._id);
  await db.userRepo?.upsertUser(memberId, guildId, {
    $inc: { currentPunishment: -pun.amount },
  });
}

async function mute(
  moderator: GuildMember,
  targetMember: GuildMember,
  guild: Guild,
  reason: string,
  displayLog: string,
  length: number
) {
  const dbGuild = await getDBGuild(guild.id);
  if (dbGuild == null) {
    return;
  }
  const role = await TryVal(guild.roles.fetch(Constants.ROLES.MUTED));
  if (await db.muteRepo?.anyMute(targetMember.id, guild.id)) {
    await db.muteRepo?.deleteMute(targetMember.id, guild.id);
  }
  if (role == null) {
    return;
  }

  await targetMember.disableCommunicationUntil(
    Date.now() + length,
    `(${getDisplayTag(moderator)}) ${displayLog} - ${reason}`
  );
  await targetMember.roles.add(role);
  await db.muteRepo?.insertMute(targetMember.id, guild.id, length);
}

async function ban(
  moderator: GuildMember,
  targetMember: GuildMember,
  guild: Guild,
  reason: string,
  displayLog: string,
  length: number
) {
  const dbGuild = await getDBGuild(guild.id);
  if (dbGuild == null) {
    return;
  }
  if (await db.banRepo?.anyBan(targetMember.id, guild.id)) {
    await db.banRepo?.deleteBan(targetMember.id, guild.id);
  }

  await guild.members.ban(targetMember.user, {
    reason: `(${getDisplayTag(moderator)}) ${displayLog} - ${reason}`,
  });
  await db.banRepo?.insertBan(targetMember.id, guild.id, length);
}

export function getPunishmentDisplay(punishment: PunishmentLevel) {
  let displayLog = "";
  let displayCurrent = "";
  let displayPastTense = "";
  if (punishment.type === PunishmentType.WARN) {
    displayLog = "Warning";
    displayPastTense = "warned";
  } else if (
    punishment.type === PunishmentType.MUTE ||
    punishment.type === PunishmentType.BAN
  ) {
    const timeUnits = millisecondsToUnits(punishment.length as number);
    if (timeUnits.hours < 24) {
      const hourLength = timeUnits.hours;
      displayLog = `${hourLength} hour ${punishment.type}`;
      displayCurrent = `${hourLength} hour${hourLength !== 1 ? "s" : ""}`;
    } else {
      const dayLength = timeUnits.days;
      displayLog = `${dayLength} day ${punishment.type}`;
      displayCurrent = `${dayLength} day${dayLength !== 1 ? "s" : ""}`;
    }
    if (punishment.type === PunishmentType.MUTE) {
      displayPastTense = `${punishment.type}d`;
    } else if (punishment.type === PunishmentType.BAN) {
      displayPastTense = `${punishment.type}ned`;
    }
  }
  return { displayLog, displayCurrent, displayPastTense };
}

export async function punish(
  interaction: CommandInteraction | SelectMenuInteraction | ModalSubmitInteraction,
  moderator: GuildMember,
  targetMember: GuildMember,
  action: string,
  reason: string,
  amount: number,
  message?: Message | null,
  channel?: GuildTextBasedChannel
): Promise<Message | null> {
  let messageSent;
  if (interaction.guild == null || interaction.channel == null) {
    return null;
  }

  const dbUser = await getDBUser(targetMember.id, interaction.guild.id);
  if (dbUser == null) {
    return null;
  }
  const currentPun = dbUser.currentPunishment;

  if (action === "add") {
    if (currentPun > Constants.PUNISHMENTS.length - 1) {
      await replyInteractionError(
        interaction,
        `${boldify(getDisplayTag(targetMember))} has exceeded ${
          Constants.PUNISHMENTS.length
        } punishments in the last 30 days, escalate their punishment manually.`
      );
    }

    const maxEscalations = Math.min(currentPun + amount, Constants.PUNISHMENTS.length);
    const escalations = maxEscalations - currentPun;

    const punishment = Constants.PUNISHMENTS.at(maxEscalations - 1);
    if (punishment == null) {
      return null;
    }
    const punishmentDisplay = getPunishmentDisplay(punishment);

    await dm(
      targetMember.user,
      `A moderator has ${punishmentDisplay.displayPastTense} you${
        punishment.length != null ? ` for ${punishmentDisplay.displayCurrent}` : ""
      } for the reason: ${reason}.`,
      interaction.channel
    );

    let color = Constants.WARN_COLOR;
    if (punishment.type === PunishmentType.WARN) {
      await db.userRepo?.upsertUser(targetMember.id, interaction.guild.id, {
        $inc: { warnings: 1 },
      });
      color = Constants.WARN_COLOR;
    } else if (punishment.type === PunishmentType.MUTE) {
      await mute(
        moderator,
        targetMember,
        interaction.guild,
        reason,
        punishmentDisplay.displayLog,
        punishment.length as number
      );
      await db.userRepo?.upsertUser(targetMember.id, interaction.guild.id, {
        $inc: { mutes: 1 },
      });
      color = Constants.MUTE_COLOR;
    } else if (punishment.type === PunishmentType.BAN) {
      await ban(
        moderator,
        targetMember,
        interaction.guild,
        reason,
        punishmentDisplay.displayLog,
        punishment.length as number
      );
      await db.userRepo?.upsertUser(targetMember.id, interaction.guild.id, {
        $inc: { bans: 1 },
      });
      color = Constants.BAN_COLOR;
    }

    if (interaction.isStringSelectMenu()) {
      await updateInteraction(
        interaction,
        `Successfully punished member.`,
        {},
        { content: null, components: [] }
      );
    } else {
      await replyInteraction(interaction, `Successfully punished member.`);
    }
    const messageDescription = `Successfully ${
      punishmentDisplay.displayPastTense
    } ${boldify(getDisplayTag(targetMember))}${
      punishment.length != null ? ` for ${punishmentDisplay.displayCurrent}` : ""
    } for the reason ${reason}.\n\nThey have ${currentPun} punishments in the last 30 days.`;
    if (channel != null && interaction.channel.id !== channel.id) {
      await send(channel, messageDescription);
    }
    messageSent = await send(interaction.channel, messageDescription);

    const punishData: Punishment = {
      date: Date.now(),
      escalation: `${currentPun + escalations} (${punishmentDisplay.displayLog})${
        escalations > 1 ? ` (${escalations} punishments)` : ""
      }`,
      reason,
      mod: getUserTag(moderator.user),
      channelId: message?.channel.id ?? interaction.channel.id,
    };
    if (message != null) {
      punishData.messageContent = message.content;
    }
    await db.userRepo?.upsertUser(
      targetMember.id,
      interaction.guild.id,
      new PushUpdate("punishments", punishData)
    );
    await increasePunishment(targetMember.id, interaction.guild.id, escalations);
    const modLogFieldAndValues = [
      "Action",
      `${punishmentDisplay.displayLog}${
        escalations > 1 ? ` (${escalations} punishments)` : ""
      }`,
      "Member",
      `${getDisplayTag(targetMember)} (${targetMember.id})`,
      "Reason",
      reason,
      "Channel",
      message?.channel.toString() ?? interaction.channel.toString(),
    ];
    if (message != null) {
      modLogFieldAndValues.push("Content", maxLength(message.content));
    }
    await modLog(
      interaction.guild,
      moderator,
      modLogFieldAndValues,
      color,
      targetMember.user
    );
  } else if (action === "remove") {
    const role = await TryVal(interaction.guild.roles.fetch(Constants.ROLES.MUTED));
    if (role == null) {
      return null;
    }
    if (db.muteRepo?.anyMute(targetMember.id, interaction.guild.id)) {
      await targetMember.roles.remove(role);
      await targetMember.disableCommunicationUntil(
        null,
        `Unpunished by ${getDisplayTag(moderator)}`
      );
      await db.muteRepo?.deleteMute(targetMember.id, interaction.guild.id);
    }

    if (currentPun === 0) {
      await replyInteractionError(interaction, "Member has no active punishments.");
      return null;
    }

    await decreasePunishment(targetMember.id, interaction.guild.id);
    await modLog(
      interaction.guild,
      moderator,
      [
        "Action",
        "Unpunish",
        "Member",
        `${getDisplayTag(targetMember)} (${targetMember.id})`,
        "Reason",
        reason,
        "Channel",
        interaction.channel.toString(),
      ],
      Constants.UNMUTE_COLOR,
      targetMember.user
    );
    await db.userRepo?.upsertUser(
      targetMember.id,
      interaction.guild.id,
      new PopUpdate("punishments", 1)
    );

    await replyInteractionPublic(
      interaction,
      `Successfully unpunished ${boldify(getDisplayTag(targetMember))}.`
    );
  }
  if (messageSent != null) {
    return messageSent;
  }
  return null;
}
