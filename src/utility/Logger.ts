import { container } from "@sapphire/framework";
import Sentry from "@sentry/node";

export function handleError(err: unknown) {
  container.logger.error(err);
  Sentry.captureException(err);
}
