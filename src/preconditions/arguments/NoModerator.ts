import { Precondition } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";
import { ModerationService } from "../../services/ModerationService";

export class NoModeratorPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    const target =
      interaction.options.getUser("user") ??
      (interaction.options.getMember("member") as GuildMember).user;
    return interaction.guild != null &&
      target != null &&
      !(await ModerationService.isModerator(interaction.guild, target))
      ? this.ok()
      : this.error({ message: "You may not use this command on a moderator." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    NoModerator: never;
  }
}
