import { Message } from "discord.js";
import { experienceForMessage } from "../utility/Experience.js";
import db from "../database/index.js";

export async function handleMessageExperience(message: Message) {
  if (message.author.bot || !message.inGuild()) {
    return;
  }
  const expGained = experienceForMessage(message);

  if (expGained === 0) {
    return;
  }

  await db.userRepo?.upsertUser(message.author.id, message.guildId, {
    $inc: { experience: expGained },
  });
}
