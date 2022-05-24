import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ModalSubmitInteraction } from "discord.js";
import { BanishUtil } from "../../utility/BanishUtil";

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
    if (parsedData.commandName === "banish") {
      const moderator = interaction.guild.members.cache.get(parsedData.moderatorId);
      const targetMember = interaction.guild.members.cache.get(
        parsedData.targetMemberId
      );
      if (moderator == null || targetMember == null) {
        return;
      }
      await BanishUtil.banish(
        interaction,
        moderator,
        targetMember,
        parsedData.targetRoleId,
        "remove",
        "interaction",
        parsedData.reason
      );
    }
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("reasonoption-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [commandName, moderatorId, targetMemberId, targetRoleId, action] = split;
    const reason = interaction.fields.getTextInputValue("reason");
    return this.some({
      commandName,
      moderatorId,
      targetMemberId,
      targetRoleId,
      action,
      reason,
    });
  }
}
