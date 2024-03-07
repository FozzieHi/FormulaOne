import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ComponentType,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
  StringSelectMenuInteraction,
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { updateInteraction } from "../../utility/Sender.js";

export class AmountSelect extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(
    interaction: StringSelectMenuInteraction,
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
          customId: `ruleselect-punish-${parsedData.targetUserId}-${parsedData.channelId}-${parsedData.messageId}-${parsedData.logMessageId}-${parsedData.amount}`,
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

  public parse(interaction: StringSelectMenuInteraction) {
    if (!interaction.customId.startsWith("amountselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [targetUserId, channelId, messageId, logMessageId] = split;
    const amount = interaction.values.at(0);
    return this.some({
      targetUserId,
      channelId,
      messageId,
      logMessageId,
      amount,
    });
  }
}
