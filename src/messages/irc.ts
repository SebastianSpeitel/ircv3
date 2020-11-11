import type { Message as M } from "../message.js";
export * from "./generated.js";
import _ from "./generated.js";
export default _;

// import type { ChannelMode, UserMode } from "./special.js";
// import type ErrorMessage from "./errors.js";

// type MODE_Channel = M<
//   "MODE",
//   [
//     channel: string,
//     mode: ChannelMode,
//     ...arg: [] | [limit: string] | [user: string] | [mask: string]
//   ]
// >;
// type MODE_User = M<"MODE", [nickname: string, mode: UserMode]>;

// type StatsQuery = "c" | "h" | "i" | "k" | "l" | "m" | "o" | "y" | "u";

// export type PASS = M<"PASS", [password: string]>;

// /**
//   NICK message is used to give user a nickname or change the previous
//   one.  The <hopcount> parameter is only used by servers to indicate
//   how far away a nick is from its home server.  A local connection has
//   a hopcount of 0.  If supplied by a client, it must be ignored.

//   If a NICK message arrives at a server which already knows about an
//   identical nickname for another client, a nickname collision occurs.
//   As a result of a nickname collision, all instances of the nickname
//   are removed from the server's database, and a KILL command is issued
//   to remove the nickname from all other server's database. If the NICK
//   message causing the collision was a nickname change, then the
//   original (old) nick must be removed as well.

//   If the server recieves an identical NICK from a client which is
//   directly connected, it may issue an ERR_NICKCOLLISION to the local
//   client, drop the NICK command, and not generate any kills.
// */
// export type NICK = M<
//   "NICK",
//   [nickname: string, ...rest: [hopcount: string] | []]
// >;

// export type USER = M<
//   "USER",
//   [username: string, hostname: string, servername: string, realname: string]
// >;

// export type PRIVMSG = M<"PRIVMSG", [receivers: string, text: string]>;

// export type CONNECT = M<
//   "CONNECT",
//   [server: string, ...rest: [] | [port: string, ...rest: [] | [server: string]]]
// >;

// export type SERVER = M<
//   "SERVER",
//   [servername: string, hopcount: string, info: string]
// >;

// export type MODE = MODE_Channel | MODE_User;

// export type PING = M<"PING", [server: string, ...rest: [] | [server2: string]]>;

// type Message =
//   | ErrorMessage
//   | PASS
//   | NICK
//   | USER
//   | SERVER
//   | M<"OPER", [user: string, password: string]>
//   | M<"QUIT", [message: string] | []>
//   | M<"SQUIT", [server: string, comment: string]>
//   | M<"JOIN", [channels: string, keys: string]>
//   | M<"PART", [channels: string]>
//   | MODE
//   | M<"TOPIC", [channel: string, ...rest: [] | [topic: string]]>
//   | M<"NAMES", [channels: string]>
//   | M<"LIST", [] | [channels: string, ...rest: [] | [server: string]]>
//   | M<"INVITE", [nickname: string, channel: string]>
//   | M<"KICK", [channel: string, user: string, ...rest: [] | [comment: string]]>
//   | M<"VERSION", [] | [server: string]>
//   | M<"STATS", [] | [query: StatsQuery, ...rest: [] | [server: string]]>
//   | M<"LINKS", [] | [server: string, ...rest: [] | [mask: string]]>
//   | M<"TIME", [] | [server: string]>
//   | CONNECT
//   | M<"TRACE", [] | [server: string]>
//   | M<"ADMIN", [] | [server: string]>
//   | M<"INFO", [] | [server: string]>
//   | PRIVMSG
//   | M<"NOTICE", [nickname: string, text: string]>
//   | M<"WHO", [] | [name: string, ...filter: [] | [filter: "o"]]>
//   | M<"WHOIS", [...server: [] | [server: string], nickmasks: string]>
//   | M<
//       "WHOWAS",
//       [
//         nickname: string,
//         ...rest: [] | [count: string, ...rest: [] | [server: string]]
//       ]
//     >
//   | M<"KILL", [nickname: string, comment: string]>
//   | PING
//   | M<"PONG", [daemon: string, ...rest: [] | [daemon2: string]]>
//   | M<"ERROR", [message: string]>
//   | M<"AWAY", [] | [message: string]>
//   | M<"REHASH", []>
//   | M<"RESTART", []>
//   | M<"SUMMON", [user: string, ...rest: [] | [server: string]]>
//   | M<"USERS", [] | [server: string]>
//   | M<"WALLOPS", [text: string]>
//   | M<"USERHOST", [nicknames: string]>
//   | M<"ISON", [nicknames: string]>;

// export default Message;
