import {
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageEmbedOptions,
  TextBasedChannel,
} from "discord.js";
import { StringUtil } from "./StringUtil";
import { Embed } from "../structures/Embed";
import { Constants } from "./Constants";

export async function send(
  channel: TextBasedChannel,
  description: string | undefined,
  embedOptions: MessageEmbedOptions = {}
): Promise<Message> {
  if (description != null) {
    embedOptions.description = description;
  }
  return channel.send({ embeds: [new Embed(embedOptions)] });
}

async function sendInteraction(
  interaction: CommandInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {},
  messageOptions: InteractionReplyOptions = {}
) {
  embedOptions.description = description;
  messageOptions.embeds = [new Embed(embedOptions)];
  return interaction.reply(messageOptions);
}

export async function replyMsg(
  message: Message,
  description: string
): Promise<Message> {
  return send(
    message.channel,
    `${StringUtil.boldify(message.author.tag)}, ${description}`
  );
}

export async function replyMsgError(
  message: Message,
  description: string
): Promise<Message> {
  return send(
    message.channel,
    `${StringUtil.boldify(message.author.tag)}, ${description}`,
    { color: Constants.ERROR_COLOR }
  );
}

export async function replyInteraction(
  interaction: CommandInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  return sendInteraction(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    embedOptions,
    { ephemeral: true }
  );
}

export async function replyInteractionPublic(
  interaction: CommandInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  return sendInteraction(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    embedOptions
  );
}

export async function replyInteractionError(
  interaction: CommandInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  embedOptions.color = Constants.ERROR_COLOR;
  return sendInteraction(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    embedOptions,
    { ephemeral: true }
  );
}
