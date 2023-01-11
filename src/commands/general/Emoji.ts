import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  TextBasedChannel,
} from "discord.js";
import {
  replyInteractionError,
  replyInteractionPublic,
  send,
} from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { genericLog } from "../../services/ModerationService.js";
import TryVal from "../../utility/TryVal.js";

export class EmojiCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["AddReactions"],
      preconditions: ["F3"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Post an emoji submission to #emojis.",
        options: [
          {
            name: "name",
            description: "The proposed emoji name",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "attachment",
            description: "The proposed emoji image or video",
            type: ApplicationCommandOptionType.Attachment,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["978981313354825778"],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString("name")?.replaceAll(":", "");
    const attachment = interaction.options.getAttachment("attachment");
    if (interaction.guild == null || name == null || attachment == null) {
      return;
    }
    if (attachment.height == null || attachment.width == null) {
      await replyInteractionError(
        interaction,
        "That is not a valid file type, please make sure you upload an image or video."
      );
      return;
    }

    const emojiChannel = (await TryVal(
      interaction.guild.channels.fetch(Constants.CHANNELS.EMOJIS)
    )) as TextBasedChannel;
    if (emojiChannel == null) {
      return;
    }
    const options = {
      timestamp: new Date().toISOString(),
      author: {
        name: interaction.user.tag,
        icon_url: interaction.user.displayAvatarURL(),
      },
      image: {
        url: attachment.url,
      },
    };

    const sentMessage = await send(
      emojiChannel,
      `Proposed the emote :${name}:`,
      options
    );
    await sentMessage.react(Constants.EMOTES.UP);
    await sentMessage.react(Constants.EMOTES.DOWN);
    await replyInteractionPublic(
      interaction,
      `Successfully proposed the emote :${name}:.`
    );

    await genericLog(
      interaction.guild,
      interaction.user,
      [
        "Action",
        `Proposed an emote [Jump to message](${sentMessage.url})`,
        "Name",
        name,
      ],
      Constants.LIGHT_ORANGE_COLOR
    );
  }
}
