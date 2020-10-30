import type { NetConnectOpts, Socket } from "net";

interface IsomorphicSocket extends AsyncIterable<string> {
  write(chunk: string): void;
}

function isNode() {
  return typeof process === "object" && !!process?.versions?.node;
}

type Options = NetConnectOpts | string;
const NOOP = () => undefined;

async function* stream(socket: WebSocket) {
  let ondata: (data: string) => void = NOOP;
  let onerror: (reason?: any) => void = NOOP;

  socket.addEventListener("message", (ev) => {
    ondata(ev.data);
  });
  socket.addEventListener("error", (err) => {
    onerror(err);
  });

  while (socket.readyState === socket.OPEN) {
    yield new Promise<string>((res, rej) => {
      ondata = res;
      onerror = rej;
    });
  }
}

export async function open(options: Options): Promise<IsomorphicSocket> {
  if (isNode()) {
    const { createConnection } = await import("net");
    const socket = createConnection(options as NetConnectOpts);
    await new Promise((res) => socket.once("connect", res));
    return socket;
  }

  if (typeof WebSocket !== "undefined") {
    const s = new WebSocket(options as string);
    await new Promise((res) =>
      s.addEventListener("connect", res, { once: true })
    );

    const socket = Object.assign(s, {
      write(this: typeof s, chunk: string) {
        this.send(chunk);
      },
      [Symbol.asyncIterator](this: typeof s) {
        return stream(this);
      },
    });

    return socket;
  }

  throw new Error("No socket implementation found");
}
