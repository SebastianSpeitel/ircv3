import * as IRC from "./index.js";
import { parse, parseMessage, ParseState } from "./parser.js";

export function parseEmotes(msg: PRIVMSG) {
  const emoteString = msg.tags?.emotes;
  let message = msg.params[1];
  if (emoteString === undefined) {
    throw TypeError(`Can't parse emotes of ${msg}.`);
  }
  // <emote ID>:<first index>-<last index>,<another first index>-<another last index>/<another emote ID>:<first index>-<last index>...

  let Id: ParseState;
  let FirstIndex: ParseState;
  let LastIndex: ParseState;

  interface Emote {
    id: number;
    first: number;
    last: number;
  }

  const emotes = new Map<number, Emote>();
  let id = "";
  let firstIndex = "";
  let lastIndex = "";

  function addEmote() {
    const _id = +id;
    const first = +firstIndex;
    const last = +lastIndex;
    emotes.set(first, { id: _id, first, last });
  }

  Id = (str, i) => {
    if (str[i] === ":") {
      return [FirstIndex, i + 1];
    }
    id += str[i];
    return [Id, i + 1];
  };

  FirstIndex = (str, i) => {
    if (str[i] === "-") {
      return [LastIndex, i + 1];
    }
    firstIndex += str[i];
    return [FirstIndex, i + 1];
  };

  LastIndex = (str, i) => {
    if (str[i] === ",") {
      addEmote();
      firstIndex = "";
      lastIndex = "";
      return [FirstIndex, i + 1];
    }

    if (str[i] === "/") {
      addEmote();
      id = "";
      firstIndex = "";
      lastIndex = "";
      return [Id, i + 1];
    }
    lastIndex += str[i];
    return [LastIndex, i + 1];
  };

  parse(emoteString, Id);
  if (id) addEmote();

  // console.log(emotes);

  const parsed: (string | { id: number; raw: string })[] = [];
  let raw = "";
  let i = 0;
  const len = message.length;

  do {
    let emote: Emote | undefined;
    while (!(emote = emotes.get(i)) && i < len) {
      raw += message[i++];
    }
    if (!emote) {
      parsed.push(raw);
      break;
    }
    const { id, last } = emote;
    parsed.push(raw, { id, raw: message.substring(i, last + 1) });
    i = last + 1;
    raw = "";
  } while (i < len);

  return parsed;
}

interface ConnectOptions {
  address?: string;
  user: string;
  pass: string;
}

export function connect(opt: ConnectOptions): IRC.Client {
  const socket = new WebSocket(
    opt.address ?? "wss://irc-ws.chat.twitch.tv:443"
  );
  const client = IRC.fromWebSocket(socket);
  return client;
}

export interface Emote {
  id: number;
  raw: string;
}

// function parseEmotes(msg: IRC.Messages.PRIVMSG) {
//   type EmoteInfo = [id: number, first: number, last: number];
//   const emoteTag = msg.tags?.emotes;
//   const text = msg.params[1];
//   if (!emoteTag) return;

//   const emotes = emoteTag
//     .split(",")
//     .map(e => e.split(/:-/).map(p => +p) as EmoteInfo);

//   let i = 0;
//   const parts: (string | number)[] = [];
//   for (const [id, first, last] of emotes) {
//     if (first > i) {
//       parts.push(text.substring(i, first));
//     }
//     parts.push(id);
//     if (last < text.length) {
//       parts.push(text.substring());
//     }
//   }
// }

export async function* emoteParser(
  source: AsyncIterable<IRC.Messages.default>
) {
  for await (const m of source) {
    if (m.command === "PRIVMSG") {
    }
  }
}

/*
[Object: null prototype] {
  tags: [Object: null prototype] {
    'badge-info': '',
    badges: 'bits/100',
    color: '#B22222',
    'display-name': 'Vorniy',
    'emote-sets': '0,15739,19194,33563,57718,71001,177691,393476,607172,812815,1042834,300374282,301014519,301229669,301592777,301736584,301850800,302177316,477339272,488737509,537206155,564265402',
    mod: '0',
    subscriber: '0',
    'user-type': ''
  },
  params: [ '#lara6683' ],
  nick: 'tmi.twitch.tv',
  servername: 'tmi.twitch.tv',
  command: 'USERSTATE'
}
*/

/*
[Object: null prototype] {
  tags: [Object: null prototype] {
    'emote-only': '0',
    'followers-only': '1',
    r9k: '0',
    rituals: '1',
    'room-id': '80352893',
    slow: '0',
    'subs-only': '0'
  },
  params: [ '#lara6683' ],
  nick: 'tmi.twitch.tv',
  servername: 'tmi.twitch.tv',
  command: 'ROOMSTATE'
} 
*/

