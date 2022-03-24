import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, TextBasedChannel } from "discord.js";
import { replyInteraction, send } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";

export class SayCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Stewards"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Send a message to a channel.",
        options: [
          {
            name: "channel",
            description: "The channel to send the message to",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
          {
            name: "message",
            description: "The message to send",
            type: "STRING",
            required: true,
          },
        ],
        defaultPermission: false,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["956490929747918899"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const channel = interaction.options.getChannel("channel") as TextBasedChannel;
    const message = interaction.options.getString("message");
    if (channel == null || message == null) {
      return;
    }

    await send(channel, message);
    await replyInteraction(interaction, "Successfully sent the message.");
  }
}
