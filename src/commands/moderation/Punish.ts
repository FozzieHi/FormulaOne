import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  MessageContextMenuCommandInteraction,
  User,
} from "discord.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import { Constants } from "../../utility/Constants.js";
import { punish } from "../../utility/PunishUtil.js";
import MutexManager from "../../managers/MutexManager.js";
import { showAmountSelect } from "../../interaction-handlers/buttons/ShowAmountSelect.js";

export class PunishCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Marshals", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Adjust a user's punishments.",
        options: [
          {
            name: "add",
            description: "Add a punishment to a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to punish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the punish",
                type: ApplicationCommandOptionType.String,
                choices: getRuleChoices(),
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove a punishment from a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to unpunish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the unpunish",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["985885134408536104"],
      },
    );

    registry.registerContextMenuCommand(
      {
        name: "Punish",
        type: ApplicationCommandType.Message,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1085683717802049556"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser("user") as User;
    let reason: string | null;
    if (subcommand === "add") {
      const rule = interaction.options.getString("reason");
      if (rule == null) {
        return;
      }
      reason = `${rule} - ${Constants.RULES[rule]}`;
    } else if (subcommand === "remove") {
      reason = interaction.options.getString("reason");
    }
    await MutexManager.getUserMutex(targetUser.id).runExclusive(async () => {
      if (reason == null) {
        return;
      }
      await punish(
        interaction,
        interaction.member as GuildMember,
        targetUser,
        subcommand,
        reason,
        1,
      );
    });
  }

  public async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.channel == null || interaction.targetMessage == null) {
      return;
    }

    await showAmountSelect(
      interaction,
      interaction.targetMessage.author.id,
      interaction.channel.id,
      interaction.targetMessage.id,
    );
  }
}
