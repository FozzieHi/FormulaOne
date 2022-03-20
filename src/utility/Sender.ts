import {
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageEmbedOptions,
  MessageOptions,
  TextBasedChannel,
  User,
} from "discord.js";
import { StringUtil } from "./StringUtil";
import { Embed } from "../structures/Embed";
import { Constants } from "./Constants";
import Try from "./Try";

export async function send(
  channel: TextBasedChannel | User,
  description: string | undefined,
  embedOptions: MessageEmbedOptions = {},
  messageOptions: MessageOptions = {}
): Promise<Message> {
  if (description != null) {
    embedOptions.description = description;
  }
  messageOptions.embeds = [new Embed(embedOptions)];
  return channel.send(messageOptions);
}

export async function sendError(channel: TextBasedChannel | User, description: string) {
  return send(channel, description, { color: Constants.ERROR_COLOR });
}

export async function dm(
  user: User,
  description: string,
  channel: TextBasedChannel | undefined,
  sendErrorMsg = true
): Promise<boolean> {
  const result = await Try(send(user, description));
  if (!result && sendErrorMsg && channel != null) {
    await sendError(channel, "I do not have permission to DM that user.");
  }
  return result;
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
