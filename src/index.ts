import "@sapphire/plugin-logger/register";
import credentials from "./credentials.json";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework";
import { Constants } from "./utility/Constants";
import { PermissionService } from "./services/PermissionService";

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
  await PermissionService.register();
})().catch((err: Error) => container.logger.error(err));
