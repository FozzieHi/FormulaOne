import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { updateInteraction } from "../../utility/Sender.js";

export class AmountSelect extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(
    interaction: SelectMenuInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    const ruleOptions: Array<MessageSelectOptionData> = [];
    Constants.RULES.forEach((rule, i) => {
      ruleOptions.push({
        label: `Rule ${i + 1}`,
        description: rule,
        value: i.toString(),
      });
    });
    const ruleSelect: Array<Array<MessageSelectMenu>> = [
      [
        new MessageSelectMenu({
          customId: `ruleselect-punish-${parsedData.targetMemberId}-${parsedData.channelId}-${parsedData.messageId}-${parsedData.logMessageId}-${parsedData.amount}`,
          placeholder: "Select rule",
          options: ruleOptions,
        }),
      ],
    ];

    await updateInteraction(interaction, undefined, null, {
      content: "Please select a rule.",
      components: ruleSelect.map((selectmenu) => ({
        type: "ACTION_ROW",
        components: selectmenu,
      })),
    });
  }

  public parse(interaction: SelectMenuInteraction) {
    if (!interaction.customId.startsWith("amountselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [targetMemberId, channelId, messageId, logMessageId] = split;
    const amount = interaction.values[0];
    return this.some({
      targetMemberId,
      channelId,
      messageId,
      logMessageId,
      amount,
    });
  }
}