/*
[Object: null prototype] {
  tags: [Object: null prototype] {
    'badge-info': 'subscriber/20',
    badges: 'subscriber/12',
    color: '#FF0000',
    'display-name': 'Chadraln',
    emotes: '',
    flags: '',
    id: '68861f08-76bd-434b-9064-a253b11b2200',
    login: 'chadraln',
    mod: '0',
    'msg-id': 'resub',
    'msg-param-cumulative-months': '20',
    'msg-param-months': '0',
    'msg-param-should-share-streak': '0',
    'msg-param-sub-plan-name': 'Channel Subscription (lara6683)',
    'msg-param-sub-plan': '1000',
    'msg-param-was-gifted': 'false',
    'room-id': '80352893',
    subscriber: '1',
    'system-msg': "Chadraln subscribed at Tier 1. They've subscribed for 20 months!",
    'tmi-sent-ts': '1600608539232',
    'user-id': '29480273',
    'user-type': ''
  },
  params: [ '#lara6683' ],
  nick: 'tmi.twitch.tv',
  servername: 'tmi.twitch.tv',
  command: 'USERNOTICE'
}
*/

// type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
// type LetterAF = "a" | "b" | "c" | "d" | "e" | "f";
// type HexDigit = Digit | LetterAF | `${uppercase LetterAF}`;
// type Uppercase<T extends string> = `${uppercase T}`;

type UUID = string;

export type PRIVMSG = IRC.Message<
  "PRIVMSG",
  [channel: string, text: string],
  {
    "badge-info": string; //"subscriber/3";
    badges: string; //"subscriber/3,bits/100";
    "client-nonce": string; //"84adf29e1ec78c907cbadc7cb4de905b";
    color: string;
    "display-name": string; //"PianoManDom";
    emotes: string; //"483:8-9";
    flags: string; //"";
    id: UUID; //"6b1d2f6d-dd1c-45e1-893c-f3998175083f";

    /**@deprecated */
    mod: "0" | "1";
    "room-id": string; //"80352893";

    /**@deprecated */
    subscriber: "0" | "1";
    "tmi-sent-ts": string; //"1600608704774";

    /**@deprecated */
    turbo: "0" | "1";
    "user-id": string; //"235906802";
    "user-type": string; //"";
  }
>;

// type abc = IRC.Message<"abc", [], {}>;
// type abcd = IRC.Message<"", []>;

// type a = abcd["tags"];
// let m: abcd = {} as any;

// type cmd = IRC.Commands<IRC.IRCMessage>;

// type c = cmd[411];

// let d = m.tags?.abc;
/*
[Object: null prototype] {
  tags: [Object: null prototype] {
    'badge-info': 'subscriber/3',
    badges: 'subscriber/3,bits/100',
    'client-nonce': '84adf29e1ec78c907cbadc7cb4de905b',
    color: '#2234B2',
    'display-name': 'PianoManDom',
    emotes: '483:8-9',
    flags: '',
    id: '6b1d2f6d-dd1c-45e1-893c-f3998175083f',
    mod: '0',
    'room-id': '80352893',
    subscriber: '1',
    'tmi-sent-ts': '1600608704774',
    turbo: '0',
    'user-id': '235906802',
    'user-type': ''
  },
  params: [ '#lara6683', 'anytime <3' ],
  nick: 'pianomandom',
  servername: 'pianomandom',
  user: 'pianomandom',
  host: 'pianomandom.tmi.twitch.tv',
  command: 'PRIVMSG'
}*/

export namespace filter {
  export type Filter<T extends IRC.Message = IRC.Message> = (msg: T) => boolean;

  export function or(...filter: Filter[]): Filter {
    return msg => filter.some(f => f(msg));
  }

  export function and(...filter: Filter[]): Filter {
    return msg => filter.every(f => f(msg));
  }

  export const isCommand: Filter<PRIVMSG> = msg =>
    msg.params[1].startsWith("!");
}

// console.log(
//   parseEmotes(
//     <PRIVMSG>(
//       IRC.parse(
//         "@badge-info=;badges=staff/1,bits/1000;bits=100;color=;display-name=ronni;emotes=;id=b34ccfc7-4977-403a-8a94-33c6bac34fb8;mod=0;room-id=1337;subscriber=0;tmi-sent-ts=1507246572675;turbo=1;user-id=1337;user-type=staff :ronni!ronni@ronni.tmi.twitch.tv PRIVMSG #ronni :cheer100"
//       )
//     )
//   )
// );
