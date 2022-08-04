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
import { BanishUtil } from "../../utility/BanishUtil";
import { Constants } from "../../utility/Constants";
import { PunishUtil } from "../../utility/PunishUtil";
import { BotQueueService } from "../../services/BotQueueService";

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
      const targetMember = await interaction.guild.members.fetch(
        parsedData.targetMemberId as Snowflake
      );
      if (targetMember == null) {
        return;
      }
      const reason = `Rule ${parsedData.ruleNumber + 1} - ${
        Constants.RULES[parsedData.ruleNumber]
      }`;
      await BanishUtil.banish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        parsedData.targetRoleId as string,
        "add",
        "interaction",
        reason
      );
    } else if (parsedData.commandName === "punish") {
      const botQueueChannel = (await interaction.guild.channels.fetch(
        Constants.CHANNELS.MOD_QUEUE
      )) as TextChannel;
      const logMessage = await botQueueChannel.messages.fetch(
        parsedData.logMessageId as Snowflake
      );
      const channel = (await interaction.guild.channels.fetch(
        parsedData.channelId as Snowflake
      )) as TextChannel;
      const message = await channel.messages.fetch(parsedData.messageId as Snowflake);
      const targetMember = await interaction.guild.members.fetch(message.author.id);
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
        targetMember.id,
        interaction.user,
        logMessage,
        "Punished"
      );
      await setTimeout(10000, "result");
      await messageSent.delete();
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
    const ruleNumber = parseInt(interaction.values[0], 10);
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
      const [channelId, messageId, logMessageId, amount] = split;
      return this.some({
        commandName,
        channelId,
        messageId,
        logMessageId,
        amount: parseInt(amount, 10),
        ruleNumber,
        targetMemberId: null,
        targetRoleId: null,
      });
    }
    return this.none();
  }
}
