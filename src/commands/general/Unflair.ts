import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";
import { replyInteraction } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";

export class UnflairCommand extends Command {
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
        description: "Remove your flair.",
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["953991544095010836"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    await (interaction.member as GuildMember).setNickname(null, "Unflair command");
    await replyInteraction(interaction, `Successfully removed your flair.`);
  }
}
