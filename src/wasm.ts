import * as loader from "@assemblyscript/loader";
import * as fs from "fs";
import * as path from "path";
import { Message as IMessage } from './parser'

const wasmPath = path.join(__dirname, 'assembly', "parser.wasm");
const resultObject = loader.instantiateSync(fs.readFileSync(wasmPath), {
  env: {
    abort(...args) {
      console.error(args);
    }
  },
  imports: {
    printNumber: console.log,
    printString: ptr => console.log(__getString(ptr)),
    printArray: arr => console.log(__getUint16Array(arr))
  }
});

const {
  Parser,
  __getString,
  __newString,
  __getUint16Array,
  __getArray,
  __release,
  Message: MessageAS,
  TagEntry: TagEntryAS
} = resultObject.exports;

class Message {
  static from(ptr: number): IMessage {
    const m: IMessage = Object.create(null);
    //@ts-ignore
    const msg = MessageAS.wrap(ptr);
    for (const strProp of [
      "command",
      "prefix",
      "servername",
      "nick",
      "user",
      "host"
    ]) {
      m[strProp] = __getString(msg[strProp]);
    }
    m.params = __getArray(msg.params).map(__getString);
    const tagEntries = __getArray(msg.tagEntries).map(ptr => {
      //@ts-ignore
      const entry = TagEntryAS.wrap(ptr);
      return [__getString(entry.key), __getString(entry.value)];
    });
    m.tags = Object.fromEntries(tagEntries);
    __release(ptr);
    return m;
  }
}

export function parseMessage(str: string): IMessage {
  //@ts-ignore
  const parser = new Parser(str.length);
  parser.pushString(__newString(str));
  parser.run();
  const messages = __getArray(parser.messages);
  if (!messages.length) {
    return undefined;
  }
  const msg = Message.from(messages[0]);
  __release(parser);
  return msg;
}