import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  CommandInteraction,
  GuildBasedChannel,
  GuildTextBasedChannel,
} from "discord.js";
import { replyInteraction, send } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";

export class MoveChannelCommand extends Command {
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
        description: "Send a move channel message.",
        options: [
          {
            name: "to",
            description: "The channel to move to",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
          {
            name: "from",
            description: "The channel to move from",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147565327921152"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const toChannel = interaction.options.getChannel("to") as GuildBasedChannel;
    const fromChannel = interaction.options.getChannel("from") as GuildBasedChannel;
    if (
      toChannel == null ||
      fromChannel == null ||
      !toChannel.isText() ||
      !fromChannel.isText()
    ) {
      return;
    }

    await send(
      fromChannel as GuildTextBasedChannel,
      `Please move to ${toChannel.toString()}.`
    );
    await replyInteraction(interaction, "Successfully sent the message.");
  }
}
