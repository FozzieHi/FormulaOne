import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  ModalSubmitInteraction,
  Snowflake,
  TextChannel,
} from "discord.js";
import { banish } from "../../utility/BanishUtil.js";
import { ban } from "../../utility/BanUtil.js";
import MutexManager from "../../managers/MutexManager.js";
import { Constants } from "../../utility/Constants.js";
import TryVal from "../../utility/TryVal.js";
import { archiveLog } from "../../services/BotQueueService.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import ViolationService from "../../services/ViolationService.js";

export class ReasonOption extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(
    interaction: ModalSubmitInteraction,
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    if (interaction.guild == null || interaction.member == null) {
      return;
    }
    if (parsedData.commandName === "banish") {
      const targetMember = (await TryVal(
        interaction.guild.members.fetch(parsedData.targetMemberId),
      )) as GuildMember;
      if (targetMember == null) {
        return;
      }
      await banish(
        interaction,
        targetMember,
        parsedData.action as "add" | "remove",
        "interaction",
        parsedData.reason,
      );
    } else if (parsedData.commandName === "ban") {
      const targetUser = await TryVal(
        container.client.users.fetch(parsedData.targetMemberId),
      );
      if (targetUser == null) {
        return;
      }
      const channel = (await TryVal(
        interaction.guild.channels.fetch(parsedData.channelId as Snowflake),
      )) as GuildTextBasedChannel;
      if (channel == null) {
        return;
      }
      await MutexManager.getUserMutex(targetUser.id).runExclusive(async () => {
        if (interaction.message == null) {
          return;
        }
        if (ViolationService.handled.includes(interaction.message.id)) {
          await replyInteractionError(interaction, "Log has already been handled.");
          return;
        }
        const logMessage = await TryVal(
          (interaction.channel as TextChannel).messages.fetch(interaction.message.id),
        );
        if (logMessage == null) {
          return;
        }
        const result = await ban(
          interaction.guild as Guild,
          targetUser,
          interaction.member as GuildMember,
          parsedData.reason,
          interaction.channel as GuildTextBasedChannel,
          channel,
          Constants.SECONDS_PER_DAY,
        );
        if (!result) {
          await replyInteractionError(interaction, "Error banning user.");
          return;
        }
        await archiveLog(
          interaction.guild as Guild,
          interaction.channel as TextChannel,
          targetUser.id,
          interaction.member as GuildMember,
          logMessage,
          "Banned",
        );
        await replyInteraction(interaction, "Successfully banned user.", {
          color: Constants.UNMUTE_COLOR,
        });
        ViolationService.handled.push(interaction.message.id);
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
      const [targetMemberId, action] = split;
      return this.some({
        commandName,
        targetMemberId,
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
        action: null,
        channelId,
        reason,
      });
    }
    return this.none();
  }
}
