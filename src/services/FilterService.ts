import {
  Guild,
  GuildTextBasedChannel,
  Invite,
  Message,
  MessageReaction,
  User,
} from "discord.js";
import { container } from "@sapphire/framework";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { isModerator, modQueue } from "./ModerationService.js";
import Try from "../utility/Try.js";
import TryVal from "../utility/TryVal.js";
import { getOverflowFields, removeClickableLinks } from "../utility/StringUtil.js";
import ViolationService from "./ViolationService.js";
import MutexManager from "../managers/MutexManager.js";
import lookupYouTubeChannels from "../utility/YouTubeUtil.js";
import { getDBGuild } from "../utility/DatabaseUtil.js";
import { dm } from "../utility/Sender.js";

export async function checkInvites(message: Message): Promise<boolean> {
  if (message.guild == null || message.channel == null) {
    return false;
  }

  const inviteMatches = [...message.content.matchAll(Constants.GLOBAL_REGEXES.INVITES)];
  const inviteServerPromises = inviteMatches.map(async (inviteMatch) => {
    const inviteCode = inviteMatch.groups?.code;
    if (inviteCode == null) {
      return null;
    }

    const invite = (await TryVal(container.client.fetchInvite(inviteCode))) as Invite;
    if (
      invite == null ||
      invite.guild == null ||
      invite.guild.id === Constants.GUILD_IDS.at(0)
    ) {
      return null;
    }

    return `${invite.guild.name} (${invite.guild.id})`;
  });

  const inviteServers = [
    ...new Set(
      (await Promise.all(inviteServerPromises)).filter(
        (inviteServer) => inviteServer != null,
      ),
    ),
  ];
  if (inviteServers.length > 0) {
    await Try(message.delete());
    const messages = await TryVal(
      (message.channel as GuildTextBasedChannel).messages.fetch({ limit: 2 }),
    );
    const aboveMessage = messages?.last()?.url;
    const inviteServerFields = inviteServers.flatMap((inviteServer, i) => [
      `Invite Server${inviteServers.length > 1 ? ` (${i + 1})` : ""}`,
      inviteServer,
    ]);
    await modQueue(
      message.guild,
      message.author,
      message.channel.id,
      message.id,
      [
        "Action",
        `Filter Trigger${aboveMessage ? ` [Jump to message above](${aboveMessage})` : ""}`,
        "Filter Name",
        "Invites",
        ...inviteServerFields,
        "Channel",
        message.channel.toString(),
        ...getOverflowFields("Content", removeClickableLinks(message.content)),
      ],
      Constants.KICK_COLOR,
      [
        ModerationQueueButtons.PUNISH,
        ModerationQueueButtons.BAN,
        ModerationQueueButtons.IGNORE,
      ],
    );
    return true;
  }
  return false;
}

export async function checkYouTubeChannel(message: Message) {
  const channelMatches = [
    ...message.content.matchAll(Constants.GLOBAL_REGEXES.YOUTUBE_VIDEOS),
  ];

  const ids = channelMatches.map((channelMatch) => channelMatch.groups?.id as string);
  if (ids.length > 0) {
    const results = await lookupYouTubeChannels(ids);
    const dbGuild = await getDBGuild((message.guild as Guild).id);
    const blocklistedChannels = dbGuild?.youtubeChannels.blocklisted || [];
    if (results.length > 0) {
      for (let i = 0; i < results.length; i += 1) {
        if (blocklistedChannels.includes(results[i].channelId)) {
          // eslint-disable-next-line no-await-in-loop
          await Try(message.delete());
          // eslint-disable-next-line no-await-in-loop
          await dm(
            message.author,
            `The YouTube channel ${results[i].channelId} is currently blocklisted.`,
            message.channel,
          );
        }
      }
    }
  }
}

export async function checkEmotes(message: Message, reaction: MessageReaction) {
  await MutexManager.getUserPublicMutex(message.author.id).runExclusive(async () => {
    if (
      ViolationService.reports.some(
        (report) =>
          report.channelId === reaction.message.channel.id &&
          report.messageId === reaction.message.id,
      )
    ) {
      return;
    }
    if (
      await isModerator(
        reaction.message.guild as Guild,
        reaction.message.author as User,
      )
    ) {
      return;
    }
    if (reaction.emoji.id === Constants.EMOTE_REPORT_EMOTE_ID) {
      let score = 0;
      const users = await message.reactions.cache
        .find((msgReaction) => msgReaction.emoji.id === Constants.EMOTE_REPORT_EMOTE_ID)
        ?.users.fetch();
      users?.forEach((user) => {
        score +=
          Constants.EMOTE_REPORT_ROLE_SCORES.find((val) => val.id === user.id)?.score ??
          Constants.EMOTE_REPORT_ROLELESS_SCORE;
      });
      if (score >= Constants.EMOTE_REPORT_THRESHOLD_SCORE) {
        const fieldsAndValues = [
          "Action",
          `Emote Report [Jump to message](${message.url})`,
          "Score",
          `${score.toString()} >= ${Constants.EMOTE_REPORT_THRESHOLD_SCORE.toString()}`,
          "Channel",
          message.channel.toString(),
        ];
        if (message.content.length > 0) {
          fieldsAndValues.push(...getOverflowFields("Content", message.content));
        }
        const attachmentVals = [...message.attachments.values()];
        for (let i = 0; i < message.attachments.size; i += 1) {
          const attachment = attachmentVals.at(i);
          if (attachment != null) {
            fieldsAndValues.push(`Attachment (${i + 1})`);
            fieldsAndValues.push(`[View](${attachment.proxyURL})`);
          }
        }
        await modQueue(
          message.guild as Guild,
          message.author,
          message.channel.id,
          message.id,
          fieldsAndValues,
          Constants.WARN_COLOR,
          [
            ModerationQueueButtons.PUNISH,
            ModerationQueueButtons.ESCALATE,
            ModerationQueueButtons.IGNORE,
          ],
          true,
        );
        ViolationService.reports.push({
          channelId: message.channel.id,
          messageId: message.id,
        });
      }
    }
  });
}
