import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Message, Snowflake, TextChannel } from "discord.js";
import { Constants } from "../../utility/Constants";
import { replyInteraction } from "../../utility/Sender";
import { BotQueueService } from "../../services/BotQueueService";

export class UnmuteInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, memberId: Snowflake) {
    if (interaction.guild == null) {
      return;
    }
    const member = await interaction.guild.members.fetch(memberId);
    await member.roles.remove(Constants.ROLES.MUTED);
    await replyInteraction(interaction, "Successfully unmuted member.", {
      color: Constants.UNMUTE_COLOR,
    });
    await BotQueueService.archiveLog(
      interaction.guild,
      interaction.channel as TextChannel,
      memberId,
      interaction.user,
      interaction.message as Message,
      "Unmuted"
    );
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("unmute-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("-")[1]);
  }
}
