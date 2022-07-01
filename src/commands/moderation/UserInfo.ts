import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, MessageButton } from "discord.js";
import { replyInteractionPublicFields } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { getDBUser } from "../../utility/DatabaseUtil";
import db from "../../database";

export class UserInfoCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
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
        description: "View a user's information.",
        options: [
          {
            name: "user",
            description: "The user to lookup",
            type: "USER",
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["989262356037136404"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user");
    if (user == null || interaction.channel == null || interaction.guild == null) {
      return;
    }

    const dbUser = await getDBUser(user.id, interaction.guild.id);
    if (dbUser == null) {
      return;
    }

    const buttons = [
      [
        new MessageButton()
          .setCustomId(`userid-${user.id}`)
          .setLabel("User ID")
          .setStyle("SECONDARY"),
      ],
    ];
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const member = interaction.guild.members.cache.get(user.id);
    if (member == null) {
      await replyInteractionPublicFields(
        interaction,
        [
          "Created",
          user.createdAt.toLocaleDateString("en-US", dateOptions),
          "Active/Total Punishment Count",
          `${dbUser.currentPunishment.toString()}/${dbUser.punishments.length.toString()}`,
        ],
        {
          author: { name: user.tag, iconURL: user.displayAvatarURL() },
          footer: { text: `User ID: ${user.id}` },
        },
        { components: buttons.map((b) => ({ type: 1, components: b })) }
      );
    } else {
      const roles = member.roles.cache.map((role) => role.toString());
      roles.pop();
      await replyInteractionPublicFields(
        interaction,
        [
          "Created",
          user.createdAt.toLocaleDateString("en-US", dateOptions),
          "Last Joined",
          (member.joinedAt as Date).toLocaleDateString("en-US", dateOptions),
          `Roles (${roles.length})`,
          roles.length > 0 ? roles.join(" ") : "None",
          "Active/Total Punishment Count",
          `${dbUser.currentPunishment.toString()}/${dbUser.punishments.length.toString()}`,
          "Currently Muted",
          (await db.muteRepo?.anyMute(user.id, interaction.guild.id)) ||
          member.communicationDisabledUntil != null
            ? "Yes"
            : "No",
        ],
        {
          author: { name: user.tag, iconURL: user.displayAvatarURL() },
          footer: { text: `User ID: ${user.id}` },
        },
        { components: buttons.map((b) => ({ type: 1, components: b })) }
      );
    }
  }
}
