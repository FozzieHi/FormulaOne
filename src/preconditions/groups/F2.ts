import { Precondition } from "@sapphire/framework";
import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { Constants } from "../../utility/Constants";
import { ModerationService } from "../../services/ModerationService";

export class F2Precondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    return (await ModerationService.getPermLevel(
      interaction.guild as Guild,
      (interaction.member as GuildMember).user
    )) > 0 || (interaction.member as GuildMember).roles.cache.has(Constants.ROLES.F2)
      ? this.ok()
      : this.error({
          message: "You must have the F2 role in order to use this command.",
        });
  }
}
