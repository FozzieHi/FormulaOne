import {
  ButtonInteraction,
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  Message,
  MessageComponentInteraction,
  APIEmbed,
  APIEmbedField,
  BaseMessageOptions,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextBasedChannel,
  User,
  ContextMenuCommandInteraction,
} from "discord.js";
import { Embed } from "../structures/Embed.js";
import { Constants } from "./Constants.js";
import Try from "./Try.js";
import { isEven } from "./NumberUtil.js";
import { boldify } from "./StringUtil.js";

export function getFields(fieldsAndValues: Array<string>): Array<APIEmbedField> {
  const fields = [];
  for (let i = 0; i < fieldsAndValues.length - 1; i += 1) {
    if (isEven(i)) {
      const name = fieldsAndValues.at(i)?.toString();
      const value = fieldsAndValues.at(i + 1)?.toString();
      if (name != null && value != null) {
        fields.push({
          name,
          value,
        });
      }
    }
  }
  return fields;
}

export async function send(
  channel: TextBasedChannel | User,
  description: string | undefined,
  embedOptions: APIEmbed | null = {},
  messageOptions: BaseMessageOptions = {}
): Promise<Message> {
  const newEmbedOptions = embedOptions;
  const newBaseMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newBaseMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return channel.send(newBaseMessageOptions);
}

export async function sendError(channel: TextBasedChannel | User, description: string) {
  return send(channel, description, { color: Constants.ERROR_COLOR });
}

export async function sendFields(
  channel: TextBasedChannel | User,
  fieldsAndValues: Array<string>,
  embedOptions: APIEmbed = {}
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
  return send(message.channel, `${boldify(message.author.tag)}, ${description}`);
}

export async function replyMsgError(
  message: Message,
  description: string
): Promise<Message> {
  return send(message.channel, `${boldify(message.author.tag)}, ${description}`, {
    color: Constants.ERROR_COLOR,
  });
}

async function replyInteractionHandler(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuCommandInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: APIEmbed | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newEmbedOptions = embedOptions;
  const newBaseMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newBaseMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  if (interaction.deferred) {
    return interaction.followUp(newBaseMessageOptions);
  }
  return interaction.reply(newBaseMessageOptions);
}

export async function replyInteraction(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuCommandInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string | undefined,
  embedOptions: APIEmbed | null = {},
  messageOptions: InteractionReplyOptions = {}
) {
  const newBaseMessageOptions = messageOptions;
  newBaseMessageOptions.ephemeral = true;
  return replyInteractionHandler(
    interaction,
    description != null
      ? `${boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    newBaseMessageOptions
  );
}

export async function replyInteractionPublic(
  interaction:
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuCommandInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string,
  embedOptions: APIEmbed = {}
) {
  return replyInteractionHandler(
    interaction,
    `${boldify(interaction.user.tag)}, ${description}`,
    embedOptions
  );
}

export async function replyInteractionPublicFields(
  interaction: CommandInteraction | ButtonInteraction,
  fieldsAndValues: Array<string>,
  embedOptions: APIEmbed = {},
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
    | ContextMenuCommandInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction,
  description: string,
  embedOptions: APIEmbed = {}
) {
  const newEmbedOptions = embedOptions;
  newEmbedOptions.color = Constants.ERROR_COLOR;
  return replyInteractionHandler(
    interaction,
    `${boldify(interaction.user.tag)}, ${description}`,
    newEmbedOptions,
    { ephemeral: true }
  );
}

async function updateInteractionHandler(
  interaction: SelectMenuInteraction | MessageComponentInteraction,
  description: string | undefined,
  embedOptions: APIEmbed | null = {},
  messageOptions: InteractionUpdateOptions = {}
) {
  const newEmbedOptions = embedOptions;
  const newBaseMessageOptions = messageOptions;
  if (newEmbedOptions != null && description != null) {
    newEmbedOptions.description = description;
  }
  if (newEmbedOptions != null) {
    newBaseMessageOptions.embeds = [new Embed(newEmbedOptions)];
  }
  return interaction.update(newBaseMessageOptions);
}

export async function updateInteraction(
  interaction: SelectMenuInteraction | MessageComponentInteraction,
  description: string | undefined,
  embedOptions: APIEmbed | null = {},
  messageOptions: InteractionUpdateOptions = {}
) {
  return updateInteractionHandler(
    interaction,
    description != null
      ? `${boldify(interaction.user.tag)}, ${description}`
      : undefined,
    embedOptions,
    messageOptions
  );
}
