import { Constants } from "../utility/Constants";
import { container } from "@sapphire/framework";
import { ApplicationCommandPermissionData } from "discord.js";

export class PermissionService {
  public static async register() {
    const modCommands = ["954020435652128848"];
    const modPermissions: Array<ApplicationCommandPermissionData> = [];
    Constants.MOD_ROLES.filter((modRole) => modRole.permissionLevel > 0).forEach(
      (modRole) => {
        modPermissions.push({ id: modRole.id, type: "ROLE", permission: true });
      }
    );
    const guild = container.client.guilds.cache.get(Constants.GUILD_IDS[0]);
    if (guild == null) {
      return;
    }
    for (const commandId of modCommands) {
      const command = await guild.commands.fetch(commandId);
      if (command != null) {
        await command.permissions.add({ permissions: modPermissions });
      }
    }
  }
}
