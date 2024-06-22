import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  GuildBasedChannel,
  GuildTextBasedChannel,
} from "discord.js";
import { replyInteraction, send } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";

export class MoveChannelCommand extends Command {
  public constructor(context: never) {
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
        description: "Send a move channel message.",
        options: [
          {
            name: "to",
            description: "The channel to move to",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "from",
            description: "The channel to move from",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147565327921152"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const toChannel = interaction.options.getChannel("to") as GuildBasedChannel;
    const fromChannel = interaction.options.getChannel("from") as GuildBasedChannel;
    if (
      toChannel == null ||
      fromChannel == null ||
      toChannel.type !== ChannelType.GuildText ||
      fromChannel.type !== ChannelType.GuildText
    ) {
      return;
    }

    await send(
      fromChannel as GuildTextBasedChannel,
      `Please move to ${toChannel.toString()}.`,
    );
    await replyInteraction(interaction, "Successfully sent the message.");
  }
}
