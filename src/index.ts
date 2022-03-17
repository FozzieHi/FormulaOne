import "@sapphire/plugin-logger/register";
import credentials from "./credentials.json";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework";
import { Constants } from "./utility/Constants";

(async () => {
  const client = new SapphireClient({
    defaultPrefix: Constants.PREFIX,
    intents: Constants.INTENTS,
    presence: Constants.PRESENCE,
    caseInsensitiveCommands: true,
    loadMessageCommandListeners: true,
  });
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.Overwrite
  );
  await client.login(credentials.token);
})().catch((err: Error) => container.logger.error(err));
