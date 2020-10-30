type EventMap = {
  [type: string]: Array<any>;
};

interface IEventTarget<M extends EventMap> {
  addEventListener<E extends keyof M>(e: E, cb: (...args: M[E]) => void): void;
  addEventListener(e: "error", cb: (err: any) => void): void;
  removeEventListener?(e: string, cb: Function): void;
}

interface IEventEmitter<M extends EventMap> {
  on<E extends keyof M>(e: E, cb: (...args: M[E]) => void): void;
  on(e: "error", cb: (err: any) => void): void;
  off?(e: string, cb: Function): void;
}

export async function* on<T, E extends string>(
  source: IEventTarget<{ [e in E]: [T] }> | IEventEmitter<{ [t in E]: [T] }>,
  event: E
) {
  type Event = { val: T } | { err: any };
  interface Executer {
    res(val: T): void;
    rej(err?: any): void;
  }

  const events: Event[] = [];
  const promises: Executer[] = [];

  function handler(val: T) {
    if (0 in promises) {
      promises.shift()!.res(val);
    } else {
      events.push({ val });
    }
  }

  function errorHandler(err?: any) {
    if (0 in promises) {
      promises.shift()!.rej(err);
    } else {
      events.push({ err });
    }
  }

  const method = "on" in source ? "on" : "addEventListener";

  const s = source as IEventEmitter<{ [e in E]: [T] }> &
    IEventTarget<{ [e in E]: [T] }>;
  s[method](event, handler);
  s[method]("error", errorHandler);

  try {
    while (true) {
      let ev = events.shift();
      if (ev) {
        if ("err" in ev) throw ev.err;

        yield ev.val;
        continue;
      }

      yield new Promise<T>((res, rej) => {
        promises.push({ res, rej });
      });
    }
  } finally {
    s.off?.(event, handler);
    s.off?.("error", errorHandler);
    s.removeEventListener?.(event, handler);
    s.removeEventListener?.("error", errorHandler);
  }
}
