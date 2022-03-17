import { Args, Command } from "@sapphire/framework";
import { Message } from "discord.js";
import { replyMsg } from "../utility/Sender";

export class TestCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "test",
      description: "test command",
    });
  }

  public async messageRun(message: Message, args: Args) {
    await replyMsg(message, "Test " + (await args.pick("string")));
  }
}
