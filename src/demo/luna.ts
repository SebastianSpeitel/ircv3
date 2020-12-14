import * as IRC from "../";
//@ts-ignore
import { nick, password } from "../../env.js";

const commands = {};

async function main() {
  const client = await IRC.connect();
  console.log("connected");
  await IRC.commands.authenticate(client, {
    nick,
    password
  });
  console.log("authenticated");
  await IRC.commands.join(client, "sayo_aluka");
  await IRC.commands.join(client, "vorniy");
  console.log("joined");

  for await (const msg of client) {
    if (msg.command !== "PRIVMSG") continue;
    const text = msg.params[1];
    const room = msg.params[0].substr(1);
  }
}

main();
