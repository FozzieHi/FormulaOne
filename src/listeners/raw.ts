import { container, Listener } from "@sapphire/framework";
import { GuildTextBasedChannel, Snowflake } from "discord.js";
import TryVal from "../utility/TryVal.js";
import { filterCheckMessage } from "../services/BotQueueService.js";

type Packet = {
  t: string;
  d: {
    poll?: {
      question: {
        text: string;
      };
      answers: {
        poll_media: {
          text: string;
        };
      }[];
    };
    id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
  };
};

export class RawListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context);
  }

  public async run(packet: Packet) {
    const { poll } = packet.d;
    if (packet.t === "MESSAGE_CREATE" && poll != null) {
      const guild = await TryVal(
        container.client.guilds.fetch(packet.d.guild_id as Snowflake),
      );
      if (guild == null) {
        return;
      }

      const channel = (await TryVal(
        guild.channels.fetch(packet.d.channel_id as Snowflake),
      )) as GuildTextBasedChannel;
      if (channel == null) {
        return;
      }

      const message = await TryVal(channel.messages.fetch(packet.d.id as Snowflake));
      if (message == null) {
        return;
      }

      const contentToCheck = [
        `Title: ${poll.question.text}`,
        ...poll.answers.map((answer) => `Option: ${answer.poll_media.text}`),
      ];
      message.content = `(Poll) ${contentToCheck.join(", ")}`;
      await filterCheckMessage(message);
    }
  }
}
