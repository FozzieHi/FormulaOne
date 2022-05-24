import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { SelectMenuInteraction } from "discord.js";
import { BanishUtil } from "../../utility/BanishUtil";
import { Constants } from "../../utility/Constants";

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
      const moderator = interaction.guild.members.cache.get(parsedData.moderatorId);
      const targetMember = interaction.guild.members.cache.get(
        parsedData.targetMemberId
      );
      if (moderator == null || targetMember == null) {
        return;
      }
      const reason = `Rule ${parsedData.ruleNumber + 1} - ${
        Constants.RULES[parsedData.ruleNumber]
      }`;
      await BanishUtil.banish(
        interaction,
        moderator,
        targetMember,
        parsedData.targetRoleId,
        "add",
        "interaction",
        reason
      );
    }
  }

  public parse(interaction: SelectMenuInteraction) {
    if (!interaction.customId.startsWith("ruleselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [commandName, moderatorId, targetMemberId, targetRoleId, action] = split;
    const ruleNumber = parseInt(interaction.values[0], 10);
    return this.some({
      commandName,
      moderatorId,
      targetMemberId,
      targetRoleId,
      action,
      ruleNumber,
    });
  }
}
