import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  MessageSelectMenu,
  MessageSelectOptionData,
  TextInputComponent,
} from "discord.js";
import { Constants } from "../../utility/Constants";
import { updateInteraction } from "../../utility/Sender";

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
      const ruleOptions: Array<MessageSelectOptionData> = [];
      Constants.RULES.forEach((rule, i) => {
        ruleOptions.push({
          label: `Rule ${i + 1}`,
          description: rule,
          value: i.toString(),
        });
      });
      const optionSelect: Array<Array<MessageSelectMenu>> = [
        [
          new MessageSelectMenu({
            customId: `ruleselect-${parsedData.commandName}-${parsedData.targetMemberId}-${parsedData.targetRoleId}-${parsedData.action}`,
            placeholder: "Select rule",
            options: ruleOptions,
          }),
        ],
      ];

      await updateInteraction(interaction, undefined, null, {
        content: "Please select a rule.",
        components: optionSelect.map((selectmenu) => ({
          type: "ACTION_ROW",
          components: selectmenu,
        })),
      });
    } else if (parsedData.action === "remove") {
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
        customId: `reasonoption-${parsedData.commandName}-${parsedData.targetMemberId}-${parsedData.targetRoleId}-${parsedData.action}`,
        title: "Reason",
        components: inputs.map((input) => ({
          type: "ACTION_ROW",
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
    const [commandName, targetMemberId, targetRoleId, action] = split;
    return this.some({
      commandName,
      targetMemberId,
      targetRoleId,
      action,
    });
  }
}
