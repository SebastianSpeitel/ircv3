import * as IRC from "./index.js";

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

type privmsg = IRC.IRCMessage & { command: "MODE" };

export interface Emote {
  id: string;
}

export interface Message extends IRC.Messages.PASS {}

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

type PRIVMSG = IRC.Message<
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

type abc = IRC.Message<"abc", [], {}>;
type abcd = IRC.Message<"", []>;

type a = abcd["tags"];
let m: abcd = {} as any;

type cmd = IRC.Commands<IRC.IRCMessage>;

type c = cmd[411];

let d = m.tags?.abc;
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
