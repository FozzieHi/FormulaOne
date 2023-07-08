import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
} from "discord.js";
import { replyInteractionError, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import MutexManager from "../../managers/MutexManager.js";

export class ClearCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["ManageMessages"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Marshals"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Clear an amount of messages in the current channel.",
        options: [
          {
            name: "amount",
            description: "The amount of messages to delete",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxValue: 200,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147568360415242"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await MutexManager.getGuildMutex().runExclusive(async () => {
      const amount = interaction.options.getInteger("amount");
      if (
        amount == null ||
        interaction.channel == null ||
        interaction.guild == null ||
        interaction.member == null ||
        amount < 1 ||
        amount > 200
      ) {
        return;
      }
      if (interaction.channel.id === Constants.CHANNELS.MOD_LOGS) {
        await replyInteractionError(
          interaction,
          "You may not clear messages in the log channel.",
        );
        return;
      }

      await (interaction.channel as GuildTextBasedChannel).bulkDelete(amount);
      await replyInteractionPublic(
        interaction,
        `Successfully cleared ${amount} message${amount !== 1 ? "s" : ""}.`,
      );
      await modLog(
        interaction.guild,
        interaction.member as GuildMember,
        [
          "Action",
          "Clear",
          "Amount",
          `${amount} message${amount !== 1 ? "s" : ""}`,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.WARN_COLOR,
      );
    });
  }
}
