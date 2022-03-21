import { container } from "@sapphire/framework";
import { ApplicationCommandPermissionData, Snowflake } from "discord.js";
import { Constants } from "../utility/Constants";

export class PermissionService {
  public static async register() {
    const marshalCommands: Array<Snowflake> = [
      "954020435652128848",
      "954305075306717194",
      "954332128408113173",
      "954752295218843728",
      "955436856516948008",
    ];
    const stewardsCommands: Array<Snowflake> = [
      "955204850902265986",
      "955230109890146404",
    ];
    const marshalPermissions: Array<ApplicationCommandPermissionData> = [];
    Constants.MOD_ROLES.filter((role) => role.permissionLevel > 0).forEach(
      (marshalRole) => {
        marshalPermissions.push({ id: marshalRole.id, type: "ROLE", permission: true });
      }
    );
    const stewardPermissions: Array<ApplicationCommandPermissionData> = [];
    Constants.MOD_ROLES.filter((role) => role.permissionLevel > 1).forEach(
      (stewardRole) => {
        stewardPermissions.push({ id: stewardRole.id, type: "ROLE", permission: true });
      }
    );
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
    await Promise.all(
      (
        await Promise.all(
          stewardsCommands.map((commandId) => guild.commands.fetch(commandId))
        )
      ).map((command) => command.permissions.set({ permissions: stewardPermissions }))
    );
  }
}
