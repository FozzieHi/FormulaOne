import { Intents, PartialTypes, PresenceData, Snowflake } from "discord.js";
import RE2 from "re2";

export enum PunishmentType {
  WARN = "warn",
  MUTE = "mute",
  BAN = "ban",
}

export type PunishmentLevel = {
  type: PunishmentType;
  length?: number;
};

export enum ModerationQueueButtons {
  PUNISH = "PUNISH",
  ESCALATE = "ESCALATE",
  BAN = "BAN",
  UNMUTE = "UNMUTE",
  IGNORE = "IGNORE",
}

export class Constants {
  static readonly DEFAULT_COLORS: Array<number> = [
    0xff269a, 0x00ff00, 0x00e828, 0x08f8ff, 0xf226ff, 0xff1c8e, 0x68ff22, 0xffbe11,
    0x2954ff, 0x9624ed, 0xa8ed00,
  ];

  static readonly ERROR_COLOR = 0xff0000;

  static readonly BAN_COLOR = 0xea0c00;

  static readonly KICK_COLOR = 0xe8511f;

  static readonly MUTE_COLOR = 0xff720e;

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

  static readonly PUNISHMENTS: Array<PunishmentLevel> = [
    {
      type: PunishmentType.WARN,
    },
    {
      type: PunishmentType.MUTE,
      length: 3600000,
    },
    {
      type: PunishmentType.MUTE,
      length: 86400000,
    },
    {
      type: PunishmentType.BAN,
      length: 864000000,
    },
    {
      type: PunishmentType.BAN,
      length: 2.592e9,
    },
  ];

  static readonly EMOTE_ID = "299650191835922432.js";

  static readonly EMOTE_SCORES: Array<{ id: Snowflake; score: number }> = [
    { id: "314910132733739009", score: 0.4 },
    { id: "314910011358707712", score: 0.3 },
    { id: "314909797445271564", score: 0.2 },
    { id: "313677111695245312", score: 0.1 },
  ];

  static readonly ROLES = {
    BOT_DEV: "424590836777484291",
    ADMIN: "177408413381165056",
    STEWARDS: "177408501268611073",
    MARSHALS: "293845938764644352",
    MODS: "738665034359767060",
    HELPERS: "941601929178533919",
    F1: "314910132733739009",
    F2: "314910011358707712",
    F3: "314909797445271564",
    BEGINNERS_QUESTIONS: "941602889221165066",
    MUTED: "292105874158256128",
    NOXP: "314910227306643457",
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
    MOD_QUEUE: "920333278593024071",
    MOD_QUEUE_ARCHIVE: "920333356250587156",
    STEWARDS_QUEUE: "921485208681848842",
    EMOJIS: "639401538485485569",
  };

  static readonly EMOTES = {
    UP: "303230406352699393",
    DOWN: "303230394008993793",
  };

  static readonly INTENTS: Intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]);

  static readonly PARTIALS: Array<PartialTypes> = ["MESSAGE", "CHANNEL", "REACTION"];

  static readonly PRESENCE: PresenceData = {
    activities: [
      {
        name: "slash commands",
        type: "WATCHING",
      },
    ],
  };

  static readonly REGEXES = {
    URL: new RE2(/^https?:\/\/([\w[\]:.-]+)\.([A-Za-z\d-]+)(:\d*)?([/#?]\S*)?$/),
    INVITES: new RE2(/(discord(?:app)?\.com\/invite|discord\.gg)\/([A-Za-z\d-]+)/),
  };

  static readonly GLOBAL_REGEXES = {
    MARKDOWN: new RE2(/([*~`_])+/g),
    URL: new RE2(/https?:\/\/([\w[\]:.-]+)\.([A-Za-z\d-]+)(:\d*)?([/#?]\S*)?/g),
  };

  static readonly INTERVALS = {
    PROTECTION: 60000,
    MUTEXES: 60000,
  };
}
