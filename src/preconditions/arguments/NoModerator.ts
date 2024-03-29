import { Precondition } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  GuildMember,
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

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
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
}
