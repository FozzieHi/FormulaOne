import "@sapphire/plugin-logger/register";
import {
  ApplicationCommandRegistries,
  container,
  RegisterBehavior,
  SapphireClient,
} from "@sapphire/framework";
import { init, rewriteFramesIntegration } from "@sentry/node";
import db from "./database/index.js";
import { Constants } from "./utility/Constants.js";
import "./intervals/AutoPunishmentRemoval.js";
import "./intervals/AutoUnban.js";
import "./intervals/AutoUnmute.js";
import "./intervals/MutexClear.js";
import "./intervals/Protection.js";
import { handleError } from "./utility/Logger.js";

(async () => {
  init({
    dsn: process.env.SENTRY_DSN,
    release: process.env.RELEASE_HASH,
    beforeSend(event) {
      const newEvent = event;

      let newMessage = event.message;
      newMessage = newMessage?.replaceAll(
        process.env.MONGODB_CONNECTION_URL as string,
        "[CONNECTION_URL]",
      );
      newMessage = newMessage?.replaceAll(process.env.TOKEN as string, "[TOKEN]");
      newEvent.message = newMessage;

      return newEvent;
    },
    integrations: [rewriteFramesIntegration({ root: process.cwd() })],
  });
  const client = new SapphireClient({
    intents: Constants.INTENTS,
    partials: Constants.PARTIALS,
    presence: Constants.PRESENCE,
  });
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.Overwrite,
  );
  const start = Date.now();
  container.logger.info("Database: Connecting...");
  await db.connect(
    process.env.MONGODB_CONNECTION_URL as string,
    process.env.DB_NAME as string,
  );
  container.logger.info(`Database: Took ${Date.now() - start}ms to connect.`);

  await client.login(process.env.TOKEN);
})().catch((err) => handleError(err));
