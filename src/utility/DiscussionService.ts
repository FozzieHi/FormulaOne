import { Message } from "discord.js";
import { Constants } from "./Constants.js";
import Try from "./Try.js";

export async function addDiscussionReactions(message: Message) {
  await Try(message.react(Constants.EMOTES.UP));
  await Try(message.react(Constants.EMOTES.DOWN));
}
