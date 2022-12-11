import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  Message,
  TextChannel,
  TextInputComponent,
} from "discord.js";
import { upperFirstChar } from "../../utility/StringUtil.js";
import Try from "../../utility/Try.js";
import { replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";

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
    if (interaction.guild == null) {
      return;
    }
    if (parsedData.action === "ban") {
      if (await Try(interaction.guild.bans.fetch(parsedData.targetUserId))) {
        await archiveLog(
          interaction.guild,
          interaction.channel as TextChannel,
          parsedData.targetUserId,
          null,
          interaction.message as Message,
          "Already banned"
        );
        await replyInteractionError(interaction, "Member is already banned.");
        return;
      }
    }
    const inputs = [
      [
        new TextInputComponent({
          customId: "reason",
          label: "Please provide a reason",
          style: "SHORT",
          required: true,
        }),
      ],
    ];
    await interaction.showModal({
      customId: `reasonoption-${parsedData.action}-${parsedData.targetUserId}-${parsedData.channelId}`,
      title: `${upperFirstChar(parsedData.action)} Reason`,
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
