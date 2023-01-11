import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
  TextInputStyle,
  ComponentType,
  TextInputBuilder,
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { updateInteraction } from "../../utility/Sender.js";

export class AddRemoveOption extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    if (parsedData.action === "add") {
      const ruleOptions: Array<SelectMenuComponentOptionData> = [];
      Constants.RULES.forEach((rule, i) => {
        ruleOptions.push({
          label: `Rule ${i + 1}`,
          description: rule,
          value: i.toString(),
        });
      });
      const optionSelect: Array<Array<StringSelectMenuBuilder>> = [
        [
          new StringSelectMenuBuilder({
            customId: `ruleselect-${parsedData.commandName}-${parsedData.targetMemberId}-${parsedData.targetRoleId}`,
            placeholder: "Select rule",
            options: ruleOptions,
          }),
        ],
      ];

      await updateInteraction(interaction, undefined, null, {
        content: "Please select a rule.",
        components: optionSelect.map((selectmenu) => ({
          type: ComponentType.ActionRow,
          components: selectmenu,
        })),
      });
    } else if (parsedData.action === "remove") {
      const inputs = [
        [
          new TextInputBuilder({
            customId: "reason",
            label: "Please provide a reason",
            style: TextInputStyle.Short,
            required: true,
          }),
        ],
      ];
      await interaction.showModal({
        customId: `reasonoption-${parsedData.commandName}-${parsedData.targetMemberId}-${parsedData.targetRoleId}-${parsedData.action}`,
        title: "Reason",
        components: inputs.map((input) => ({
          type: ComponentType.ActionRow,
          components: input,
        })),
      });
    }
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("addremoveoption-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [action, commandName, targetMemberId, targetRoleId] = split;
    return this.some({
      action,
      commandName,
      targetMemberId,
      targetRoleId,
    });
  }
}
