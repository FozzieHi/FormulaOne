import {
  ActivityType,
  GatewayIntentBits,
  Partials,
  PresenceData,
  Snowflake,
} from "discord.js";
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
  static readonly HEALTH_CHECK_PORT = 8080;

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

  static readonly GREEN_COLOR = 0x00e828;

  static readonly LIGHT_ORANGE_COLOR = 0xff720e;

  static readonly ORANGE_COLOR = 0xe8511f;

  static readonly GUILD_IDS: Array<Snowflake> = ["177387572505346048"];

  static readonly RULES: { [key: string]: string } = {
    "Rule 1": "Adhere to the Discord community guidelines and Terms of Service",
    "Rule 2": "Circumventing moderation action is prohibited",
    "Rule 3": "Illegal, harmful and NSFW/NSFL content is prohibited",
    "Rule 3.1": "Do not ask for links or references to illegal content",
    "Rule 3.2": "Do not provide links, hints, or suggestions to illegal content",
    "Rule 4": "Do not send low-quality messages",
    "Rule 5": "Be respectful and act in good faith",
    "Rule 5.1": "Do not predict, wish, or suggest any misfortune or harm to anyone",
    "Rule 5.2": "Do not excessively rant about a session",
    "Rule 5.3": "Do not harass, bait, or flame any individuals or communities",
    "Rule 5.4": "Do not spread misinformation or sensationalism",
    "Rule 5.5": "Do not bring in drama or toxicity from other servers or platforms",
    "Rule 6": "Do not enforce the rules on behalf of a moderator",
    "Rule 7": "No self-promotion",
    "Rule 8": '"It\'s just a joke" is not an excuse to break the rules',
    "Rule 9": "Usernames must be taggable and appropriate",
    "Rule 10": "Use relevant channels and read the channel topic and pinned messages",
    "Rule 11": "Keep all discussions in English",
    "Rule 12": "Everyone is welcome",
  };

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

  static readonly EMOTE_REPORT_EMOTE_ID = "299650191835922432";

  static readonly EMOTE_REPORT_ROLE_SCORES: Array<{ id: Snowflake; score: number }> = [
    { id: "314910132733739009", score: 40 }, // F1
    { id: "314910011358707712", score: 30 }, // F2
    { id: "314909797445271564", score: 20 }, // F3
    { id: "313677111695245312", score: 10 }, // F4
  ];

  static readonly EMOTE_REPORT_ROLELESS_SCORE = 5;

  static readonly EMOTE_REPORT_THRESHOLD_SCORE = 15;

  static readonly BOTS = {
    MOD_MAIL: "797143867048591370",
  };

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
    F4: "313677111695245312",
    BEGINNERS_QUESTIONS: "941602889221165066",
    MUTED: "292105874158256128",
    NOXP: "314910227306643457",
    BANISHED: "411950549064482823",
  };

  static readonly MOD_ROLES: Array<{ id: Snowflake; permissionLevel: number }> = [
    { id: this.ROLES.BOT_DEV, permissionLevel: 3 },
    { id: this.ROLES.ADMIN, permissionLevel: 3 },
    { id: this.ROLES.STEWARDS, permissionLevel: 2 },
    { id: this.ROLES.MARSHALS, permissionLevel: 1 },
  ];

  static readonly CHANNEL_CATEGORIES = {
    LIVE_CHAT: "1024052802638577694",
    MOTORSPORT: "361418703440707585",
    GENERAL_NO_F1: "360812123095564288",
    BOT: "361141560127258627",
  };

  static readonly CHANNELS = {
    WELCOME: "435404097055883265",
    RULES: "177387572505346048",
    NEWS: "335167453350854666",
    DRIVE_TO_SURVIVE: "951191132308664370",
    F1_GENERAL: "876046265111167016",
    F1_THREADS: "1118609917025210559",
    F1_BEGINNER_QUESTIONS: "955919151849943110",
    F1_DISCUSSION: "432208507073331201",
    F1_FEEDER_SERIES: "738455791714959410",
    F1TV_N_BROADCAST: "431627942766968834",
    SHITPOST: "242392574193565711",
    F1_FANTASY_OFFICIAL: "436530724292526081",
    OFF_TOPIC: "242392969213247500",
    EMOJIS: "639401538485485569",
    MOD_QUEUE: "920333278593024071",
    MOD_QUEUE_ARCHIVE: "920333356250587156",
    AUTO_BOT_QUEUE: "967427628250308639",
    STEWARDS_QUEUE: "921485208681848842",
    LOGS: "273927887034515457",
    MOD_LOGS: "447397947261452288",
  };

  static readonly EMOTES = {
    UP: "303230406352699393",
    DOWN: "303230394008993793",
  };

  static readonly level_scale = (level: number) =>
    Math.round(
      (1.6666666667 * level ** 3 + 22.5 * level ** 2 + 75.8333333333 * level) / 5,
    ) * 5;

  static readonly XP = {
    per_message: { min: 15, max: 25, cooldown: 60000 },
    level_roles: {
      5: this.ROLES.F4,
      10: this.ROLES.F3,
      25: this.ROLES.F2,
      40: this.ROLES.F1,
    },
    role_multipliers: {
      [this.ROLES.NOXP]: 0,
      [this.ROLES.F1]: 0,
    },
    channel_category_multipliers: {
      [this.CHANNEL_CATEGORIES.LIVE_CHAT]: 0.05,
      [this.CHANNEL_CATEGORIES.MOTORSPORT]: 0.75,
      [this.CHANNEL_CATEGORIES.GENERAL_NO_F1]: 0.5,
      [this.CHANNEL_CATEGORIES.BOT]: 0,
    },
    channel_multipliers: {
      [this.CHANNELS.DRIVE_TO_SURVIVE]: 0.5,
      [this.CHANNELS.F1_GENERAL]: 0.05,
      [this.CHANNELS.F1_THREADS]: 1.5,
      [this.CHANNELS.F1_DISCUSSION]: 2,
      [this.CHANNELS.F1_FEEDER_SERIES]: 0.75,
      [this.CHANNELS.F1TV_N_BROADCAST]: 0.5,
      [this.CHANNELS.SHITPOST]: 0,
      [this.CHANNELS.F1_FANTASY_OFFICIAL]: 0.5,
    },
    levels: Array.from({ length: 40 }, (_, i): { level: number; xp: number } => ({
      level: i + 1,
      xp: this.level_scale(i),
    })),
  };

  static readonly BAN_BUTTON_AUTOMOD_RULES = new Set([
    "Block Mention Spam",
    "Disguised URLs",
  ]);

  static readonly NO_MENTION_AUTOMOD_RULES = new Set([
    "Block Mention Spam",
    "Spam Rule",
    "Disguised URLs",
  ]);

  static readonly INTENTS: Array<GatewayIntentBits> = [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ];

  static readonly PARTIALS: Array<Partials> = [
    Partials.GuildMember,
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ];

  static readonly PRESENCE: PresenceData = {
    activities: [
      {
        name: "slash commands",
        type: ActivityType.Custom,
        state: "Now with slash commands",
      },
    ],
  };

  static readonly REGEXES = {
    URL: new RE2(/^https?:\/\/([\w[\]:.-]+)\.([A-Za-z\d-]+)(:\d*)?([/#?]\S*)?$/),
    ONLY_EMOJI: new RE2(/^<:\w{2,32}:(\d{17,20})>$/),
    // eslint-disable-next-line no-control-regex
    ONLY_UNICODE: new RE2(/^[^\u0000-\u007F]+$/),
  };

  static readonly GLOBAL_REGEXES = {
    MARKDOWN: new RE2(/([*~`_[\]()])/g),
    ESCAPED_MARKDOWN: new RE2(/\\([*~`_[\]()\\])/g),
    URL: new RE2(/https?:\/\/([\w[\]:.-]+)\.([A-Za-z\d-]+)(:\d*)?([/#?]\S*)?/g),
    ZERO_WIDTH: new RE2(/[\u200B-\u200D\uFEFF]/g),
    INVITES: new RE2(
      /(discord(?:app)?\.com\/invite|discord\.gg)\/(?<code>[A-Za-z\d-]+)/g,
    ),
    YOUTUBE_VIDEOS: new RE2(/youtu(?:.*\/v\/|.*v=|\.be\/)(?<id>[A-Za-z0-9_-]{11})/g),
    NON_ASCII: new RE2(/[\x80-\uFFFF]/gu),
  };

  static readonly DEBUG_REGEXES = [new RE2(/\[.+]\(https:\/\/.+\)/s)];

  static readonly INTERVALS = {
    PROTECTION: 60000,
    MUTEX_CLEAR: 60000,
    AUTO_UNBAN: 30000,
    AUTO_UNMUTE: 30000,
    AUTO_PUNISHMENT_REMOVAL: 600000,
    YOUTUBE_CHANNEL_CACHE: 3600000,
  };

  static readonly SECONDS_PER_DAY = 86400;
}
