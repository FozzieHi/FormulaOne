import "@sapphire/plugin-logger/register";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework";
import credentials from "./credentials.json";
import db from "./database";
import { Constants } from "./utility/Constants";
import "./intervals/Protection";
import "./intervals/MutexClear";

declare module "@sapphire/framework" {
  interface Preconditions {
    BannedUser: never;
    MemberValidation: never;
    NoModerator: never;
    F2: never;
    F3: never;
    Helpers: never;
    Marshals: never;
    Stewards: never;
  }
}

(async () => {
  const client = new SapphireClient({
    intents: Constants.INTENTS,
    partials: Constants.PARTIALS,
    presence: Constants.PRESENCE,
  });
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.Overwrite
  );
  const start = Date.now();
  container.logger.info("Database: Connecting...");
  await db.connect(credentials.mongodbConnectionURL, credentials.dbName);
  container.logger.info(`Database: Took ${Date.now() - start}ms to connect.`);
  await client.login(credentials.token);
})().catch((err) => container.logger.error(err));
