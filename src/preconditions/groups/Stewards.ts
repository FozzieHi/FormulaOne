import { Precondition } from "@sapphire/framework";
import { ChatInputCommandInteraction, Guild, GuildMember } from "discord.js";
import { getPermLevel } from "../../services/ModerationService.js";

export class StewardsPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    return (await getPermLevel(
      interaction.guild as Guild,
      (interaction.member as GuildMember).user,
    )) > 1
      ? this.ok()
      : this.error({ message: "You must be a Steward in order to use this command." });
  }
}
