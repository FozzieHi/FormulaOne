import "@sapphire/plugin-logger/register";
import {
  ApplicationCommandRegistries,
  container,
  RegisterBehavior,
  SapphireClient,
} from "@sapphire/framework";
import Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import db from "./database/index.js";
import { Constants } from "./utility/Constants.js";
import "./intervals/Protection.js";
import "./intervals/MutexClear.js";
import { handleError } from "./utility/Logger.js";
import { getReleaseHash } from "./utility/ReleaseUtil.js";
import "dotenv/config";

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
    dsn: process.env.SENTRY_DSN,
    release: await getReleaseHash(),
    beforeSend(event) {
      const newEvent = event;

      let newMessage = event.message;
      newMessage = newMessage?.replaceAll(
        process.env.MONGODB_CONNECTION_URL as string,
        "[CONNECTION_URL]"
      );
      newMessage = newMessage?.replaceAll(process.env.TOKEN as string, "[TOKEN]");
      newEvent.message = newMessage;

      return newEvent;
    },
    integrations: [
      new RewriteFrames({
        root: process.cwd(),
      }),
    ],
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
  await db.connect(
    process.env.MONGODB_CONNECTION_URL as string,
    process.env.DB_NAME as string
  );
  container.logger.info(`Database: Took ${Date.now() - start}ms to connect.`);
  await client.login(process.env.TOKEN);
})().catch((err) => handleError(err));
