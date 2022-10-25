import { Precondition } from "@sapphire/framework";
import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { ModerationService } from "../../services/ModerationService.js";

export class F3Precondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    return (await ModerationService.getPermLevel(
      interaction.guild as Guild,
      (interaction.member as GuildMember).user
    )) > 0 || (interaction.member as GuildMember).roles.cache.has(Constants.ROLES.F3)
      ? this.ok()
      : this.error({
          message: "You must have the F3 role in order to use this command.",
        });
  }
}
