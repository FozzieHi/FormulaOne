import {
  ButtonInteraction,
  CommandInteraction,
  ContextMenuInteraction,
  EmbedFieldData,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  Message,
  MessageComponentInteraction,
  MessageEmbedOptions,
  MessageOptions,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextBasedChannel,
  User,
} from "discord.js";
import { StringUtil } from "./StringUtil.js";
import { Embed } from "../structures/Embed.js";
import { Constants } from "./Constants.js";
import Try from "./Try.js";
import { NumberUtil } from "./NumberUtil.js";

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
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: MessageOptions = {}
): Promise<Message> {
  const newEmbedOptions = embedOptions;
  const newMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return channel.send(newMessageOptions);
}

export async function sendError(channel: TextBasedChannel | User, description: string) {
  return send(channel, description, { color: Constants.ERROR_COLOR });
}

export async function sendFields(
  channel: TextBasedChannel | User,
  fieldsAndValues: Array<string>,
  embedOptions: MessageEmbedOptions = {}
): Promise<Message> {
  const newEmbedOptions = embedOptions;
  newEmbedOptions.fields = getFields(fieldsAndValues);
  return send(channel, undefined, newEmbedOptions);
}

export async function dm(
  user: User,
  description: string,
  channel: TextBasedChannel | undefined,
  sendErrorMsg = true
): Promise<boolean> {
  const result = await Try(send(user, description));
  if (
    !result &&
    sendErrorMsg &&
    channel != null &&
    channel.id !== Constants.CHANNELS.MOD_QUEUE &&
    channel.id !== Constants.CHANNELS.STEWARDS_QUEUE
  ) {
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

async function replyInteractionHandler(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newEmbedOptions = embedOptions;
  const newMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return interaction.reply(newMessageOptions);
}

export async function replyInteraction(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newMessageOptions = messageOptions;
  newMessageOptions.ephemeral = true;
  return replyInteractionHandler(
    interaction,
    description != null
      ? `${StringUtil.boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    newMessageOptions
  );
}

export async function replyInteractionPublic(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  return replyInteractionHandler(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    embedOptions
  );
}

export async function replyInteractionPublicFields(
  interaction: CommandInteraction | ButtonInteraction,
  fieldsAndValues: Array<string>,
  embedOptions: MessageEmbedOptions = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newEmbedOptions = embedOptions;
  newEmbedOptions.fields = getFields(fieldsAndValues);
  return replyInteractionHandler(
    interaction,
    undefined,
    newEmbedOptions,
    messageOptions
  );
}

export async function replyInteractionError(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  const newEmbedOptions = embedOptions;
  newEmbedOptions.color = Constants.ERROR_COLOR;
  return replyInteractionHandler(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    newEmbedOptions,
    { ephemeral: true }
  );
}

async function updateInteractionHandler(
  interaction:
    | SelectMenuInteraction
    | ModalSubmitInteraction
    | MessageComponentInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionUpdateOptions = {}
) {
  const newEmbedOptions = embedOptions;
  const newMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return interaction.update(newMessageOptions);
}

export async function updateInteraction(
  interaction:
    | SelectMenuInteraction
    | ModalSubmitInteraction
    | MessageComponentInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionUpdateOptions = {}
) {
  return updateInteractionHandler(
    interaction,
    description != null
      ? `${StringUtil.boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    messageOptions
  );
}

async function followUpInteractionHandler(
  interaction: ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newEmbedOptions = embedOptions;
  const newMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return interaction.followUp(newMessageOptions);
}

export async function followUpInteraction(
  interaction: ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  return followUpInteractionHandler(
    interaction,
    description != null
      ? `${StringUtil.boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    messageOptions
  );
}

export async function followUpInteractionError(
  interaction: ModalSubmitInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  const newEmbedOptions = embedOptions;
  newEmbedOptions.color = Constants.ERROR_COLOR;
  return followUpInteractionHandler(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    newEmbedOptions,
    { ephemeral: true }
  );
}
