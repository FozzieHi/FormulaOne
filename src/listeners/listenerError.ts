import { Listener } from "@sapphire/framework";
import { captureException } from "@sentry/node";

export class ListenerErrorListener extends Listener {
  public async run(error: Error) {
    captureException(error);
  }
}
