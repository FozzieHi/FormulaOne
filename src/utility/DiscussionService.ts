import { Guild, Message, MessageReaction, User } from "discord.js";
import { Constants, ModerationQueueButtons } from "./Constants.js";
import Try from "./Try.js";
import MutexManager from "../managers/MutexManager.js";
import ViolationService from "../services/ViolationService.js";
import { isModerator, modQueue } from "../services/ModerationService.js";

export async function addDiscussionEmotes(message: Message) {
  await Try(message.react(Constants.EMOTES.UP));
  await Try(message.react(Constants.EMOTES.DOWN));
}

export async function checkDiscussionEmotes(
  message: Message,
  reaction: MessageReaction
) {
  await MutexManager.getUserPublicMutex(message.author.id).runExclusive(async () => {
    if (
      ViolationService.reports.some(
        (report) =>
          report.channelId === reaction.message.channel?.id &&
          report.messageId === reaction.message.id
      )
    ) {
      return;
    }
    if (
      await isModerator(
        reaction.message.guild as Guild,
        reaction.message.author as User
      )
    ) {
      return;
    }

    if (
      reaction.emoji.id === Constants.EMOTES.UP ||
      reaction.emoji.id === Constants.EMOTES.DOWN
    ) {
      const upvoteUsers = await message.reactions.cache
        .find((msgReaction) => msgReaction.emoji.id === Constants.EMOTES.UP)
        ?.users.fetch();
      const downvoteUsers = await message.reactions.cache
        .find((msgReaction) => msgReaction.emoji.id === Constants.EMOTES.DOWN)
        ?.users.fetch();

      if (upvoteUsers == null || downvoteUsers == null) {
        return;
      }

      const upvotes = upvoteUsers.filter((user) => user.id !== message.author.id).size;
      const downvotes = downvoteUsers.filter(
        (user) => user.id !== message.author.id
      ).size;
      if (downvotes / upvotes >= 10) {
        const fieldsAndValues = [
          "Action",
          `Discussion Emote [Jump to message](${message.url})`,
          "Score",
          `${(downvotes / upvotes).toString()} >= 10`,
        ];
        if (message.content.length > 0) {
          fieldsAndValues.push("Content");
          fieldsAndValues.push(message.content);
        }
        const attachmentVals = [...message.attachments.values()];
        for (let i = 0; i < message.attachments.size; i += 1) {
          const attachment = attachmentVals.at(i);
          if (attachment != null) {
            fieldsAndValues.push(`Attachment ${i + 1}`);
            fieldsAndValues.push(`[View](${attachment.proxyURL})`);
          }
        }
        await modQueue(
          message.guild as Guild,
          message.author,
          message.channel.id,
          message.id,
          fieldsAndValues,
          Constants.MUTE_COLOR,
          [
            ModerationQueueButtons.PUNISH,
            ModerationQueueButtons.ESCALATE,
            ModerationQueueButtons.IGNORE,
          ],
          true
        );
        ViolationService.reports.push({
          channelId: message.channel.id,
          messageId: message.id,
        });
      }
    }
  });
}
