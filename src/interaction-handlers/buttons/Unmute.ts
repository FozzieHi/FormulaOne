import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ButtonInteraction,
  Guild,
  GuildMember,
  Snowflake,
  TextChannel,
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";
import MutexManager from "../../managers/MutexManager.js";
import TryVal from "../../utility/TryVal.js";
import { getPermLevel, isModerator, modLog } from "../../services/ModerationService.js";
import { getDisplayTag } from "../../utility/StringUtil.js";

export class UnmuteInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, memberId: Snowflake) {
    if (
      interaction.guild == null ||
      interaction.member == null ||
      interaction.channel == null
    ) {
      return;
    }
    if (!(await isModerator(interaction.guild, interaction.user))) {
      await replyInteractionError(
        interaction,
        "You must be a Marshal in order to use this command.",
      );
      return;
    }
    if (
      interaction.channel.id === Constants.CHANNELS.STEWARDS_QUEUE &&
      (await getPermLevel(interaction.guild, interaction.user)) < 2
    ) {
      await replyInteractionError(
        interaction,
        "You must be a Steward in order to use this command.",
      );
      return;
    }
    const targetMember = (await TryVal(
      interaction.guild.members.fetch(memberId),
    )) as GuildMember;
    await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
      await targetMember.roles.remove(
        Constants.ROLES.MUTED,
        `(${getDisplayTag(interaction.member as GuildMember)}) moderation-queue Button Unmute`,
      );
      await replyInteraction(interaction, "Successfully unmuted member.", {
        color: Constants.UNMUTE_COLOR,
      });
      await modLog(
        interaction.guild as Guild,
        interaction.member as GuildMember,
        [
          "Action",
          "Unmute",
          "Member",
          `${getDisplayTag(targetMember)} (${targetMember.id})`,
          "Reason",
          "moderation-queue Button Unmute",
          "Channel",
          (interaction.channel as TextChannel).toString(),
        ],
        Constants.UNMUTE_COLOR,
        targetMember.user,
      );
      await archiveLog(
        interaction.guild as Guild,
        interaction.channel as TextChannel,
        memberId,
        interaction.member as GuildMember,
        interaction.message,
        "Unmuted",
      );
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("unmute-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("-").at(1));
  }
}
