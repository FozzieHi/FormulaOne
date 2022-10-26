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
import { BanishUtil } from "../../utility/BanishUtil.js";
import { Constants } from "../../utility/Constants.js";
import { PunishUtil } from "../../utility/PunishUtil.js";
import { BotQueueService } from "../../services/BotQueueService.js";
import Try from "../../utility/Try.js";
import TryVal from "../../utility/TryVal.js";
import { replyInteractionError } from "../../utility/Sender.js";

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
      const reason = `Rule ${parsedData.ruleNumber + 1} - ${
        Constants.RULES[parsedData.ruleNumber]
      }`;
      await BanishUtil.banish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        parsedData.targetRoleId as Snowflake,
        "add",
        "interaction",
        reason
      );
    } else if (parsedData.commandName === "punish") {
      const logMessage = (await TryVal(
        (interaction.channel as TextChannel).messages.fetch(
          parsedData.logMessageId as Snowflake
        )
      )) as Message;
      if (logMessage == null) {
        return;
      }
      const targetMember = (await TryVal(
        interaction.guild.members.fetch(parsedData.targetMemberId)
      )) as GuildMember;
      if (targetMember == null) {
        await replyInteractionError(interaction, "Member not found.");
        return;
      }
      const channel = (await interaction.guild.channels.fetch(
        parsedData.channelId as Snowflake
      )) as TextChannel;
      const message = (await TryVal(
        channel.messages.fetch(parsedData.messageId as Snowflake)
      )) as Message;
      const reason = `Rule ${parsedData.ruleNumber + 1} - ${
        Constants.RULES[parsedData.ruleNumber]
      }`;
      const messageSent: Message = (await PunishUtil.punish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        "add",
        reason,
        parsedData.amount as number,
        message
      )) as Message;
      await BotQueueService.archiveLog(
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
  }

  public parse(interaction: SelectMenuInteraction) {
    if (!interaction.customId.startsWith("ruleselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [commandName] = split;
    split.shift();
    const interactionRuleNum = interaction.values.at(0);
    if (interactionRuleNum == null) {
      return this.none();
    }
    const ruleNumber = parseInt(interactionRuleNum, 10);
    if (commandName === "banish") {
      const [targetMemberId, targetRoleId] = split;
      return this.some({
        commandName,
        targetMemberId,
        targetRoleId,
        ruleNumber,
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
        ruleNumber,
        targetRoleId: null,
      });
    }
    return this.none();
  }
}
