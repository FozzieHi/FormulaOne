import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, TextInputComponent } from "discord.js";
import { StringUtil } from "../../utility/StringUtil";

export class ShowReasonOptionInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    const inputs = [
      [
        new TextInputComponent({
          customId: "reason",
          label: "Please provide a reason",
          style: "SHORT",
        }),
      ],
    ];
    await interaction.showModal({
      customId: `reasonoption-${parsedData.action}-${interaction.user.id}-${parsedData.targetUserId}-${parsedData.channelId}`,
      title: `${StringUtil.upperFirstChar(parsedData.action)} Reason`,
      components: inputs.map((input) => ({
        type: "ACTION_ROW",
        components: input,
      })),
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("showreasonoption-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [action, targetUserId, channelId] = split;
    return this.some({ action, targetUserId, channelId });
  }
}
