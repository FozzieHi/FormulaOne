import { Intents, PresenceData, Snowflake } from "discord.js";

export class Constants {
  static readonly DEFAULT_COLORS: Array<number> = [
    0xff269a, 0x00ff00, 0x00e828, 0x08f8ff, 0xf226ff, 0xff1c8e, 0x68ff22, 0xffbe11,
    0x2954ff, 0x9624ed, 0xa8ed00,
  ];

  static readonly ERROR_COLOR = 0xff0000;

  static readonly BAN_COLOR = 0xea0c00;

  static readonly KICK_COLOR = 0xe8511f;

  static readonly WARN_COLOR = 0xffb620;

  static readonly UNBAN_COLOR = 0x13ff19;

  static readonly GUILD_IDS: Array<Snowflake> = ["177387572505346048"];

  static readonly ROLES = {
    BOT_DEV: "424590836777484291",
    ADMIN: "177408413381165056",
    STEWARDS: "177408501268611073",
    MARSHALS: "293845938764644352",
  };

  static readonly MOD_ROLES: Array<{ id: Snowflake; permissionLevel: number }> = [
    { id: this.ROLES.BOT_DEV, permissionLevel: 3 },
    { id: this.ROLES.ADMIN, permissionLevel: 3 },
    { id: this.ROLES.STEWARDS, permissionLevel: 2 },
    { id: this.ROLES.MARSHALS, permissionLevel: 1 },
  ];

  static readonly CHANNELS = {
    MOD_LOGS: "447397947261452288",
  };

  static readonly PREFIX = "t$";

  static readonly INTENTS: Intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]);

  static readonly PRESENCE: PresenceData = {
    activities: [
      {
        name: "slash commands",
        type: "WATCHING",
      },
    ],
  };

  static readonly regexes = {
    markdown: /([*~`_])+/g,
  };
}
