import "@sapphire/plugin-logger/register";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework";
import Sentry from "@sentry/node";
import credentials from "./credentials.json" assert { type: "json" };
import db from "./database/index.js";
import { Constants } from "./utility/Constants.js";
import "./intervals/Protection.js";
import "./intervals/MutexClear.js";
import { handleError } from "./utility/Logger.js";

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
  Sentry.init({
    dsn: credentials.sentryDsn,
  });
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
  await db.connect(credentials.mongodbConnectionURL, credentials.dbName); // eslint-disable-line
  container.logger.info(`Database: Took ${Date.now() - start}ms to connect.`);
  await client.login(credentials.token); // eslint-disable-line
})().catch((err) => handleError(err));
