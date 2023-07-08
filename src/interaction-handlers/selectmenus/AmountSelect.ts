import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ComponentType,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
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
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    if (parsedData.amount == null) {
      return;
    }
    const ruleOptions: Array<SelectMenuComponentOptionData> = [];
    Object.entries(Constants.RULES).forEach(([name, rule]) => {
      ruleOptions.push({
        label: name,
        description: rule,
        value: name,
      });
    });
    const ruleSelect: Array<Array<StringSelectMenuBuilder>> = [
      [
        new StringSelectMenuBuilder({
          customId: `ruleselect-punish-${parsedData.targetMemberId}-${parsedData.channelId}-${parsedData.messageId}-${parsedData.logMessageId}-${parsedData.amount}`,
          placeholder: "Select rule",
          options: ruleOptions,
        }),
      ],
    ];

    await updateInteraction(interaction, undefined, null, {
      content: "Please select a rule.",
      components: ruleSelect.map((selectmenu) => ({
        type: ComponentType.ActionRow,
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
    const amount = interaction.values.at(0);
    return this.some({
      targetMemberId,
      channelId,
      messageId,
      logMessageId,
      amount,
    });
  }
}
