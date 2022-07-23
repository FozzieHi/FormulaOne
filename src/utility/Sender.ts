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
  if (embedOptions != null && description != null) {
    embedOptions.description = description;
  }
  if (embedOptions != null) {
    messageOptions.embeds = [new Embed(embedOptions)];
  }
  return interaction.reply(messageOptions);
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
  messageOptions.ephemeral = true;
  return replyInteractionHandler(
    interaction,
    description != null
      ? `${StringUtil.boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    messageOptions
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
  embedOptions.fields = getFields(fieldsAndValues);
  return replyInteractionHandler(interaction, undefined, embedOptions, messageOptions);
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
  embedOptions.color = Constants.ERROR_COLOR;
  return replyInteractionHandler(
    interaction,
    `${StringUtil.boldify(interaction.user.tag)}, ${description}`,
    embedOptions,
    { ephemeral: true }
  );
}

async function updateInteractionHandler(
  interaction: MessageComponentInteraction,
  description: string | undefined,
  embedOptions: MessageEmbedOptions | null = {},
  messageOptions: InteractionUpdateOptions = {}
) {
  if (embedOptions != null && description != null) {
    embedOptions.description = description;
  }
  if (embedOptions != null) {
    messageOptions.embeds = [new Embed(embedOptions)];
  }
  return interaction.update(messageOptions);
}

export async function updateInteraction(
  interaction: MessageComponentInteraction,
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
