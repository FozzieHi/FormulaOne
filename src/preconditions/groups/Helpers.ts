import { Precondition } from "@sapphire/framework";
import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { Constants } from "../../utility/Constants";
import { ModerationService } from "../../services/ModerationService";

export class HelpersPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    return (await ModerationService.getPermLevel(
      interaction.guild as Guild,
      (interaction.member as GuildMember).user
    )) > 0 ||
      (interaction.member as GuildMember).roles.cache.has(Constants.ROLES.HELPERS)
      ? this.ok()
      : this.error({ message: "You must be a Helper in order to use this command." });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    Helpers: never;
  }
}
