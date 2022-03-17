import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";

export class FlairCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["MANAGE_NICKNAMES"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change your flair.",
        options: [
          {
            name: "flair",
            description: "The flair",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["953938047404245023"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const flair = interaction.options.getString("flair");
    if (flair == null) {
      return;
    }
    const newNickname = `${interaction.user.username} [${flair}]`;
    if (newNickname.length > 32) {
      await replyInteractionError(
        interaction,
        "The nickname length (username, brackets and flair) must not exceed 32 characters."
      );
    }

    await (interaction.member as GuildMember).setNickname(newNickname, "Flair command");
    await replyInteraction(interaction, `Successfully set your flair to ${flair}.`);
  }
}
