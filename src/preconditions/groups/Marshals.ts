import { Precondition } from "@sapphire/framework";
import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { getPermLevel } from "../../services/ModerationService.js";

export class MarshalsPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    return (await getPermLevel(
      interaction.guild as Guild,
      (interaction.member as GuildMember).user
    )) > 0
      ? this.ok()
      : this.error({ message: "You must be a Marshal in order to use this command." });
  }
}
