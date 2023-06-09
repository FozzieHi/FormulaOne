import {
  CommandInteraction,
  GuildMember,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  Snowflake,
} from "discord.js";
import { Constants } from "./Constants.js";
import {
  dm,
  replyInteractionError,
  replyInteractionPublic,
  send,
  updateInteraction,
} from "./Sender.js";
import db from "../database/index.js";
import { getPermLevel, isModerator, modLog } from "../services/ModerationService.js";
import { PushUpdate } from "../database/updates/PushUpdate.js";
import MutexManager from "../managers/MutexManager.js";
import { boldify } from "./StringUtil.js";

export async function banish(
  interaction: CommandInteraction | SelectMenuInteraction | ModalSubmitInteraction,
  targetMember: GuildMember,
  targetRoleId: Snowflake,
  action: string,
  handler: string,
  reason: string
) {
  await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
    if (
      interaction.guild == null ||
      interaction.channel == null ||
      interaction.member == null
    ) {
      return;
    }

    const helper = (await getPermLevel(interaction.guild, interaction.user)) === 0;
    if (helper && targetRoleId !== Constants.ROLES.BEGINNERS_QUESTIONS) {
      await replyInteractionError(
        interaction,
        "Helpers may only banish members from the f1-beginner-questions channel."
      );
      return;
    }

    if (
      (await isModerator(interaction.guild, targetMember.user)) ||
      ((await getPermLevel(interaction.guild, interaction.user)) === 0 &&
        targetMember.roles.cache.has(Constants.ROLES.HELPERS))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator."
      );
      return;
    }

    const banishedRole = Constants.BANISH_ROLES.find(
      (banishRole) => banishRole.id === targetRoleId
    );
    if (banishedRole == null) {
      await replyInteractionError(interaction, "Could not fetch target role.");
      return;
    }

    if (action === "add") {
      if (targetMember.roles.cache.has(targetRoleId)) {
        await replyInteractionError(
          interaction,
          `${boldify(targetMember.user.tag)} is already banished from ${
            banishedRole.name
          }.`
        );
        return;
      }

      const logAction = `${helper ? "Helper " : ""}${banishedRole.name} Banish`;
      await targetMember.roles.add(targetRoleId);
      if (handler === "command") {
        await replyInteractionPublic(
          interaction,
          `Successfully banished ${boldify(targetMember.user.tag)} from ${
            banishedRole.name
          }.`
        );
      } else {
        await updateInteraction(
          interaction as MessageComponentInteraction,
          `Successfully banished ${boldify(targetMember.user.tag)}.`,
          { color: Constants.UNMUTE_COLOR },
          { content: null, components: [] }
        );
        await send(
          interaction.channel,
          `Successfully banished ${boldify(targetMember.user.tag)} from ${
            banishedRole.name
          }.`
        );
      }
      await db.userRepo?.upsertUser(
        targetMember.id,
        interaction.guild.id,
        new PushUpdate("punishments", {
          date: Date.now(),
          escalation: logAction,
          reason,
          mod: interaction.user.tag,
          channelId: interaction.channel.id,
        })
      );
      await modLog(
        interaction.guild,
        interaction.member as GuildMember,
        [
          "Action",
          logAction,
          "Member",
          `${targetMember.user.tag.toString()} (${targetMember.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.BANISH_COLOR,
        targetMember.user
      );
      await dm(
        targetMember.user,
        `A moderator has banished you from the ${banishedRole.name} channel.`,
        interaction.channel
      );
    } else if (action === "remove") {
      if (!targetMember.roles.cache.has(targetRoleId)) {
        await replyInteractionError(
          interaction,
          `${boldify(targetMember.user.tag)} is not banished from ${banishedRole.name}.`
        );
        return;
      }
      const logAction = `${helper ? "Helper " : ""}${banishedRole.name} Unbanish`;
      await targetMember.roles.remove(targetRoleId);
      if (handler === "command") {
        await replyInteractionPublic(
          interaction,
          `Successfully unbanished ${boldify(targetMember.user.tag)} from ${
            banishedRole.name
          }.`
        );
      } else {
        await updateInteraction(
          interaction as MessageComponentInteraction,
          `Successfully unbanished ${boldify(targetMember.user.tag)}.`,
          { color: Constants.UNMUTE_COLOR },
          { content: null, components: [] }
        );
        await send(
          interaction.channel,
          `Successfully unbanished ${boldify(targetMember.user.tag)} from ${
            banishedRole.name
          }.`
        );
      }
      await modLog(
        interaction.guild,
        interaction.member as GuildMember,
        [
          "Action",
          logAction,
          "Member",
          `${targetMember.user.tag.toString()} (${targetMember.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.UNMUTE_COLOR,
        targetMember.user
      );
      await dm(
        targetMember.user,
        `A moderator has unbanished you from the ${banishedRole.name} channel.`,
        interaction.channel
      );
    }
  });
}
