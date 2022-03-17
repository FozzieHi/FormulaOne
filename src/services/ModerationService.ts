import { GuildMember } from "discord.js";
import { Constants } from "../utility/Constants";

export class ModerationService {
  public static getPermLevel(member: GuildMember) {
    const modRoles = Constants.MOD_ROLES.sort(
      (a, b) => a.permissionLevel - b.permissionLevel
    );

    let permLevel = 0;
    for (const modRole of modRoles) {
      if (member.roles.cache.has(modRole.id)) {
        permLevel = modRole.permissionLevel;
      }
    }
    return member.permissions.has("ADMINISTRATOR") && permLevel < 2 ? 2 : permLevel;
  }
}
