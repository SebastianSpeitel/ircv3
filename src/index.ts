import { Client, connect } from "./client.js";
import { authenticate, join, requestCapability } from "./commands.js";

export * from "./message.js";
export * from "./client.js";
export * as commands from "./commands.js";

async function handle(client: Client) {
  for await (const msg of client) {
    //@ts-ignore
    console.log("Message:\n", msg, "\n");
  }
}

async function main() {
  const client = await connect({ ssl: false });

  const secrets = await import("./secret.js");

  await authenticate(client, {
    nick: secrets.NICK,
    password: secrets.PASSWORD
  });

  await requestCapability(client, "twitch.tv/tags");
  await requestCapability(client, "twitch.tv/commands");
  console.log("Caps acquired");
  await join(client, "vorniy");
  await join(client, "doktorfroid");
  console.log("Channels joined");

  handle(client);

  //   say(client, "vorniy", "abc");
}

main();
