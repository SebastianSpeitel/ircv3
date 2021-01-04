import { printArray, printNumber, printString } from "./imports";

export class TuringState {
  next!: (char: u16, state: TuringState) => i32;
}

export type Tape = Uint16Array;

export class TuringMachine<T extends TuringState> {
  private tape: Tape;
  private head: i32 = 0;
  private state: T;

  private processed: i32 = 0;
  private end: i32 = 0;

  constructor(private length: i32, rootState: T) {
    this.tape = new Uint16Array(this.length);
    this.state = rootState;
  }

  private shift(): void {
    if (this.processed === 0) return;
    this.tape.copyWithin(0, this.processed, this.end);
    this.end -= this.processed;
    this.head -= this.processed;
    this.processed = 0;
  }

  push(data: Tape): void {
    this.shift();

    // printNumber(this.end);
    // printNumber(data.length);
    // printNumber(this.length);

    // Make sure tape is long enough
    if (this.end + data.length > this.length) {
      throw new Error();
    }
    this.tape.set(data, this.end);
    this.end += data.length;
    // for (let i = 0; i < data.length; ++i) {
    //   pushed(data[i]);
    // }
  }

  pushString(str: string): void {
    const buffer = String.UTF16.encode(str);
    const array = Uint16Array.wrap(buffer);
    this.push(array);
  }

  run(): void {
    while (this.head < this.end) {
      const char = this.tape[this.head];
      const offset = this.state.next!(char, this.state);
      this.head += offset;
    }
  }

  print(): void {
    printArray(this.tape);
    printString("processed");
    printNumber(this.processed);
    printString("end");
    printNumber(this.end);
    // for (let i: i32 = 0; i < this.length; ++i) {
    //   if (i === this.processed) {
    //     printString("processed");
    //   }
    //   if (i === this.end) {
    //     printString("end");
    //   }
    //   printNumber(this.tape[i]);
    // }
  }
}
