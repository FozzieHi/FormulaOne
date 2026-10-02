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
        const { message: messageSent, dbUser } =
          (await punish(
            interaction,
            interaction.member as GuildMember,
            targetUser,
            "add",
            reason,
            parsedData.amount as number,
            message,
            channel,
          )) || {};

        if (logMessage != null) {
          // If this is a mod queue message, we now need to "move" the message to the Archive thread.
          // When we repost it, we want to include extra information about the details of the punish.
          // This makes it easier for moderators to review the Archive and understand what happened.
          const pprintAmount = `${parsedData.amount} punishment${parsedData.amount !== 1 ? "s" : ""}`;
          let severity: string;
          if (dbUser == null) {
            severity = pprintAmount;
          } else {
            // We want to include the user's current punish status in the extra details. To do this,
            // we need to get the user's current punishment level - ideally, without querying the DB.
            // `punish` MUST query the user from the DB; to help other code save DB calls, it returns
            // the DBUser. We can use that DBUser, but that database call is from BEFORE the punish is
            // applied! To get the NEW punish level, add `amount` to the DBUser's currentPunishment.
            const newPunishInt = dbUser.currentPunishment + (parsedData.amount || 0);
            const newPunishLevel = Constants.PUNISHMENTS.at(newPunishInt);
            if (newPunishLevel == null) {
              severity = pprintAmount;
            } else {
              const outcome = getPunishmentDisplay(newPunishLevel).displayLog;
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
          if (messageSent != null) {
            await Try(messageSent.delete());
          }
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
