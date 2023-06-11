import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  ComponentType,
  ChatInputCommandInteraction,
  APIEmbed,
} from "discord.js";
import {
  replyInteractionPublic,
  replyInteractionPublicFields,
} from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { getHistory } from "../../utility/PunishmentUtil.js";
import { getDBUser } from "../../utility/DatabaseUtil.js";
import { boldify, getUserTag } from "../../utility/StringUtil.js";

export class CheckPunishmentsCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Marshals"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "View a user's punishment history.",
        options: [
          {
            name: "user",
            description: "The user to lookup",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147654310088714"],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    if (user == null || interaction.channel == null || interaction.guild == null) {
      return;
    }

    const dbUser = await getDBUser(user.id, interaction.guild.id);
    if (dbUser?.punishments == null || dbUser.punishments.length === 0) {
      await replyInteractionPublic(
        interaction,
        `${boldify(getUserTag(user))} has a clean slate.`,
        { color: Constants.UNBAN_COLOR }
      );
      return;
    }
    const fieldsAndValues = await getHistory(user, interaction.guild);
    const maxPages = Math.max(1, Math.ceil(dbUser.punishments.length / 5));
    const embedOptions: APIEmbed = {
      title: `${getUserTag(user)}'s Punishment History (1/${maxPages})`,
      footer: {
        text: `${getUserTag(user)} has ${dbUser.currentPunishment} punishment${
          dbUser.currentPunishment !== 1 ? "s" : ""
        } in the last 30 days`,
      },
    };

    const buttons: Array<Array<ButtonBuilder>> = [
      [
        new ButtonBuilder({
          customId: `ppage-1-${maxPages}-${dbUser.currentPunishment}-${user.id}`,
          emoji: "⬅",
          style: ButtonStyle.Secondary,
          disabled: true,
        }),
        new ButtonBuilder({
          customId: `npage-1-${maxPages}-${dbUser.currentPunishment}-${user.id}`,
          emoji: "➡",
          style: ButtonStyle.Secondary,
          disabled: dbUser.punishments.length <= 5,
        }),
      ],
    ];

    await replyInteractionPublicFields(interaction, fieldsAndValues, embedOptions, {
      components: buttons.map((button) => ({
        type: ComponentType.ActionRow,
        components: button,
      })),
    });
  }
}
