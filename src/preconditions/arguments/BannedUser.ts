import { Precondition } from "@sapphire/framework";
import { ChatInputCommandInteraction, User } from "discord.js";
import Try from "../../utility/Try.js";

export class BannedUserPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand !== "remove") {
      return this.ok();
    }
    const target = interaction.options.getUser("user") as User;
    if (interaction.guild == null || target == null) {
      return this.error({ message: "Guild/target is null or undefined." });
    }
    const ban = await Try(interaction.guild.bans.fetch(target));
    return ban ? this.ok() : this.error({ message: "Banned user not found." });
  }
}
