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
  Guild,
  GuildMember,
  MessageSelectMenu,
  MessageSelectOptionData,
} from "discord.js";
import db from "../../database";
import {
  dm,
  replyInteraction,
  replyInteractionError,
  replyInteractionPublic,
} from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { ModerationService, modLog } from "../../services/ModerationService";
import { StringUtil } from "../../utility/StringUtil";
import { PushUpdate } from "../../database/updates/PushUpdate";

export class BanishCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["MANAGE_ROLES"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Helpers", "MemberValidation"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    const ruleChoices: Array<ApplicationCommandOptionChoiceData> = [];
    Constants.RULES.forEach((rule, i) => {
      ruleChoices.push({
        name: `Rule ${i + 1} - ${rule}`,
        value: i,
      });
    });

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
                choices: ruleChoices,
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
    if (roleId == null) {
      return;
    }
    const banishedRole = Constants.BANISH_ROLES.find(
      (banishRole) => banishRole.id === roleId
    );
    if (
      interaction.guild == null ||
      interaction.channel == null ||
      reason == null ||
      banishedRole == null
    ) {
      return;
    }

    const helper =
      (await ModerationService.getPermLevel(interaction.guild, interaction.user)) === 0;
    if (helper && banishedRole.name !== "f1-beginner-questions") {
      await replyInteractionError(
        interaction,
        "Helpers may only banish members from the f1-beginner-questions channel."
      );
      return;
    }
    if (
      member.roles.cache.has(Constants.ROLES.HELPERS) ||
      (await ModerationService.isModerator(interaction.guild, member.user))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator."
      );
      return;
    }
    const role = interaction.guild.roles.cache.get(roleId);
    if (role == null) {
      await replyInteractionError(interaction, "Could not fetch target role.");
      return;
    }

    if (subcommand === "add") {
      if (member.roles.cache.has(roleId)) {
        await replyInteractionError(
          interaction,
          `${StringUtil.boldify(member.user.tag)} is already banished from ${
            banishedRole.name
          }`
        );
        return;
      }
      const action = `${helper ? "Helper " : ""}${banishedRole.name} Banish`;
      await member.roles.add(roleId);
      await replyInteractionPublic(
        interaction,
        `Successfully banished ${StringUtil.boldify(member.user.tag)} from ${
          banishedRole.name
        }`
      );
      await db.userRepo?.upsertUser(
        member.id,
        interaction.guild.id,
        new PushUpdate("punishments", {
          date: Date.now(),
          escalation: action,
          reason,
          mod: interaction.user.tag,
          channelId: interaction.channel.id,
        })
      );
      await modLog(
        interaction.guild,
        interaction.user,
        [
          "Action",
          action,
          "Member",
          `${member.user.tag.toString()} (${member.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.BANISH_COLOR,
        member.user
      );
      await dm(
        member.user,
        `A moderator has banished you from the ${banishedRole.name} channel.`,
        interaction.channel
      );
    } else if (subcommand === "remove") {
      if (!member.roles.cache.has(roleId)) {
        await replyInteractionError(
          interaction,
          `${StringUtil.boldify(member.user.tag)} is not banished from ${
            banishedRole.name
          }`
        );
        return;
      }
      const action = `${helper ? "Helper " : ""}${banishedRole.name} Unbanish`;
      await member.roles.remove(roleId);
      await replyInteractionPublic(
        interaction,
        `Successfully unbanished ${StringUtil.boldify(member.user.tag)} from ${
          banishedRole.name
        }`
      );
      await modLog(
        interaction.guild,
        interaction.user,
        [
          "Action",
          action,
          "Member",
          `${member.user.tag.toString()} (${member.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.UNMUTE_COLOR,
        member.user
      );
      await dm(
        member.user,
        `A moderator has unbanished you from the ${banishedRole.name} channel.`,
        interaction.channel
      );
    }
  }

  public async contextMenuRun(interaction: ContextMenuInteraction) {
    const message = interaction.options.getMessage("message");
    if (message == null) {
      return;
    }
    const moderator = interaction.member as GuildMember;
    const targetMember = (interaction.guild as Guild).members.cache.get(
      message.author.id
    );
    if (moderator == null || targetMember == null) {
      return;
    }

    if (
      (await ModerationService.getPermLevel(
        interaction.guild as Guild,
        moderator.user
      )) > 0 ||
      ((await ModerationService.getPermLevel(
        interaction.guild as Guild,
        moderator.user
      )) === 0 &&
        targetMember.roles.cache.has(Constants.ROLES.BEGINNERS_QUESTIONS))
    ) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator."
      );
      return;
    }

    const roleOptions: Array<MessageSelectOptionData> = [];
    if (
      (await ModerationService.getPermLevel(
        interaction.guild as Guild,
        moderator.user
      )) > 0
    ) {
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
