import {
  CommandInteraction,
  Message,
  MessageEmbedOptions,
  TextBasedChannel,
} from "discord.js";
import { StringUtil } from "./StringUtil";
import { Embed } from "../structures/Embed";

export async function replyMsg(
  message: Message,
  description: string
): Promise<Message> {
  return send(
    message.channel,
    `${StringUtil.boldify(message.author.tag)}, ${description}`
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
    embedOptions
  );
}

async function send(channel: TextBasedChannel, description: string): Promise<Message> {
  return channel.send({ embeds: [new Embed({ description })] });
}

async function sendInteraction(
  interaction: CommandInteraction,
  description: string,
  embedOptions: MessageEmbedOptions = {}
) {
  embedOptions.description = description;
  return interaction.reply({
    embeds: [new Embed(embedOptions)],
    ephemeral: true,
  });
}
