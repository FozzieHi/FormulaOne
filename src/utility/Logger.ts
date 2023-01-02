import { container } from "@sapphire/framework";
import Sentry from "@sentry/node";

export function handleError(error: Error) {
  container.logger.error(error);
  Sentry.captureException(error);
}
