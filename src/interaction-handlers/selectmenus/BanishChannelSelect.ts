import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { Guild, MessageButton, SelectMenuInteraction } from "discord.js";
import { updateInteraction } from "../../utility/Sender.js";

export class BanishChannelSelect extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(
    interaction: SelectMenuInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    if (parsedData.targetMemberId == null || parsedData.targetRoleId == null) {
      return;
    }
    const member = (interaction.guild as Guild).members.cache.get(
      parsedData.targetMemberId
    );
    if (member == null) {
      return;
    }

    const buttons: Array<Array<MessageButton>> = [
      [
        new MessageButton({
          customId: `addremoveoption-add-banish-${parsedData.targetMemberId}-${parsedData.targetRoleId}`,
          label: "Add",
          style: "SUCCESS",
          disabled: member.roles.cache.has(parsedData.targetRoleId),
        }),
        new MessageButton({
          customId: `addremoveoption-remove-banish-${parsedData.targetMemberId}-${parsedData.targetRoleId}`,
          label: "Remove",
          style: "DANGER",
          disabled: !member.roles.cache.has(parsedData.targetRoleId),
        }),
      ],
    ];

    await updateInteraction(interaction, undefined, null, {
      content: "Please select an action.",
      components: buttons.map((button) => ({
        type: "ACTION_ROW",
        components: button,
      })),
    });
  }

  public parse(interaction: SelectMenuInteraction) {
    if (!interaction.customId.startsWith("banishchannelselect-")) {
      return this.none();
    }
    const targetMemberId = interaction.customId.split("-").at(1);
    const targetRoleId = interaction.values.at(0);
    return this.some({ targetMemberId, targetRoleId });
  }
}
