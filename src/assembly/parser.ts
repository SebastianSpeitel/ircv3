import { TuringMachine, TuringState, Tape } from "./turingMachine";
export * from "./imports";
import { printString } from "./imports";

type char = u16;

class ParserState extends TuringState {
  command: Array<char> = new Array<char>();
  tags: Map<string, string> = new Map<string, string>();
  params: Array<string> = new Array<string>();

  //temp
  tagKey: Array<char> = new Array<char>();
  tagValue: Array<char> = new Array<char>();
  param: Array<char> = new Array<char>();

  constructor() {
    super();
    this.next = PreCommand;
  }
}

const CHAR_AT: char = u16("@".charCodeAt(0));
const CHAR_COLON: char = u16(":".charCodeAt(0));
const CHAR_SEMICOLON: char = u16(";".charCodeAt(0));
const CHAR_SPACE: char = u16(" ".charCodeAt(0));
const CHAR_RETURN: char = u16("\r".charCodeAt(0));
const CHAR_NEWLINE: char = u16("\n".charCodeAt(0));
const CHAR_EQUALS: char = u16("=".charCodeAt(0));

function toString(arr: Array<u16>): string {
  let str: string = "";
  for (let i: i32 = 0; i < arr.length; i++) {
    str += String.fromCharCode(i32(arr[i]));
  }
  return str;
  // return String.fromCharCodes(changetype<Array<i32>>(arr));
}

function PreCommand(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_AT:
      state.next = Tag;
      return 1;

    // case CHAR_COLON:
    //   state.next = Prefix;
    //   return 1;

    case CHAR_SPACE:
      return 1;
  }

  state.next = Command;
  return 0;
}

function Command(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_SPACE:
      state.next = Params;
      return 1;

    case CHAR_RETURN:
      state.next = End;
      return 0;
  }

  state.command.push(char);
  return 1;
}

function Tag(char: char, state: ParserState): i32 {
  state.tagKey.length = 0;

  state.next = TagKey;
  return 0;
}

function TagKey(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_EQUALS:
      state.next = TagValue;
      return 1;

    case CHAR_SEMICOLON:
    case CHAR_SPACE:
    case CHAR_RETURN:
      const key = toString(state.tagKey);
      state.tags.set(key, "");

      if (char === CHAR_SEMICOLON) {
        state.next = Tag;
        return 1;
      }

      if (char === CHAR_SPACE) {
        state.next = PreCommand;
        return 1;
      }

      if (char === CHAR_RETURN) {
        state.next = End;
        return 0;
      }
  }

  state.tagKey.push(char);
  return 1;
}

function TagValue(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_SEMICOLON:
    case CHAR_SPACE:
    case CHAR_RETURN:
      const key = toString(state.tagKey);
      const value = toString(state.tagValue);
      state.tags.set(key, value);

      printString(key);
      printString(value);

      if (char === CHAR_SEMICOLON) {
        state.next = Tag;
        return 1;
      }

      if (char === CHAR_SPACE) {
        state.next = PreCommand;
        return 1;
      }

      if (char === CHAR_RETURN) {
        state.next = End;
        return 0;
      }
  }

  state.tagValue.push(char);
  return 1;
}

//TODO: Prefix zeug

function Params(char: char, state: ParserState): i32 {
  state.param.length = 0;

  switch (char) {
    case CHAR_COLON:
      state.next = Trailing;
      return 1;
  }

  state.next = Param;
  return 0;
}

function Param(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_SPACE:
    case CHAR_RETURN:
      const param = toString(state.param);
      state.params.push(param);

      if (char === CHAR_SPACE) {
        state.next = Params;
        return 1;
      }

      if (char === CHAR_RETURN) {
        state.next = End;
        return 0;
      }
  }

  state.param.push(char);
  return 1;
}

function Trailing(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_RETURN:
      const param = toString(state.param);
      state.params.push(param);

      state.next = End;
      return 0;
  }

  state.param.push(char);
  return 1;
}

function End(char: char, state: ParserState): i32 {
  switch (char) {
    case CHAR_RETURN:
      return 1;
  }
  // magic
  state.next = PreCommand;
  return 1;
}

export const Tape_ID = idof<Tape>();

export class Parser extends TuringMachine<ParserState> {
  constructor(length: i32) {
    super(length, new ParserState());
  }
}
