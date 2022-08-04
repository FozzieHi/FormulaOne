import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionChoiceData,
  CommandInteraction,
  ContextMenuInteraction,
  GuildMember,
  MessageSelectMenu,
  MessageSelectOptionData,
} from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { ModerationService } from "../../services/ModerationService";
import { BanishUtil } from "../../utility/BanishUtil";
import { CommandUtil } from "../../utility/CommandUtil";

export class BanishCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      // requiredClientPermissions: ["MANAGE_ROLES"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Helpers", "MemberValidation"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    const roleChoices: Array<ApplicationCommandOptionChoiceData> = [];
    Constants.BANISH_ROLES.forEach((role) =>
      roleChoices.push({ name: role.name, value: role.id })
    );

    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Banish a member from a channel.",
        options: [
          {
            name: "add",
            description: "Add a banished role to a member",
            type: "SUB_COMMAND",
            options: [
              {
                name: "member",
                description: "The member to banish",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the banish",
                type: "NUMBER",
                choices: CommandUtil.getRuleChoices(),
                required: true,
              },
              {
                name: "channel",
                description: "The channel to banish the member from",
                type: "STRING",
                choices: roleChoices,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove a banished role from a member",
            type: "SUB_COMMAND",
            options: [
              {
                name: "member",
                description: "The member to unbanish",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the unbanish",
                type: "STRING",
                required: true,
              },
              {
                name: "channel",
                description: "The channel to unbanish the member from",
                type: "STRING",
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
      }
    );

    registry.registerContextMenuCommand(
      {
        name: "Banish",
        type: "MESSAGE",
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977175035930361976"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember("member") as GuildMember;
    let reason;
    if (subcommand === "add") {
      const ruleNumber = interaction.options.getNumber("reason");
      if (ruleNumber == null) {
        return;
      }
      reason = `Rule ${ruleNumber + 1} - ${Constants.RULES[ruleNumber]}`;
    } else if (subcommand === "remove") {
      reason = interaction.options.getString("reason");
    }
    const roleId = interaction.options.getString("channel");
    if (roleId == null || reason == null) {
      return;
    }

    await BanishUtil.banish(
      interaction,
      interaction.member as GuildMember,
      member,
      roleId,
      subcommand,
      "command",
      reason
    );
  }

  public async contextMenuRun(interaction: ContextMenuInteraction) {
    const message = interaction.options.getMessage("message");
    if (interaction.guild == null || message == null) {
      return;
    }
    const moderator = interaction.member as GuildMember;
    const targetMember = interaction.guild.members.cache.get(message.author.id);
    if (moderator == null || targetMember == null) {
      return;
    }

    if (
      (await ModerationService.isModerator(interaction.guild, targetMember.user)) ||
      ((await ModerationService.getPermLevel(interaction.guild, moderator.user)) ===
        0 &&
        targetMember.roles.cache.has(Constants.ROLES.HELPERS))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator."
      );
      return;
    }

    const roleOptions: Array<MessageSelectOptionData> = [];
    if ((await ModerationService.getPermLevel(interaction.guild, moderator.user)) > 0) {
      Constants.BANISH_ROLES.forEach((role) =>
        roleOptions.push({ label: role.name, value: role.id })
      );
    } else {
      roleOptions.push({
        label: "f1-beginner-questions",
        value: Constants.ROLES.BEGINNERS_QUESTIONS,
      });
    }
    const optionSelect: Array<Array<MessageSelectMenu>> = [
      [
        new MessageSelectMenu({
          customId: `banishchannelselect-${targetMember.id}`,
          placeholder: "Select banish channel",
          options: roleOptions,
        }),
      ],
    ];

    await replyInteraction(interaction, undefined, null, {
      content: "Please select a channel.",
      components: optionSelect.map((selectmenu) => ({
        type: "ACTION_ROW",
        components: selectmenu,
      })),
    });
  }
}
