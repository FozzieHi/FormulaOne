import { container } from "@sapphire/framework";
import { captureException } from "@sentry/node";

export function handleError(error: unknown) {
  container.logger.error(error);
  captureException(error);
}

export function infoLog(debugMessage: unknown) {
  container.logger.info(debugMessage);
}
