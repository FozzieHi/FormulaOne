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
  ComponentType,
  ContextMenuCommandInteraction,
  GuildMember,
  ButtonBuilder,
  ButtonStyle,
  GuildTextBasedChannel,
} from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { getPermLevel, isModerator } from "../../services/ModerationService.js";
import { banish } from "../../utility/BanishUtil.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import TryVal from "../../utility/TryVal.js";

export class BanishCommand extends Command {
  public constructor(context: never) {
    super(context, {
      // requiredClientPermissions: ["MANAGE_ROLES"],
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Helpers", "MemberValidation"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
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
    if (
      interaction.guild == null ||
      (await getPermLevel(interaction.guild, interaction.user)) === 0
    ) {
      return;
    }
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
    if (reason == null) {
      return;
    }

    await banish(
      interaction,
      member,
      subcommand as "add" | "remove",
      "command",
      reason,
    );
  }

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    const message = interaction.options.getMessage("message");
    if (interaction.guild == null || message == null) {
      return;
    }

    if (
      (await getPermLevel(interaction.guild, interaction.user)) === 0 &&
      (interaction.channel as GuildTextBasedChannel).parent?.id !==
        Constants.CHANNELS.F1_BEGINNER_QUESTIONS
    ) {
      await replyInteractionError(
        interaction,
        `You may only use this command in <#${Constants.CHANNELS.F1_BEGINNER_QUESTIONS}>.`,
      );
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

    const buttons: Array<Array<ButtonBuilder>> = [
      [
        new ButtonBuilder({
          customId: `addremoveoption-add-banish-${targetMember.id}`,
          label: "Add",
          style: ButtonStyle.Success,
          disabled: targetMember.roles.cache.has(Constants.ROLES.BANISHED),
        }),
        new ButtonBuilder({
          customId: `addremoveoption-remove-banish-${targetMember.id}`,
          label: "Remove",
          style: ButtonStyle.Danger,
          disabled: !targetMember.roles.cache.has(Constants.ROLES.BANISHED),
        }),
      ],
    ];

    await replyInteraction(interaction, undefined, null, {
      content: "Please select an action.",
      components: buttons.map((button) => ({
        type: ComponentType.ActionRow,
        components: button,
      })),
    });
  }
}
