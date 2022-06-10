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

  static readonly BANISH_COLOR = 0xf47a42;

  static readonly UNMUTE_COLOR = 0x6ded5e;

  static readonly UNBAN_COLOR = 0x13ff19;

  static readonly LIGHT_ORANGE_COLOR = 0xff720e;

  static readonly GUILD_IDS: Array<Snowflake> = ["177387572505346048"];

  static readonly RULES: Array<string> = [
    "Adhere to the r/formula1 server rules and Discord community guidelines and Terms of Service",
    "Circumventing moderation action is prohibited",
    "Illegal, harmful and NSFW/NSFL content is prohibited",
    "Do not send low-quality messages",
    "Be respectful and act in good faith",
    "Do not enforce these rules on behalf of a moderator",
    "No self-promotion",
    "Agree to disagree",
    "Usernames",
    "Use relevant channels and read the channel topic and pinned messages",
    "Keep all discussions in English",
  ];

  static readonly ROLES = {
    BOT_DEV: "424590836777484291",
    ADMIN: "177408413381165056",
    STEWARDS: "177408501268611073",
    MARSHALS: "293845938764644352",
    HELPERS: "941601929178533919",
    F1: "314910132733739009",
    F2: "314910011358707712",
    F3: "314909797445271564",
    BEGINNERS_QUESTIONS: "941602889221165066",
  };

  static readonly MOD_ROLES: Array<{ id: Snowflake; permissionLevel: number }> = [
    { id: this.ROLES.BOT_DEV, permissionLevel: 3 },
    { id: this.ROLES.ADMIN, permissionLevel: 3 },
    { id: this.ROLES.STEWARDS, permissionLevel: 2 },
    { id: this.ROLES.MARSHALS, permissionLevel: 1 },
  ];

  static readonly BANISH_ROLES: Array<{
    name: string;
    id: Snowflake;
  }> = [
    {
      name: "f1-beginner-questions",
      id: "941602889221165066",
    },
    {
      name: "f1-discussion",
      id: "821253279937462283",
    },
    {
      name: "f1-serious",
      id: "411950549064482823",
    },
    {
      name: "f1-technical",
      id: "433240749216104459",
    },
  ];

  static readonly CHANNELS = {
    NEWS: "335167453350854666",
    LOGS: "273927887034515457",
    MOD_LOGS: "447397947261452288",
    EMOJIS: "639401538485485569",
  };

  static readonly EMOTES = {
    UP: "303230406352699393",
    DOWN: "303230394008993793",
  };

  static readonly PREFIX = "t$";

  static readonly INTENTS: Intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
  ]);

  static readonly PRESENCE: PresenceData = {
    activities: [
      {
        name: "slash commands",
        type: "WATCHING",
      },
    ],
  };

  static readonly REGEXES = {
    MARKDOWN: /([*~`_])+/g,
    URL: /^https?:\/\/(\w+)\.(\w+)$/,
  };
}
