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
  ContextMenuCommandInteraction,
  GuildMember,
} from "discord.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import { Constants } from "../../utility/Constants.js";
import { punish } from "../../utility/PunishUtil.js";
import MutexManager from "../../managers/MutexManager.js";
import { showAmountSelect } from "../../interaction-handlers/buttons/ShowAmountSelect.js";

export class PunishCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Marshals", "MemberValidation", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Adjust a member's punishments.",
        options: [
          {
            name: "add",
            description: "Add a punishment to a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to punish",
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
            description: "Remove a punishment from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to unpunish",
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
      }
    );

    registry.registerContextMenuCommand(
      {
        name: "Punish (Dev)",
        type: ApplicationCommandType.Message,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1085683717802049556"],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetMember = interaction.options.getMember("member") as GuildMember;
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
    await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
      if (reason == null) {
        return;
      }
      await punish(
        interaction,
        interaction.member as GuildMember,
        targetMember,
        subcommand,
        reason,
        1
      );
    });
  }

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    const message = interaction.options.getMessage("message");
    if (interaction.channel == null || message == null) {
      return;
    }

    await showAmountSelect(
      interaction,
      message.author.id,
      interaction.channel.id,
      message.id
    );
  }
}
