import {
  CommandInteraction,
  EmbedFieldData,
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
import { NumberUtil } from "./NumberUtil";

export function getFields(fieldsAndValues: Array<string>): Array<EmbedFieldData> {
  const fields = [];
  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (NumberUtil.isEven(i)) {
      fields.push({
        name: fieldsAndValues[i],
        value: fieldsAndValues[i + 1].toString(),
      });
    }
  }
  return fields;
}

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

export async function sendFields(
  channel: TextBasedChannel | User,
  fieldsAndValues: Array<string>,
  embedOptions: MessageEmbedOptions = {}
): Promise<Message> {
  embedOptions.fields = getFields(fieldsAndValues);
  return send(channel, undefined, embedOptions);
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

async function sendInteraction(
  interaction: CommandInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions = {},
  messageOptions: InteractionReplyOptions = {}
) {
  if (description != null) {
    embedOptions.description = description;
  }
  messageOptions.embeds = [new Embed(embedOptions)];
  return interaction.reply(messageOptions);
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

export async function replyInteractionPublicFields(
  interaction: CommandInteraction,
  fieldsAndValues: Array<string>,
  embedOptions: MessageEmbedOptions = {},
  messageOptions: MessageOptions = {}
) {
  embedOptions.fields = getFields(fieldsAndValues);
  return sendInteraction(interaction, undefined, embedOptions, messageOptions);
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
