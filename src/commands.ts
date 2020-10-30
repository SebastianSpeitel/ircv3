import type { Client } from "./client";

interface AuthInfo {
  nick: string;
  password?: string;
}

export async function authenticate(client: Client, auth: AuthInfo) {
  if (auth.password) {
    client.send({ command: "PASS", params: [auth.password] });
  }

  client.send({ command: "NICK", params: [auth.nick] });

  for await (const _ of client) {
    break;
  }
}

export async function join(client: Client, room: string) {
  client.send({ command: "JOIN", params: [`#${room}`] });

  for await (const m of client) {
    if (m.command === "366" && m.params[1] === `#${room}`) {
      break;
    }
  }
}

export function say(client: Client, room: string, msg: string) {
  client.send({ command: "PRIVMSG", params: [`#${room}`, msg] });
}

export async function requestCapability(client: Client, capability: string) {
  client.send({ command: "CAP", params: ["REQ", capability] });
  for await (const m of client) {
    if (
      m.command === "CAP" &&
      m.params[1] === "ACK" &&
      m.params[2] === capability
    ) {
      break;
    }
  }
}
