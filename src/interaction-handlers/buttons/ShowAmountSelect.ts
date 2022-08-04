import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  MessageSelectMenu,
  MessageSelectOptionData,
  TextChannel,
} from "discord.js";
import { getDBUser } from "../../utility/DatabaseUtil";
import { replyInteractionError } from "../../utility/Sender";
import { StringUtil } from "../../utility/StringUtil";

export class ShowAmountSelect extends InteractionHandler {
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
    const channel = (await interaction.guild.channels.fetch(
      parsedData.channelId
    )) as TextChannel;
    const message = await channel.messages.fetch(parsedData.messageId);
    const dbUser = await getDBUser(message.author.id, interaction.guild.id);
    if (dbUser == null) {
      return;
    }
    if (dbUser.currentPunishment > 4) {
      await replyInteractionError(
        interaction,
        `${StringUtil.boldify(
          message.author.tag
        )} has exceeded 5 punishments in the last 30 days, escalate their punishment manually.`
      );
      return;
    }

    const amounts = [];
    for (let i = 1; i <= 5 - dbUser.currentPunishment; i += 1) {
      amounts.push(i.toString());
    }
    const options: Array<MessageSelectOptionData> = [];
    amounts.forEach((amount) => options.push({ label: amount, value: amount }));

    const amountSelect = [
      [
        new MessageSelectMenu({
          customId: `amountselect-${parsedData.channelId}-${parsedData.messageId}-${interaction.message.id}`,
          placeholder: "Select amount",
          options,
        }),
      ],
    ];
    await interaction.reply({
      content: "Please select a punishment amount.",
      components: amountSelect.map((selectmenu) => ({
        type: "ACTION_ROW",
        components: selectmenu,
      })),
      ephemeral: true,
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("showamountselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [channelId, messageId] = split;
    return this.some({
      channelId,
      messageId,
    });
  }
}
