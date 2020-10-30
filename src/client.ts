import type { Socket, TcpNetConnectOpts } from "net";
import { parser, Message, format } from "./message.js";
import { on } from "./util.js";

async function pong(client: Client) {
  for await (const msg of client) {
    if (msg.command !== "PING") continue;

    client.send({ ...msg, command: "PONG" });
  }
}

export interface Client extends AsyncIterable<Message> {
  send(msg: Message): void;
  send(raw: string): void;
}

export function fromWebSocket(ws: WebSocket): Client {
  async function* stream() {
    for await (const ev of on<MessageEvent, "message">(ws, "message")) {
      yield ev.data;
    }
  }

  const client: Client = {
    send(msg: string | Message) {
      if (typeof msg !== "string") {
        msg = format(msg);
      }
      return ws.send(msg);
    },
    [Symbol.asyncIterator]() {
      return parser(stream());
    }
  };

  return client;
}

export function fromSocket(socket: Socket): Client {
  const client: Client = {
    send(msg: string | Message) {
      if (typeof msg !== "string") {
        msg = format(msg);
      }
      return socket.write(msg);
    },
    [Symbol.asyncIterator]() {
      return parser(on(socket, "data"));
    }
  };

  return client;
}

export interface ClientConnectOpts extends Partial<TcpNetConnectOpts> {
  url?: string | URL;
  ssl?: boolean;
}

export async function connect(opt: ClientConnectOpts = {}): Promise<Client> {
  if (typeof WebSocket !== "undefined") {
    let url = opt.url?.toString();
    if (url === undefined || url === null) {
      const opts = {
        host: "irc-ws.chat.twitch.tv",
        ssl: true,
        port: opt.ssl ? 443 : 80,
        ...opt
      };
      url = `ws${opts.ssl ? "s" : ""}://${opts.host}:${opts.port}`;
    }

    const socket = new WebSocket(url);

    for await (const _ of on(socket, "open")) {
      break;
    }

    return fromWebSocket(socket);
  }

  try {
    const net = await import("net");
    // irc://irc.chat.twitch.tv:6697
    const opts: TcpNetConnectOpts = {
      host: "irc.chat.twitch.tv",
      port: opt.ssl ? 6697 : 6667,
      ...opt
    };
    const socket = net.createConnection(opts);

    for await (const _ of on(socket, "connect")) {
      break;
    }

    return fromSocket(socket);
  } catch {
    throw Error();
  }
}

// export function createClient(nick: string, pass: string) {
//   const socket = createConnection({
//     host: "irc.chat.twitch.tv",
//     port: 6667
//   });

//   const handler = {
//     get(cmds: Client["commands"], command: string) {
//       cmds[command] ??= (...params: string[]) => {
//         socket.write(format({ command, params, tags: {} }));
//       };

//       return cmds[command];
//     }
//   };

//   const client: Client = {
//     send(msg: string | Message) {
//       if (typeof msg !== "string") {
//         msg = format(msg);
//       }
//       socket.write(msg);
//     },
//     socket,
//     commands: new Proxy({}, handler),
//     [Symbol.asyncIterator]() {
//       return parser(socket);
//     }
//   };

//   pipeline(
//     socket,
//     parser as any,
//     async function* (source: AsyncGenerator<Message>) {
//       for await (const msg of source) {
//         console.log(msg);
//         if (msg.command !== "PRIVMSG") {
//           continue;
//         }
//         //p.PRIVMSG("#vorniy", msg.params.join(" "));
//       }
//     } as any,
//     err => err && console.error(err)
//   );

//   socket.once("connect", async () => {
//     console.log("connected");
//     // socket.on("data", console.log);

//     client.commands.PASS(pass);
//     client.commands.NICK(nick);

//     client.commands.CAP("REQ", "twitch.tv/tags");
//     client.commands.CAP("REQ", "twitch.tv/commands");
//     client.commands.JOIN("#lara6683");
//     // client.commands.JOIN("#andidev");
//     // client.commands.JOIN("#artimus83");

//     // socket.write(`PASS ${pass}\r\n`);
//     // socket.write(`NICK ${nick}\r\n`);

//     // socket.write(`CAP REQ :twitch.tv/tags\r\n`);
//     // socket.write(`JOIN #vorniy\r\n`);
//     // socket.write(`JOIN #bastighg\r\n`);

//     //await wait(1000);
//     //client.commands.PRIVMSG(`#vorniy`, "Hello world");
//   });

//   socket.once("error", console.error);

//   return client;
// }

// createClient("vorniy", "oauth:w5m3m5hws1crrun3vfjkbdre016zox");
