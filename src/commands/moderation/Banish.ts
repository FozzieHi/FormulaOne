import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ComponentType,
  ContextMenuCommandInteraction,
  GuildMember,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
} from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { getPermLevel, isModerator } from "../../services/ModerationService.js";
import { banish } from "../../utility/BanishUtil.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import TryVal from "../../utility/TryVal.js";

export class BanishCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      // requiredClientPermissions: ["MANAGE_ROLES"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Helpers", "MemberValidation"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    const roleChoices: Array<ApplicationCommandOptionChoiceData<string>> = [];
    Constants.BANISH_ROLES.forEach((role) =>
      roleChoices.push({ name: role.name, value: role.id }),
    );

    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Banish a member from a channel.",
        options: [
          {
            name: "add",
            description: "Add a banished role to a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to banish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the banish",
                type: ApplicationCommandOptionType.String,
                choices: getRuleChoices(),
                required: true,
              },
              {
                name: "channel",
                description: "The channel to banish the member from",
                type: ApplicationCommandOptionType.String,
                choices: roleChoices,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove a banished role from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to unbanish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the unbanish",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
              {
                name: "channel",
                description: "The channel to unbanish the member from",
                type: ApplicationCommandOptionType.String,
                choices: roleChoices,
                required: true,
              },
            ],
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147652972105748"],
      },
    );

    registry.registerContextMenuCommand(
      {
        name: "Banish",
        type: ApplicationCommandType.Message,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1062507523728478269"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember("member") as GuildMember;
    let reason;
    if (subcommand === "add") {
      const rule = interaction.options.getString("reason");
      if (rule == null) {
        return;
      }
      reason = `${rule} - ${Constants.RULES[rule]}`;
    } else if (subcommand === "remove") {
      reason = interaction.options.getString("reason");
    }
    const roleId = interaction.options.getString("channel");
    if (roleId == null || reason == null) {
      return;
    }

    await banish(interaction, member, roleId, subcommand, "command", reason);
  }

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    const message = interaction.options.getMessage("message");
    if (interaction.guild == null || message == null) {
      return;
    }
    const moderator = interaction.member as GuildMember;
    const targetMember = (await TryVal(
      interaction.guild.members.fetch(message.author.id),
    )) as GuildMember;
    if (moderator == null || targetMember == null) {
      return;
    }

    if (
      (await isModerator(interaction.guild, targetMember.user)) ||
      ((await getPermLevel(interaction.guild, moderator.user)) === 0 &&
        targetMember.roles.cache.has(Constants.ROLES.HELPERS))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator.",
      );
      return;
    }

    const roleOptions: Array<SelectMenuComponentOptionData> = [];
    if ((await getPermLevel(interaction.guild, moderator.user)) > 0) {
      Constants.BANISH_ROLES.forEach((role) =>
        roleOptions.push({ label: role.name, value: role.id }),
      );
    } else {
      roleOptions.push({
        label: "f1-beginner-questions",
        value: Constants.ROLES.BEGINNERS_QUESTIONS,
      });
    }
    const optionSelect: Array<Array<StringSelectMenuBuilder>> = [
      [
        new StringSelectMenuBuilder({
          customId: `banishchannelselect-${targetMember.id}`,
          placeholder: "Select banish channel",
          options: roleOptions,
        }),
      ],
    ];

    await replyInteraction(interaction, undefined, null, {
      content: "Please select a channel.",
      components: optionSelect.map((selectmenu) => ({
        type: ComponentType.ActionRow,
        components: selectmenu,
      })),
    });
  }
}
