import { container } from "@sapphire/framework";
import { ApplicationCommandPermissionData, Guild, Snowflake } from "discord.js";
import { Constants } from "../utility/Constants";

export class PermissionService {
  public static async register() {
    const f2Commands: Array<Snowflake> = ["959532806986420285"];
    const helperCommands: Array<Snowflake> = ["956174760688115783"];
    const marshalCommands: Array<Snowflake> = [
      "954020435652128848",
      "954305075306717194",
      "954332128408113173",
      "954752295218843728",
      "955436856516948008",
      "958292992983187507",
    ];
    const stewardCommands: Array<Snowflake> = [
      "955204850902265986",
      "955230109890146404",
      "956490929747918899",
    ];

    const f2Permissions: Array<ApplicationCommandPermissionData> = [
      { id: Constants.ROLES.F2, type: "ROLE", permission: true },
    ];
    const marshalPermissions = this.getPermData(1);
    const stewardPermissions = this.getPermData(2);
    const helperPermissions = marshalPermissions;
    helperPermissions.push({
      id: Constants.ROLES.HELPERS,
      type: "ROLE",
      permission: true,
    });

    const guild = container.client.guilds.cache.get(Constants.GUILD_IDS[0]);
    if (guild == null) {
      return;
    }

    await this.setPerms(guild, f2Commands, f2Permissions);
    await this.setPerms(guild, helperCommands, helperPermissions);
    await this.setPerms(guild, marshalCommands, marshalPermissions);
    await this.setPerms(guild, stewardCommands, stewardPermissions);
  }

  private static getPermData(permissionLevel: number) {
    const permissions: Array<ApplicationCommandPermissionData> = [];
    Constants.MOD_ROLES.filter(
      (role) => role.permissionLevel >= permissionLevel
    ).forEach((marshalRole) => {
      permissions.push({ id: marshalRole.id, type: "ROLE", permission: true });
    });
    return permissions;
  }

  private static async setPerms(
    guild: Guild,
    commands: Array<Snowflake>,
    permissions: Array<ApplicationCommandPermissionData>
  ) {
    await Promise.all(
      (
        await Promise.all(commands.map((commandId) => guild.commands.fetch(commandId)))
      ).map((command) => command.permissions.set({ permissions }))
    );
  }
}
