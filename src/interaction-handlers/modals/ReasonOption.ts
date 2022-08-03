import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  Guild,
  GuildTextBasedChannel,
  Message,
  ModalSubmitInteraction,
  Snowflake,
} from "discord.js";
import { BanishUtil } from "../../utility/BanishUtil";
import { ModerationUtil } from "../../utility/ModerationUtil";
import { BotQueueService } from "../../services/BotQueueService";
import { replyInteraction } from "../../utility/Sender";
import MutexManager from "../../managers/MutexManager";
import { Constants } from "../../utility/Constants";

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
    const moderator = await interaction.guild.members.fetch(parsedData.moderatorId);
    const targetMember = await interaction.guild.members.fetch(
      parsedData.targetMemberId
    );
    if (moderator == null || targetMember == null) {
      return;
    }
    if (parsedData.commandName === "banish") {
      await BanishUtil.banish(
        interaction,
        moderator,
        targetMember,
        parsedData.targetRoleId as string,
        parsedData.action as string,
        "interaction",
        parsedData.reason
      );
    } else if (parsedData.commandName === "ban") {
      const channel = (await interaction.guild.channels.fetch(
        parsedData.channelId as Snowflake
      )) as GuildTextBasedChannel;
      if (channel == null) {
        return;
      }
      await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
        await ModerationUtil.ban(
          interaction.guild as Guild,
          targetMember.user,
          moderator.user,
          parsedData.reason,
          channel
        );
        await BotQueueService.archiveLog(
          interaction.guild as Guild,
          targetMember.id,
          moderator.user,
          interaction.message as Message,
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
      const [moderatorId, targetMemberId, targetRoleId, action] = split;
      return this.some({
        commandName,
        moderatorId,
        targetMemberId,
        targetRoleId,
        action,
        channelId: null,
        reason,
      });
    }
    if (commandName === "ban") {
      const [moderatorId, targetMemberId, channelId] = split;
      return this.some({
        commandName,
        moderatorId,
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
