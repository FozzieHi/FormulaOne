import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  GuildMember,
  Message,
  SelectMenuInteraction,
  Snowflake,
  TextChannel,
} from "discord.js";
import { setTimeout } from "timers/promises";
import { banish } from "../../utility/BanishUtil.js";
import { Constants } from "../../utility/Constants.js";
import { punish } from "../../utility/PunishUtil.js";
import Try from "../../utility/Try.js";
import TryVal from "../../utility/TryVal.js";
import { replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";
import MutexManager from "../../managers/MutexManager.js";

export class RuleSelect extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(
    interaction: SelectMenuInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    if (interaction.guild == null) {
      return;
    }
    if (parsedData.commandName === "banish") {
      const targetMember = (await TryVal(
        interaction.guild.members.fetch(parsedData.targetMemberId)
      )) as GuildMember;
      if (targetMember == null) {
        await replyInteractionError(interaction, "Member not found.");
        return;
      }
      const reason = `${parsedData.rule} - ${Constants.RULES[parsedData.rule]}`;
      await banish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        parsedData.targetRoleId as Snowflake,
        "add",
        "interaction",
        reason
      );
    } else if (parsedData.commandName === "punish") {
      await MutexManager.getUserMutex(parsedData.targetMemberId).runExclusive(
        async () => {
          const logMessage = (await TryVal(
            (interaction.channel as TextChannel).messages.fetch(
              parsedData.logMessageId as Snowflake
            )
          )) as Message;
          if (interaction.guild == null || logMessage == null) {
            return;
          }
          const targetMember = (await TryVal(
            interaction.guild.members.fetch(parsedData.targetMemberId)
          )) as GuildMember;
          if (targetMember == null) {
            await replyInteractionError(interaction, "Member not found.");
            return;
          }
          const channel = (await TryVal(
            interaction.guild.channels.fetch(parsedData.channelId as Snowflake)
          )) as TextChannel;
          let message = null;
          if (channel != null) {
            message = (await TryVal(
              channel.messages.fetch(parsedData.messageId as Snowflake)
            )) as Message;
          } else {
            this.container.logger.warn(
              `Channel is null - Channel ID: ${parsedData.channelId as Snowflake}`
            );
          }
          const reason = `${parsedData.rule} - ${Constants.RULES[parsedData.rule]}`;
          const messageSent: Message = (await punish(
            interaction,
            interaction.member as GuildMember,
            targetMember,
            "add",
            reason,
            parsedData.amount as number,
            message
          )) as Message;
          await archiveLog(
            interaction.guild,
            interaction.channel as TextChannel,
            targetMember.id,
            interaction.user,
            logMessage,
            "Punished"
          );
          await setTimeout(10000, "result");
          await Try(messageSent.delete());
        }
      );
    }
  }

  public parse(interaction: SelectMenuInteraction) {
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
      const [targetMemberId, targetRoleId] = split;
      return this.some({
        commandName,
        targetMemberId,
        targetRoleId,
        rule,
        channelId: null,
        messageId: null,
        logMessageId: null,
        amount: null,
      });
    }
    if (commandName === "punish") {
      const [targetMemberId, channelId, messageId, logMessageId, amount] = split;
      return this.some({
        commandName,
        targetMemberId,
        channelId,
        messageId,
        logMessageId,
        amount: parseInt(amount, 10),
        rule,
        targetRoleId: null,
      });
    }
    return this.none();
  }
}
