import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  ModalSubmitInteraction,
  Snowflake,
  TextChannel,
} from "discord.js";
import { BanishUtil } from "../../utility/BanishUtil";
import { ModerationUtil } from "../../utility/ModerationUtil";
import { BotQueueService } from "../../services/BotQueueService";
import { replyInteraction } from "../../utility/Sender";
import MutexManager from "../../managers/MutexManager";
import { Constants } from "../../utility/Constants";
import TryVal from "../../utility/TryVal";

export class ReasonOption extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(
    interaction: ModalSubmitInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    if (interaction.guild == null) {
      return;
    }
    const targetMember = await interaction.guild.members.fetch(
      parsedData.targetMemberId
    );
    if (targetMember == null) {
      return;
    }
    if (parsedData.commandName === "banish") {
      await BanishUtil.banish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        parsedData.targetRoleId as string,
        parsedData.action as string,
        "interaction",
        parsedData.reason
      );
    } else if (parsedData.commandName === "ban") {
      await interaction.deferReply({ ephemeral: true });
      const channel = (await interaction.guild.channels.fetch(
        parsedData.channelId as Snowflake
      )) as GuildTextBasedChannel;
      if (channel == null) {
        return;
      }
      await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
        const logMessage = await TryVal(
          (interaction.channel as TextChannel).messages.fetch(
            (interaction.message as Message).id
          )
        );
        if (logMessage == null) {
          return;
        }
        await ModerationUtil.ban(
          interaction.guild as Guild,
          targetMember.user,
          interaction.user,
          parsedData.reason,
          channel
        );
        await BotQueueService.archiveLog(
          interaction.guild as Guild,
          targetMember.id,
          interaction.user,
          logMessage as Message,
          "Banned"
        );
        await replyInteraction(interaction, "Successfully banned user.", {
          color: Constants.UNMUTE_COLOR,
        });
      });
    }
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("reasonoption-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [commandName] = split;
    split.shift();
    const reason = interaction.fields.getTextInputValue("reason");
    if (commandName === "banish") {
      const [targetMemberId, targetRoleId, action] = split;
      return this.some({
        commandName,
        targetMemberId,
        targetRoleId,
        action,
        channelId: null,
        reason,
      });
    }
    if (commandName === "ban") {
      const [targetMemberId, channelId] = split;
      return this.some({
        commandName,
        targetMemberId,
        targetRoleId: null,
        action: null,
        channelId,
        reason,
      });
    }
    return this.none();
  }
}
