import {
  CommandInteraction,
  GuildMember,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { Constants } from "./Constants.js";
import {
  dm,
  replyInteraction,
  replyInteractionError,
  replyInteractionPublic,
  send,
  updateInteraction,
} from "./Sender.js";
import db from "../database/index.js";
import { getPermLevel, isModerator, modLog } from "../services/ModerationService.js";
import { PushUpdate } from "../database/updates/PushUpdate.js";
import MutexManager from "../managers/MutexManager.js";
import { boldify, getDisplayTag, getUserTag } from "./StringUtil.js";

export async function banish(
  interaction:
    | CommandInteraction
    | StringSelectMenuInteraction
    | ModalSubmitInteraction,
  targetMember: GuildMember,
  action: "add" | "remove",
  handler: string,
  reason: string,
) {
  await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
    if (
      interaction.guild == null ||
      interaction.channel == null ||
      interaction.member == null
    ) {
      return;
    }

    if (
      (await isModerator(interaction.guild, targetMember.user)) ||
      ((await getPermLevel(interaction.guild, interaction.user)) === 0 &&
        targetMember.roles.cache.has(Constants.ROLES.HELPERS))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator.",
      );
      return;
    }

    const helper = (await getPermLevel(interaction.guild, interaction.user)) === 0;
    if (action === "add") {
      if (targetMember.roles.cache.has(Constants.ROLES.BANISHED)) {
        await replyInteractionError(
          interaction,
          `${boldify(getDisplayTag(targetMember))} is already banished.`,
        );
        return;
      }

      const logAction = `${helper ? "Helper " : ""}Banish`;
      await targetMember.roles.add(
        Constants.ROLES.BANISHED,
        `(${getDisplayTag(interaction.member as GuildMember)}) ${reason}`,
      );
      if (handler === "command") {
        await replyInteraction(
          interaction,
          `Successfully banished ${boldify(getDisplayTag(targetMember))}.`,
        );
      } else {
        await updateInteraction(
          interaction as MessageComponentInteraction,
          `Successfully banished ${boldify(getDisplayTag(targetMember))}.`,
          { color: Constants.UNMUTE_COLOR },
          { content: null, components: [] },
        );
      }
      await send(
        interaction.channel,
        `Successfully banished ${boldify(getDisplayTag(targetMember))}.`,
      );
      await db.userRepo?.upsertUser(
        targetMember.id,
        interaction.guild.id,
        new PushUpdate("punishments", {
          date: Date.now(),
          escalation: logAction,
          reason,
          mod: getUserTag(interaction.user),
          channelId: interaction.channel.id,
        }),
      );
      await modLog(
        interaction.guild,
        interaction.member as GuildMember,
        [
          "Action",
          logAction,
          "Member",
          `${getDisplayTag(targetMember)} (${targetMember.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.BANISH_COLOR,
        targetMember.user,
      );
      await dm(
        targetMember.user,
        `A moderator has banished you from discussion channels.`,
        interaction.channel,
      );
    } else if (action === "remove") {
      if (!targetMember.roles.cache.has(Constants.ROLES.BANISHED)) {
        await replyInteractionError(
          interaction,
          `${boldify(getDisplayTag(targetMember))} is not banished.`,
        );
        return;
      }
      const logAction = `${helper ? "Helper " : ""}Unbanish`;
      await targetMember.roles.remove(Constants.ROLES.BANISHED);
      if (handler === "command") {
        await replyInteractionPublic(
          interaction,
          `Successfully unbanished ${boldify(getDisplayTag(targetMember))}.`,
        );
      } else {
        await updateInteraction(
          interaction as MessageComponentInteraction,
          `Successfully unbanished ${boldify(getDisplayTag(targetMember))}.`,
          { color: Constants.UNMUTE_COLOR },
          { content: null, components: [] },
        );
        await send(
          interaction.channel,
          `Successfully unbanished ${boldify(getDisplayTag(targetMember))}.`,
        );
      }
      await modLog(
        interaction.guild,
        interaction.member as GuildMember,
        [
          "Action",
          logAction,
          "Member",
          `${getDisplayTag(targetMember)} (${targetMember.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.UNMUTE_COLOR,
        targetMember.user,
      );
      await dm(
        targetMember.user,
        `A moderator has unbanished you from discussion channels.`,
        interaction.channel,
      );
    }
  });
}
