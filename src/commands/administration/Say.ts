import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  ChannelType,
  TextBasedChannel,
} from "discord.js";
import { replyInteractionPublic, send } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";

export class SayCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Stewards"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Send a message to a channel.",
        options: [
          {
            name: "channel",
            description: "The channel to send the message to",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message",
            description: "The message to send",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147740314284052"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel") as TextBasedChannel;
    const message = interaction.options.getString("message");
    if (channel == null || message == null || channel.type !== ChannelType.GuildText) {
      return;
    }

    await send(channel, message);
    await replyInteractionPublic(interaction, "Successfully sent the message.");
  }
}
