import type { Message as M } from "../message.js";

interface Errors {
  401: [nickname: string, str: "No such nick/channel"];
  402: [server: string, str: "No such server"];
  403: [channel: string, str: "No such channel"];
  404: [channel: string, str: "Cannot send to channel"];
  405: [channel: string, str: "You have joined too many channels"];
  406: [nickname: string, str: "There was no such nickname"];
  407: [target: string, str: "Duplicate recipients. No message delivered"];
  409: [str: 'No origin specified'];
  411: [str: `No recipient given (${string})`];
  412: [str: 'No text to send'];
  413: [mask: string, str: 'No toplevel domain specified'];
  414: [mask: string, str: 'Wildcard in toplevel domain']
}
type Messages = {
  [E in keyof Errors]: M<`${E}`, Errors[E]>
}
type ErrorMessage = Messages[keyof Messages];
export default ErrorMessage;
