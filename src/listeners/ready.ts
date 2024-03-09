import { container, Listener } from "@sapphire/framework";
import { Client } from "discord.js";
import http from "http";
import { Constants } from "../utility/Constants.js";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context) {
    super(context, {
      once: true,
    });
  }

  public run(client: Client) {
    if (client.user != null) {
      this.container.logger.info(`${client.user.username} has successfully connected.`);
      const healthCheckServer = http.createServer((req, res) => {
        if (req.url === "/healthz" && req.method === "GET") {
          res.writeHead(200);
          res.end("OK");
        } else {
          res.writeHead(404);
          res.end("Not Found");
        }
      });
      healthCheckServer.listen(Constants.HEALTH_CHECK_PORT, () => {
        container.logger.info(
          `Health Check: Started on port ${Constants.HEALTH_CHECK_PORT}.`,
        );
      });
    }
  }
}
