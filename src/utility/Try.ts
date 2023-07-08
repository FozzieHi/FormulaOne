import { DiscordAPIError } from "discord.js";

export default async <Type>(
  promise: Promise<Type>,
  filterCode?: string,
): Promise<boolean> => {
  try {
    await promise;
    return true;
  } catch (err) {
    if (
      filterCode != null &&
      err instanceof DiscordAPIError &&
      err.code.toString() !== filterCode
    ) {
      throw err;
    }
    return false;
  }
};
