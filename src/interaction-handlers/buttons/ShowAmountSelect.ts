import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
  Snowflake,
  ContextMenuCommandInteraction,
} from "discord.js";
import { getDBUser } from "../../utility/DatabaseUtil.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import TryVal from "../../utility/TryVal.js";
import { getPunishmentDisplay } from "../../utility/PunishUtil.js";
import { Constants } from "../../utility/Constants.js";
import { boldify, getUserTag } from "../../utility/StringUtil.js";
import { getPermLevel, isModerator } from "../../services/ModerationService.js";

export async function showAmountSelect(
  interaction: ButtonInteraction | ContextMenuCommandInteraction,
  targetUserId: Snowflake,
  channelId: Snowflake,
  messageId: Snowflake,
) {
  if (interaction.guild == null || interaction.channel == null) {
    return;
  }
  if (!(await isModerator(interaction.guild, interaction.user))) {
    await replyInteractionError(
      interaction,
      "You must be a Marshal in order to use this command.",
    );
    return;
  }
  if (
    interaction.channel.id === Constants.CHANNELS.STEWARDS_QUEUE &&
    (await getPermLevel(interaction.guild, interaction.user)) < 2
  ) {
    await replyInteractionError(
      interaction,
      "You must be a Steward in order to use this command.",
    );
    return;
  }
  const targetUser = await TryVal(container.client.users.fetch(targetUserId));
  if (targetUser == null) {
    return;
  }
  if (await isModerator(interaction.guild, targetUser)) {
    await replyInteractionError(
      interaction,
      "You may not use this command on a moderator.",
    );
    return;
  }

  const dbUser = await getDBUser(targetUser.id, interaction.guild.id);
  if (dbUser == null) {
    return;
  }
  if (dbUser.currentPunishment > Constants.PUNISHMENTS.length - 1) {
    await replyInteractionError(
      interaction,
      `${boldify(
        getUserTag(targetUser),
      )} has exceeded ${Constants.PUNISHMENTS.length} punishments in the last 30 days, escalate their punishment manually.`,
    );
    return;
  }

  const amounts = [];
  for (let i = 1; i <= 5 - dbUser.currentPunishment; i += 1) {
    amounts.push(i.toString());
  }
  const options: Array<SelectMenuComponentOptionData> = [];
  amounts.forEach((amount) => {
    const punishment = Constants.PUNISHMENTS.at(
      dbUser.currentPunishment + parseInt(amount, 10) - 1,
    );
    if (punishment != null) {
      options.push({
        label: `${amount} punishment${parseInt(amount, 10) !== 1 ? "s" : ""} (${
          getPunishmentDisplay(punishment).displayLog
        })`,
        value: amount,
      });
    }
  });

  const logMessageId = interaction.isButton() ? interaction.message.id : null;
  const amountSelect = [
    [
      new StringSelectMenuBuilder({
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        customId: `amountselect-${targetUserId}-${channelId}-${messageId}-${logMessageId}`,
        placeholder: "Select amount",
        options,
      }),
    ],
  ];
  await replyInteraction(interaction, undefined, null, {
    content: "Please select a punishment amount.",
    components: amountSelect.map((selectmenu) => ({
      type: ComponentType.ActionRow,
      components: selectmenu,
    })),
    ephemeral: true,
  });
}

export class ShowAmountSelect extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    await showAmountSelect(
      interaction,
      parsedData.targetUserId,
      parsedData.channelId,
      parsedData.messageId,
    );
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("showamountselect-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [targetUserId, channelId, messageId] = split;
    return this.some({
      targetUserId,
      channelId,
      messageId,
    });
  }
}
