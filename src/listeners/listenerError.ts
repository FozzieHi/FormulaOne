import { Listener } from "@sapphire/framework";
import Sentry from "@sentry/node";

export class ListenerErrorListener extends Listener {
  public async run(error: Error) {
    Sentry.captureException(error);
  }
}
