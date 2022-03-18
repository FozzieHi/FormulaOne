import { container } from "@sapphire/framework";
import { ApplicationCommandPermissionData, Snowflake } from "discord.js";
import { Constants } from "../utility/Constants";

export class PermissionService {
  public static async register() {
    const marshalCommands: Array<Snowflake> = [
      "954020435652128848",
      "954305075306717194",
      "954332128408113173",
    ];
    const marshalPermissions: Array<ApplicationCommandPermissionData> = [];
    Constants.MOD_ROLES.filter(
      (marshalRole) => marshalRole.permissionLevel > 0
    ).forEach((marshalRole) => {
      marshalPermissions.push({ id: marshalRole.id, type: "ROLE", permission: true });
    });
    const guild = container.client.guilds.cache.get(Constants.GUILD_IDS[0]);
    if (guild == null) {
      return;
    }
    await Promise.all(
      (
        await Promise.all(
          marshalCommands.map((commandId) => guild.commands.fetch(commandId))
        )
      ).map((command) => command.permissions.set({ permissions: marshalPermissions }))
    );
  }
}
