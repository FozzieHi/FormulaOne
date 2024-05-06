import { Precondition } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { isModerator } from "../../services/ModerationService.js";

export class NoModeratorPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (interaction.guild == null) {
      return this.error({ message: "Guild is null or undefined." });
    }
    const target =
      interaction.options.getUser("user") ??
      (interaction.options.getMember("member") as GuildMember)?.user;
    return target == null || !(await isModerator(interaction.guild, target))
      ? this.ok()
      : this.error({ message: "You may not use this command on a moderator." });
  }

  public async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.guild == null) {
      return this.error({ message: "Guild is null or undefined." });
    }
    return !(await isModerator(interaction.guild, interaction.targetMessage.author))
      ? this.ok()
      : this.error({ message: "You may not use this command on a moderator." });
  }
}
