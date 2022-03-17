import { Intents, PresenceData } from "discord.js";

export class Constants {
  static readonly DEFAULT_COLORS: Array<number> = [
    0xff269a, 0x00ff00, 0x00e828, 0x08f8ff, 0xf226ff, 0xff1c8e, 0x68ff22, 0xffbe11,
    0x2954ff, 0x9624ed, 0xa8ed00,
  ];
  static readonly ERROR_COLOR = 0xff0000;

  static readonly GUILD_IDS = ["177387572505346048"];

  static readonly ROLES = {
    BOT_DEV: "424590836777484291",
    ADMIN: "177408413381165056",
    STEWARDS: "177408501268611073",
    MARSHALS: "293845938764644352",
  };

  static readonly MOD_ROLES = [
    { id: this.ROLES.BOT_DEV, permissionLevel: 3 },
    { id: this.ROLES.ADMIN, permissionLevel: 3 },
    { id: this.ROLES.STEWARDS, permissionLevel: 2 },
    { id: this.ROLES.MARSHALS, permissionLevel: 1 },
  ];

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

  static regexes = {
    markdown: /([*~`_])+/g,
  };
}
