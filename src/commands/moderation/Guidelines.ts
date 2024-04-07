import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import { replyInteraction } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { getDBGuild } from "../../utility/DatabaseUtil.js";

export class GuidelinesCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Marshals"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "View the guidelines image.",
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1226559165116317736"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (interaction.guild == null) {
      return;
    }

    const dbGuild = await getDBGuild(interaction.guild.id);
    if (dbGuild == null) {
      return;
    }

    const image = dbGuild.images.guidelines;
    if (image == null) {
      return;
    }

    const attachment = new AttachmentBuilder(Buffer.from(image.buffer), {
      name: "guidelines.webp",
    });
    await replyInteraction(interaction, undefined, null, { files: [attachment] });
  }
}
