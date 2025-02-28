import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { replyInteraction } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import db from "../../database/index.js";

export class LevelCommand extends Command {
  public constructor(context: never) {
    super(context);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "See your current Level.",
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147655698403328"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId as Snowflake;
    const userData = await db.userRepo?.getUser(userId, guildId);
    await replyInteraction(interaction, `You are Level ${userData?.level}.`);
  }
}
