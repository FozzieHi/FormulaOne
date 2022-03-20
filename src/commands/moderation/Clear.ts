import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, GuildTextBasedChannel } from "discord.js";
import { replyInteractionPublic } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { modLog } from "../../services/ModerationService";

export class ClearCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["MANAGE_MESSAGES"],
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
        description: "Clear an amount of messages in the current channel.",
        options: [
          {
            name: "amount",
            description: "The amount of messages to delete",
            type: "INTEGER",
            required: true,
            minValue: 1,
            maxValue: 200,
          },
        ],
        defaultPermission: false,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["954305075306717194"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const amount = interaction.options.getInteger("amount");
    if (
      amount == null ||
      interaction.channel == null ||
      interaction.guild == null ||
      amount < 1 ||
      amount > 200
    ) {
      return;
    }
    await (interaction.channel as GuildTextBasedChannel).bulkDelete(amount);
    await replyInteractionPublic(
      interaction,
      `Successfully cleared ${amount} message${amount > 1 ? "s" : ""}.`
    );
    await modLog(interaction.guild, interaction.user, [
      "Action",
      "Clear",
      "Amount",
      `${amount} message${amount > 1 ? "s" : ""}`,
      "Channel",
      interaction.channel.toString(),
    ]);
  }
}
