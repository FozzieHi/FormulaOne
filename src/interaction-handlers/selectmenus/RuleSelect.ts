import { setTimeout } from "timers/promises";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  GuildMember,
  Message,
  StringSelectMenuInteraction,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";
import { banish } from "../../utility/BanishUtil.js";
import { Constants } from "../../utility/Constants.js";
import { getDBUser } from "../../utility/DatabaseUtil.js";
import { punish, getPunishmentDisplay } from "../../utility/PunishUtil.js";
import Try from "../../utility/Try.js";
import TryVal from "../../utility/TryVal.js";
import { replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";
import MutexManager from "../../managers/MutexManager.js";
import ViolationService from "../../services/ViolationService.js";

export class RuleSelect extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(
    interaction: StringSelectMenuInteraction,
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    if (interaction.guild == null) {
      return;
    }
    if (parsedData.commandName === "banish") {
      const targetMember = (await TryVal(
        interaction.guild.members.fetch(parsedData.targetMemberId as Snowflake),
      )) as GuildMember;
      if (targetMember == null) {
        await replyInteractionError(interaction, "Member not found.");
        return;
      }
      const reason = `${parsedData.rule} - ${Constants.RULES[parsedData.rule]}`;
      await banish(interaction, targetMember, "add", "interaction", reason);
    } else if (parsedData.commandName === "punish") {
      await MutexManager.getUserMutex(
        parsedData.targetUserId as Snowflake,
      ).runExclusive(async () => {
        if (parsedData.logMessageId != null) {
          if (ViolationService.handled.has(parsedData.logMessageId)) {
            await replyInteractionError(interaction, "Log has already been handled.");
            return;
          }
        }
        const logMessage =
          parsedData.logMessageId != null
            ? await TryVal(
                (interaction.channel as TextChannel).messages.fetch(
                  parsedData.logMessageId,
                ),
              )
            : null;
        if (interaction.guild == null || interaction.member == null) {
          return;
        }
        const targetUser = (await TryVal(
          interaction.client.users.fetch(parsedData.targetUserId as Snowflake),
        )) as User;
        if (targetUser == null) {
          await replyInteractionError(interaction, "User not found.");
          return;
        }
        const channel = (await TryVal(
          interaction.guild.channels.fetch(parsedData.channelId as Snowflake),
        )) as TextChannel;
        let message = null;
        if (channel != null) {
          message = (await TryVal(
            channel.messages.fetch(parsedData.messageId as Snowflake),
          )) as Message;
        } else {
          this.container.logger.warn(
            `Channel is null - Channel ID: ${parsedData.channelId as Snowflake}`,
          );
        }
        const reason = `${parsedData.rule} - ${Constants.RULES[parsedData.rule]}`;
        const messageSent: Message = (await punish(
          interaction,
          interaction.member as GuildMember,
          targetUser,
          "add",
          reason,
          parsedData.amount as number,
          message,
          channel,
        )) as Message;

        if (logMessage != null) {
          // If this is a mod queue message, we now need to "move" the message to the Archive thread.
          // When we repost it, we want to include extra information about the details of the punish.
          // This makes it easier for moderators to review the Archive and understand what happened.

          // By waiting until after we punish the user, we can get the "outcome" of the punish
          // by getting the user from the DB and just checking their current punishment level,
          // instead of having to do math with the punishment amount.
          const dbUser = await getDBUser(targetUser.id, interaction.guild.id);
          const pprintAmount = `${parsedData.amount} punishment${parsedData.amount !== 1 ? "s" : ""}`;
          let severity: string;
          if (dbUser == null) {
            severity = pprintAmount;
          } else {
            const currentPunLvl = Constants.PUNISHMENTS.at(dbUser.currentPunishment);
            if (currentPunLvl == null) {
              severity = pprintAmount;
            } else {
              const outcome = getPunishmentDisplay(currentPunLvl).displayLog;
              severity = `${pprintAmount} (${outcome})`;
            }
          }
          const extraDetails = `Severity: ${severity}\nRule: ${reason}`;

          await archiveLog(
            interaction.guild,
            interaction.channel as TextChannel,
            targetUser.id,
            interaction.member as GuildMember,
            logMessage,
            "Punished",
            extraDetails,
          );
          await setTimeout(10000, "result");
          await Try(messageSent.delete());
          ViolationService.handled.add(logMessage.id);
        }
      });
    }
  }

  public parse(interaction: StringSelectMenuInteraction) {
    if (!interaction.customId.startsWith("ruleselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [commandName] = split;
    split.shift();
    const rule = interaction.values.at(0);
    if (rule == null) {
      return this.none();
    }
    if (commandName === "banish") {
      const [targetMemberId] = split;
      return this.some({
        commandName,
        targetMemberId,
        rule,
        targetUserId: null,
        channelId: null,
        messageId: null,
        logMessageId: null,
        amount: null,
      });
    }
    if (commandName === "punish") {
      const [targetUserId, channelId, messageId, logMessageId, amount] = split;
      return this.some({
        commandName,
        targetUserId,
        channelId,
        messageId,
        logMessageId,
        amount: parseInt(amount, 10),
        rule,
        targetMemberId: null,
      });
    }
    return this.none();
  }
}
