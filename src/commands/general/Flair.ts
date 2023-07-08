import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { replyInteractionError, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";

export class FlairCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["ManageNicknames"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change your flair.",
        options: [
          {
            name: "set",
            description: "Set a new flair.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "flair",
                description: "The flair to set",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove your flair.",
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147655698403328"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "set") {
      const flair = interaction.options.getString("flair");
      if (flair == null) {
        return;
      }
      const newNickname = `${interaction.user.username} [${flair}]`;
      if (newNickname.length > 32) {
        await replyInteractionError(
          interaction,
          "The nickname length (username, brackets and flair) must not exceed 32 characters.",
        );
        return;
      }

      await (interaction.member as GuildMember).setNickname(
        newNickname,
        "Flair set command",
      );
      await replyInteractionPublic(
        interaction,
        `Successfully set your flair to ${flair}.`,
      );
    } else if (subcommand === "remove") {
      await (interaction.member as GuildMember).setNickname(
        null,
        "Flair remove command",
      );
      await replyInteractionPublic(interaction, `Successfully removed your flair.`);
    }
  }
}
