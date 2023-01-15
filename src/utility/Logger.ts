import { container } from "@sapphire/framework";
import Sentry from "@sentry/node";

export function handleError(error: unknown) {
  container.logger.error(error);
  Sentry.captureException(error);
}

export function debugLog(debugMessage: string) {
  container.logger.debug(debugMessage);
}
