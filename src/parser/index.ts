export type ParseState = (
  str: string,
  i: number
) => [next: ParseState | null, i: number];

export function parse(str: string, state: ParseState | null) {
  let i = 0;
  while (state && i < str.length) {
    //console.log(i, str[i], state.name);
    [state, i] = state(str, i);
  }
}

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

export function parseMessage(str: string) {
  const msg: Message = Object.create(null);
  msg.tags = Object.create(null);
  msg.params = [];

  let PreCommand: ParseState;
  let Tag: ParseState;
  let TagKey: ParseState;
  let TagValue: ParseState;
  let Prefix: ParseState;
  let Nick: ParseState;
  let User: ParseState;
  let Host: ParseState;
  let Command: ParseState;
  let Params: ParseState;
  let Param: ParseState;
  let Trailing: ParseState;

  let beginCommand: number;
  let beginPrefix: number;
  PreCommand = (str, i) => {
    const token = str[i];
    if (token === "@") {
      return [Tag, i + 1];
    }

    if (token === ":") {
      beginPrefix = i + 1;
      return [Prefix, i + 1];
    }

    if (str[i] === " ") {
      return [PreCommand, i + 1];
    }

    beginCommand = i;
    return [Command, i];
  };

  Command = (str, i) => {
    if (str[i] === " ") {
      msg.command = str.substring(beginCommand, i);
      return [Params, i + 1];
    }

    if (str[i] === "\r") {
      msg.command = str.substring(beginCommand, i);
      return [null, i + 2];
    }

    return [Command, i + 1];
  };

  let beginTagKey: number;
  Tag = (_, i) => {
    beginTagKey = i;
    return [TagKey, i];
  };

  let tagKey: string;
  let beginTagValue: number;
  TagKey = (str, i) => {
    if (str[i] === "=") {
      tagKey = str.substring(beginTagKey, i);
      beginTagValue = i + 1;
      return [TagValue, i + 1];
    }

    if (str[i] === ";") {
      tagKey = str.substring(beginTagKey, i);
      msg.tags![tagKey] = "";
      return [Tag, i + 1];
    }

    if (str[i] === " ") {
      tagKey = str.substring(beginTagKey, i);
      msg.tags![tagKey] = "";
      return [PreCommand, i + 1];
    }

    if (str[i] === "\r") {
      tagKey = str.substring(beginTagKey, i);
      msg.tags![tagKey] = "";
      return [null, i + 2];
    }

    return [TagKey, i + 1];
  };

  TagValue = (str, i) => {
    if (str[i] === ";") {
      msg.tags![tagKey] = str.substring(beginTagValue, i);
      return [Tag, i + 1];
    }

    if (str[i] === " ") {
      msg.tags![tagKey] = str.substring(beginTagValue, i);
      return [PreCommand, i + 1];
    }

    if (str[i] === "\r") {
      msg.tags![tagKey] = str.substring(beginTagValue, i);
      return [null, i + 2];
    }

    return [TagValue, i + 1];
  };

  let beginNick: number;
  Prefix = (_, i) => {
    beginNick = i;
    return [Nick, i];
  };

  let beginUser: number;
  let beginHost: number;
  Nick = (str, i) => {
    if (str[i] === "!") {
      beginUser = i + 1;
      msg.nick = str.substring(beginNick, i);
      return [User, i + 1];
    }

    if (str[i] === "@") {
      msg.nick = str.substring(beginNick, i);
      beginHost = i + 1;
      return [Host, i + 1];
    }

    if (str[i] === " ") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.nick = str.substring(beginNick, i);
      return [PreCommand, i + 1];
    }

    if (str[i] === "\r") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.nick = str.substring(beginNick, i);
      return [null, i + 2];
    }

    return [Nick, i + 1];
  };

  User = (str, i) => {
    if (str[i] === "@") {
      msg.user = str.substring(beginUser, i);
      beginHost = i + 1;
      return [Host, i + 1];
    }

    if (str[i] === " ") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.nick = str.substring(beginNick, i);
      return [PreCommand, i + 1];
    }

    if (str[i] === "\r") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.user = str.substring(beginUser, i);
      return [null, i + 2];
    }

    return [User, i + 1];
  };

  Host = (str, i) => {
    if (str[i] === " ") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.host = str.substring(beginHost, i);
      return [PreCommand, i + 1];
    }

    if (str[i] === "\r") {
      msg.prefix = str.substring(beginPrefix, i);
      msg.host = str.substring(beginHost, i);
      return [null, i + 2];
    }

    return [Host, i + 1];
  };

  let beginParam: number;
  Params = (_, i) => {
    if (str[i] === ":") {
      beginParam = i + 1;
      return [Trailing, i + 1];
    }

    beginParam = i;
    return [Param, i];
  };

  Param = (str, i) => {
    if (str[i] === " ") {
      msg.params.push(str.substring(beginParam, i));
      return [Params, i + 1];
    }

    if (str[i] === "\r") {
      msg.params.push(str.substring(beginParam, i));
      return [null, i + 2];
    }

    return [Param, i + 1];
  };

  Trailing = (str, i) => {
    if (str[i] === "\r") {
      msg.params.push(str.substring(beginParam, i));
      return [null, i + 2];
    }

    return [Trailing, i + 1];
  };

  parse(str, PreCommand);

  if (msg.nick && !msg.user && !msg.host) {
    msg.servername = msg.nick;
    delete msg.nick;
  }

  return msg;
}

export function ircFrameworkInterop(msg: Message) {
  return {
    command: "",
    nick: "",
    ...msg,
    hostname: msg.servername ?? msg.host,
    ident: msg.user ?? ""
  };
}
