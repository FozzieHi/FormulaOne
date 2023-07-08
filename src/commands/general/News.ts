import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import {
  ButtonBuilder,
  TextBasedChannel,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  ButtonStyle,
  ComponentType,
  GuildMember,
} from "discord.js";
import { replyInteractionError, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { boldify, getDisplayTag } from "../../utility/StringUtil.js";
import TryVal from "../../utility/TryVal.js";

export class NewsCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      preconditions: ["F2"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Post a URL to #news.",
        options: [
          {
            name: "url",
            description: "The URL to send",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147657053167616"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url");
    if (interaction.guild == null || interaction.member == null || url == null) {
      return;
    }
    if (!Constants.REGEXES.URL.test(url)) {
      await replyInteractionError(interaction, "That is not a valid URL.");
      return;
    }

    const newsChannel = (await TryVal(
      interaction.guild.channels.fetch(Constants.CHANNELS.NEWS),
    )) as TextBasedChannel;
    if (newsChannel == null) {
      return;
    }

    const buttons: Array<Array<ButtonBuilder>> = [
      [
        new ButtonBuilder({
          customId: `publish-${interaction.user.id}`,
          label: "Publish",
          style: ButtonStyle.Secondary,
        }),
      ],
    ];
    await newsChannel.send({
      content: `${url} sent by ${boldify(
        getDisplayTag(interaction.member as GuildMember),
      )}`,
      components: buttons.map((button) => ({
        type: ComponentType.ActionRow,
        components: button,
      })),
    });
    await replyInteractionPublic(
      interaction,
      `Successfully posted to ${newsChannel.toString()}.`,
    );
  }
}
