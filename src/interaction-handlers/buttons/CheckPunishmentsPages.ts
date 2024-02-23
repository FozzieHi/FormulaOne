import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ButtonInteraction,
  ButtonBuilder,
  APIEmbed,
  User,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { getHistory } from "../../utility/PunishmentUtil.js";
import { Embed } from "../../structures/Embed.js";
import { getFields, updateInteraction } from "../../utility/Sender.js";
import TryVal from "../../utility/TryVal.js";
import { getUserTag } from "../../utility/StringUtil.js";

export class CheckPunishmentsPagesInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    const user = (await TryVal(
      interaction.client.users.fetch(parsedData.userId),
    )) as User;
    if (user == null || interaction.guild == null) {
      return;
    }
    const newPage =
      parsedData.action === "ppage" ? parsedData.pageNum - 1 : parsedData.pageNum + 1;
    if (newPage < 1 || newPage > parsedData.maxPages) {
      return;
    }
    const fieldsAndValues = await getHistory(
      user,
      interaction.guild,
      (newPage - 1) * 5,
    );
    const embed = interaction.message.embeds.at(0);
    if (embed == null) {
      return;
    }
    const embedOptions: APIEmbed = {
      title: `${getUserTag(user)}'s Punishment History (${newPage}/${
        parsedData.maxPages
      })`,
      color: embed.color ?? undefined,
      fields: getFields(fieldsAndValues),
      footer: {
        text: `${getUserTag(user)} has ${parsedData.currentPun} punishment${
          parsedData.currentPun !== 1 ? "s" : ""
        } in the last 30 days`,
      },
    };

    const buttons: Array<Array<ButtonBuilder>> = [
      [
        new ButtonBuilder({
          customId: `ppage-${newPage}-${parsedData.maxPages}-${parsedData.currentPun}-${user.id}`,
          emoji: "⬅",
          style: ButtonStyle.Secondary,
          disabled: newPage === 1,
        }),
        new ButtonBuilder({
          customId: `npage-${newPage}-${parsedData.maxPages}-${parsedData.currentPun}-${user.id}`,
          emoji: "➡",
          style: ButtonStyle.Secondary,
          disabled: newPage === parsedData.maxPages,
        }),
      ],
    ];

    await updateInteraction(interaction, undefined, null, {
      embeds: [new Embed(embedOptions)],
      components: buttons.map((button) => ({
        type: ComponentType.ActionRow,
        components: button,
      })),
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (
      !interaction.customId.startsWith("ppage-") &&
      !interaction.customId.startsWith("npage-")
    ) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    const [action, pageNum, maxPages, currentPun, userId] = split;
    return this.some({
      action,
      pageNum: parseInt(pageNum, 10),
      maxPages: parseInt(maxPages, 10),
      currentPun: parseInt(currentPun, 10),
      userId,
    });
  }
}
