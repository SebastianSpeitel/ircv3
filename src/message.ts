export { default as IRCMessage } from "./messages/irc.js";
export * as Messages from "./messages/irc.js";

export interface Message<
  C extends string = string,
  P extends string[] = string[],
  T extends Record<string, string> = Record<string, string>
> {
  command: C;
  params: P;
  prefix?: string;
  servername?: string;
  nick?: string;
  user?: string;
  host?: string;
  tags?: T;
}

export type Commands<M extends Message> = {
  [C in M["command"]]: (...args: (M & { command: C })["params"]) => void;
};

const unescapes: Record<string, string> = {
  ":": ";",
  s: " ",
  "\\": "\\",
  r: "\r",
  n: "\n"
};

function unescape(escaped: string): string {
  let unescaped = "";

  for (let i = 0; i < escaped.length; ++i) {
    if (escaped[i] !== "\\") {
      unescaped += escaped[i];
      continue;
    }

    i++;
    unescaped += unescapes[escaped[i]] ?? escaped[i];
  }

  return unescaped;
}

const escapes: Record<string, string> = {
  ";": "\\:",
  " ": "\\s",
  "\\": "\\\\",
  "\r": "\\r",
  "\n": "\\n"
};

function escape(unescaped: string): string {
  let escaped = "";
  for (let i = 0; i < unescaped.length; ++i) {
    escaped += escapes[unescaped[i]] ?? unescaped[i];
  }
  return escaped;
}

type ParseState = {
  [marker: string]: ParseState;
};

const STrailing: ParseState = {};

const SCommand: ParseState = {};

const SPrefixHost: ParseState = {
  " ": SCommand
};

const STagValue: ParseState = {
  " ": SCommand
};

const STagKey: ParseState = {
  " ": SCommand,
  "=": STagValue
};
STagKey[";"] = STagKey;
STagValue[";"] = STagKey;
SCommand["@"] = STagKey;

const SPrefixUser: ParseState = {
  " ": SCommand,
  "@": SPrefixHost
};

const SPrefixNick: ParseState = {
  " ": SCommand,
  "!": SPrefixUser,
  "@": SPrefixHost
};
SCommand[":"] = SPrefixNick;

const SParams: ParseState = {
  ":": STrailing
};
SCommand[" "] = SParams;
SParams[" "] = SParams;

function parse(message: string): Message {
  const msg: Message & { tags: Record<string, string> } = Object.create(null);
  msg.tags = Object.create(null);
  msg.params = [];

  //@ts-ignore
  msg.raw = message;

  let pos: number = 0;
  let next: ParseState | null;
  let state = SCommand;

  let marker: string;

  let tagKey: string;
  while (pos < message.length) {
    const begin = pos;
    next = null;
    while (!next && pos < message.length) {
      marker = message[pos];
      next = state[marker];
      pos++;
    }

    const token = message.substring(begin, next ? pos - 1 : pos);

    switch (state) {
      case STagKey:
        tagKey = token;
        msg.tags[tagKey] = "";
        break;
      case STagValue:
        msg.tags[tagKey!] = unescape(token);
        break;
      case SPrefixNick:
        msg.nick = token;
        msg.servername = token;
        break;
      case SPrefixUser:
        msg.user = token;
        break;
      case SPrefixHost:
        msg.host = token;
        break;
      case SCommand:
        if (next === SParams || next === null) {
          msg.command = token;
        }
        break;
      case SParams:
        if (next === STrailing) break;
        msg.params.push(token);
        break;
      case STrailing:
        msg.params.push(token);
        break;
    }
    state = next!;
  }

  return msg;
}

export function format(msg: Message): string {
  let line = "";

  if (msg.tags) {
    const tags = Object.entries(msg.tags);
    if (tags.length) {
      line += "@";
      line += tags.map(([k, v]) => (v ? `${k}=${v}` : escape(k))).join(";");
      line += " ";
    }
  }

  if (msg.servername || msg.nick) {
    line += ":";
    line += msg.servername ?? msg.nick;
    if (msg.user) {
      line += ":";
      line += msg.user;
    }
    if (msg.host) {
      line += "@";
      line += msg.host;
    }
    line += " ";
  }

  line += msg.command;

  for (let i = 0; i < msg.params.length; i++) {
    line += " ";
    if (i === msg.params.length - 1) {
      line += ":";
    }
    line += msg.params[i];
  }

  line += "\r\n";

  return line;
}

// console.log(
//   parse(
//     "@login=ronni;target-msg-id=abc-123-def :tmi.twitch.tv CLEARMSG #dallas :HeyGuys"
//   )
// );

// console.log(
//   parse(
//     "@badge-info=subscriber/8;badges=subscriber/6;color=#0D4200;display-name=dallas;emote-sets=0,33,50,237,793,2126,3517,4578,5569,9400,10337,12239;turbo=0;user-id=1337;user-type=admin :tmi.twitch.tv GLOBALUSERSTATE"
//   )
// );

// console.log(
//   parse(
//     "@badge-info=;badges=staff/1,bits/1000;bits=100;color=;display-name=ronni;emotes=;id=b34ccfc7-4977-403a-8a94-33c6bac34fb8;mod=0;room-id=1337;subscriber=0;tmi-sent-ts=1507246572675;turbo=1;user-id=1337;user-type=staff :ronni!ronni@ronni.tmi.twitch.tv PRIVMSG #ronni :cheer100"
//   )
// );

export async function* parser(source: AsyncIterable<string | Buffer>) {
  let data = "";

  for await (const chunk of source) {
    data += chunk.toString();

    for (let end = 0; end < data.length; end++) {
      if (data[end] === "\r") {
        const msg = data.slice(0, end);

        data = data.slice(end + 2);
        end = 0;

        yield parse(msg);
      }
    }
  }
}

export async function caller<T extends Message>(
  source: AsyncIterable<T>,
  handler: Commands<T>
) {
  for await (const msg of source) {
    const cmd: keyof Commands<T> = msg.command;
    handler?.[cmd](...msg.params);
  }
}

// for (let iter = 0; iter < 10000; iter++) {
//   console.time("parse");
//   parse(
//     "@badge-info=;badges=staff/1,bits/1000;bits=100;color=;display-name=ronni;emotes=;id=b34ccfc7-4977-403a-8a94-33c6bac34fb8;mod=0;room-id=1337;subscriber=0;tmi-sent-ts=1507246572675;turbo=1;user-id=1337;user-type=staff :ronni!ronni@ronni.tmi.twitch.tv PRIVMSG #ronni :cheer100"
//   );
//   console.timeEnd("parse");
// }

// console.log(inspect(SCommand, { depth: 10, colors: true }));
