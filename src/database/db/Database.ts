import { MongoClient } from "mongodb";
import { GuildRepository } from "../repositories/GuildRepository";
import { UserRepository } from "../repositories/UserRepository";
import { MuteRepository } from "../repositories/MuteRepository";
import { PunishmentRepository } from "../repositories/PunishmentRepository";
import { BanRepository } from "../repositories/BanRepository";
import { SafeBrowsingCacheRepository } from "../repositories/SafeBrowsingCacheRepository";
import { YouTubeChannelCacheRepository } from "../repositories/YouTubeChannelCacheRepository";

export class Database {
  private guildRepo: GuildRepository | undefined;

  private userRepo: UserRepository | undefined;

  private muteRepo: MuteRepository | undefined;

  private punRepo: PunishmentRepository | undefined;

  private banRepo: BanRepository | undefined;

  private safeBrowsingCacheRepo: SafeBrowsingCacheRepository | undefined;

  private youtubeChannelCacheRepo: YouTubeChannelCacheRepository | undefined;

  async connect(connectionURL: string, dbName: string) {
    const connection = await MongoClient.connect(connectionURL);
    const db = connection.db(dbName);

    this.guildRepo = new GuildRepository(db.collection("guilds"));
    this.userRepo = new UserRepository(db.collection("users"));
    this.muteRepo = new MuteRepository(db.collection("mutes"));
    this.punRepo = new PunishmentRepository(db.collection("punishments"));
    this.banRepo = new BanRepository(db.collection("bans"));
    this.safeBrowsingCacheRepo = new SafeBrowsingCacheRepository(
      db.collection("safeBrowsingCache")
    );
    this.youtubeChannelCacheRepo = new YouTubeChannelCacheRepository(
      db.collection("youtubeChannelCache")
    );

    await db.collection("guilds").createIndex("guildId", { unique: true });
    await db
      .collection("users")
      .createIndex({ userId: 1, guildId: 1 }, { unique: true });
    await db
      .collection("mutes")
      .createIndex({ userId: 1, guildId: 1 }, { unique: true });
    await db
      .collection("punishments")
      .createIndex({ userId: 1, guildId: 1 }, { unique: false });
    await db
      .collection("bans")
      .createIndex({ userId: 1, guildId: 1 }, { unique: true });
    await db.collection("safeBrowsingCache").createIndex("hash", { unique: true });
    await db.collection("youtubeChannelCache").createIndex("videoId", { unique: true });
  }
}
