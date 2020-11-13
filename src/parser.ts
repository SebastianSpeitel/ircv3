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

export function parseMessage(str: string) {
  const msg: import("./message").Message = Object.create(null);
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
  PreCommand = (str, i) => {
    const token = str[i];
    if (token === "@") {
      return [Tag, i + 1];
    }

    if (token === ":") {
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
    return [TagKey, i + 1];
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

    return [TagValue, i + 1];
  };

  let beginNick: number;
  Prefix = (_, i) => {
    beginNick = i + 1;
    return [Nick, i + 1];
  };

  let beginUser: number;
  let beginHost: number;
  Nick = (str, i) => {
    if (str[i] === "!") {
      msg.nick = str.substring(beginNick, i);
      return [User, i + 1];
    }

    if (str[i] === "@") {
      msg.nick = str.substring(beginNick, i);
      beginHost = i;
      return [Host, i + 1];
    }

    if (str[i] === " ") {
      msg.nick = str.substring(beginNick, i);
      return [PreCommand, i + 1];
    }

    return [Nick, i + 1];
  };

  User = (str, i) => {
    if (str[i] === "@") {
      msg.user = str.substring(beginUser, i);
      beginHost = i;
      return [Host, i + 1];
    }

    if (str[i] === " ") {
      msg.nick = str.substring(beginUser, i);
      return [PreCommand, i + 1];
    }

    return [User, i + 1];
  };

  Host = (str, i) => {
    if (str[i] === " ") {
      msg.host = str.substring(beginHost, i);
      return [PreCommand, i + 1];
    }

    return [Host, i + 1];
  };

  let beginParam: number;
  Params = (_, i) => {
    beginParam = i;
    return [Param, i];
  };

  Param = (str, i) => {
    if (str[i] === ":") {
      beginParam = i + 1;
      return [Trailing, i + 1];
    }

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

  return msg;
}

// console.log(
//   parseMessage(
//     "@login=ronni;target-msg-id=abc-123-def :tmi.twitch.tv CLEARMSG #dallas :HeyGuys\r"
//   )
// );
