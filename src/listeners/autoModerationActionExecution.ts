import { container, Listener } from "@sapphire/framework";
import {
  AutoModerationActionExecution,
  AutoModerationActionType,
  ChannelType,
  GuildMember,
  GuildTextBasedChannel,
} from "discord.js";
import { Constants, ModerationQueueButtons } from "../utility/Constants.js";
import { getOverflowFields } from "../utility/StringUtil.js";
import { modQueue } from "../services/ModerationService.js";
import TryVal from "../utility/TryVal.js";
import ViolationService from "../services/ViolationService.js";

export class AutoModerationActionExecutionListener extends Listener {
  public async run(action: AutoModerationActionExecution) {
    const autoModerationRule = await TryVal(
      action.guild.autoModerationRules.fetch(action.ruleId),
    );
    if (
      action.channelId == null ||
      autoModerationRule == null ||
      action.action.type !== AutoModerationActionType.SendAlertMessage ||
      autoModerationRule.actions.every(
        (act) => act.metadata.channelId !== Constants.CHANNELS.AUTO_BOT_QUEUE,
      )
    ) {
      return;
    }
    const channel = (await TryVal(
      action.guild.channels.fetch(action.channelId),
    )) as GuildTextBasedChannel;
    if (channel == null || channel.type !== ChannelType.GuildText) {
      return;
    }

    const targetUser = await TryVal(container.client.users.fetch(action.userId));
    if (targetUser == null) {
      return;
    }

    const fieldsAndValues = ["Action"];
    if (action.messageId == null) {
      const messages = await TryVal(channel.messages.fetch({ limit: 2 }));
      const aboveMessage = messages?.last()?.url;
      fieldsAndValues.push(
        `AutoMod Filter Trigger${
          aboveMessage != null ? ` [Jump to message above](${aboveMessage})` : ""
        }`,
      );
    } else {
      const message = await TryVal(channel.messages.fetch(action.messageId));
      fieldsAndValues.push(
        `AutoMod Filter Trigger${
          message != null ? ` [Jump to message](${message.url})` : ""
        }`,
      );
    }
    fieldsAndValues.push(
      "Filter Name",
      autoModerationRule.name,
      "Filter Type",
      action.messageId == null ? "Block" : "Alert",
      "Channel",
      channel.toString(),
    );
    if (action.content.length > 0) {
      fieldsAndValues.push(...getOverflowFields("Content", action.content));
    }
    if (action.matchedKeyword != null) {
      fieldsAndValues.push("Keyword");
      fieldsAndValues.push(`\`${action.matchedKeyword.replaceAll("`", "\\`")}\``);
    }
    await modQueue(
      action.guild,
      targetUser,
      channel.id,
      action.messageId,
      fieldsAndValues,
      Constants.MUTE_COLOR,
      [
        ModerationQueueButtons.PUNISH,
        ModerationQueueButtons.ESCALATE,
        ModerationQueueButtons.IGNORE,
      ],
      action.messageId != null,
    );
    await ViolationService.checkViolations(
      action.guild,
      channel,
      action.member as GuildMember,
      action.messageId,
    );
  }
}
