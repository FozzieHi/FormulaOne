import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  Guild,
  GuildMember,
  ButtonBuilder,
  SelectMenuInteraction,
  ComponentType,
  ButtonStyle,
} from "discord.js";
import { updateInteraction } from "../../utility/Sender.js";
import TryVal from "../../utility/TryVal.js";

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
    const member = (await TryVal(
      (interaction.guild as Guild).members.fetch(parsedData.targetMemberId)
    )) as GuildMember;
    if (member == null) {
      return;
    }

    const buttons: Array<Array<ButtonBuilder>> = [
      [
        new ButtonBuilder({
          customId: `addremoveoption-add-banish-${parsedData.targetMemberId}-${parsedData.targetRoleId}`,
          label: "Add",
          style: ButtonStyle.Success,
          disabled: member.roles.cache.has(parsedData.targetRoleId),
        }),
        new ButtonBuilder({
          customId: `addremoveoption-remove-banish-${parsedData.targetMemberId}-${parsedData.targetRoleId}`,
          label: "Remove",
          style: ButtonStyle.Danger,
          disabled: !member.roles.cache.has(parsedData.targetRoleId),
        }),
      ],
    ];

    await updateInteraction(interaction, undefined, null, {
      content: "Please select an action.",
      components: buttons.map((button) => ({
        type: ComponentType.ActionRow,
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
