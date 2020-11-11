import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import * as path from "path";
import { promises as fs } from "fs";

const DEBUG = process.env.NODE_ENV !== "production";

interface MSG {
  raw: string;
  command?: string;
  params?: string;
  doc?: string;
  name?: string;
}

function toType({ command, params = "", name }: MSG): string {
  let t = `export type ${name ?? command} = M<"${command}",`;

  params = params.replace(/class/g, "klass");

  t += "[";
  let inVar = false;
  let commaPlaced = true;
  let rest = false;
  let missedOptional = 0;
  let literal = "";
  let variable = "";
  for (const c of params) {
    if (rest) {
      t += c;
      continue;
    }
    switch (c) {
      case ":":
        t += 'rest:"';
        rest = true;
        continue;
      case " ":
        if (!inVar) {
          if (literal) {
            t += `_:"${literal}",`;
            literal = "";
            continue;
          }

          if (commaPlaced) continue;

          t += ",";
          commaPlaced = true;
          continue;
        }
      case "<":
        if (!commaPlaced) continue;
        inVar = true;
        commaPlaced = false;
        continue;
      case ">":
        if (!inVar) continue;
        t += `${variable.replace(/[#|!&*]+/g, "_")}:string,`;
        commaPlaced = true;
        variable = "";
        inVar = false;
        continue;
      case "[":
        if (!commaPlaced) {
          missedOptional++;
          continue;
        }
        t += "..._:[]|[";
        continue;
      case "]":
        if (missedOptional) {
          missedOptional--;
          continue;
        }
        if (literal) {
          t += `_:"${literal}"`;
          literal = "";
        }
        t += "],";
        commaPlaced = true;
        continue;
      default:
        if (inVar) {
          variable += c;
          continue;
        }
        literal += c;
    }
  }
  if (rest) {
    t += '"';
  }

  t += "]";

  t += ">;";
  return t;
}

async function main() {
  const resp = await fetch("https://tools.ietf.org/html/rfc1459");
  const html = await resp.text();
  if (DEBUG) {
    fs.writeFile("./rfc.html", html);
  }

  const { window } = new JSDOM(html);
  const pages: HTMLPreElement[] = window.document.querySelectorAll(
    "pre.newpage"
  ) as any;
  const messagesDict: {
    [c: string]: MSG;
  } = {};
  let current = "";
  for (const page of pages) {
    page.querySelectorAll(".grey,.invisible").forEach(e => e.remove());
    for (const e of (page.childNodes as unknown) as (HTMLElement | Text)[]) {
      switch (e.nodeName) {
        case "#text":
          if (!current) break;
          messagesDict[current] ??= {
            raw: ""
          };
          messagesDict[current].raw = messagesDict[current].raw + e.textContent;
          break;
        case "SPAN":
          if (
            e.textContent!.startsWith("4.") ||
            e.textContent!.startsWith("5.")
          ) {
            current = e.textContent!;
          }

          if (e.textContent!.startsWith("6.")) {
            current = "replies";
          }

          if (e.textContent!.startsWith("6.3")) {
            current = "";
          }
          //@ts-ignore
          // switch (e.className) {
          //   case "h3":
          //     console.log("h3", e.textContent);
          //     break;
          //   case "h4":
          //     console.log("h4", e.textContent);
          //     break;
          // }
          break;
        default:
          if (DEBUG)
            //@ts-ignore
            console.log(e, e.nodeName, e.textContent, e.className);
      }
    }
  }

  const messages = Object.values(messagesDict);

  const reCommand = /Command: (?<command>\w+)/;
  const reParams = /Parameters: (?<params>[^]+?)(\n\n|$)/;

  for (const msg of messages) {
    const { command } = msg.raw.match(reCommand)?.groups ?? {};
    const { params } = msg.raw.match(reParams)?.groups ?? {};

    //console.log(msg, command, params);

    msg.command = command;
    msg.params = params?.replace(/\s+/g, " ").trim();
    msg.doc = (msg.raw.split(params)[1] ?? msg.raw)
      .trim()
      .replace(/\n{3,}/g, "\n\n");
  }

  // fs.writeFile("./messages.json", JSON.stringify(messages, null, 2));

  // fs.writeFile("./messages.txt", messages.map(m => m.doc).join("\n"));

  let ts = `import type { Message as M } from "../message.js";\n`;

  const [{ raw: repliesStr }] = messages.splice(-1, 1);
  // console.log(repliesStr);

  const replies = repliesStr.matchAll(
    /(?<code>\d+)\s*(?<command>[\w_]+)\s*"(?<params>[^"]+)"(\s*- (?<doc>[^]*?)(?= {8}\d))?/g
  );
  for (const reply of replies) {
    if (!reply.groups) continue;
    const msg: MSG = {
      raw: "",
      command: reply.groups.code,
      name: reply.groups.command,
      params: reply.groups.params
        ?.replace(/(\\\n)/g, " ")
        ?.replace(/\s+/g, " ")
        ?.trim(),
      doc: reply.groups.doc
        ?.replace(/\n{3,}/g, "\n\n")
        ?.replace(/\n {3,}/g, "\n   ")
        ?.trim()
    };
    messages.push(msg);
  }

  for (const msg of messages) {
    if (!msg.command) continue;

    ts += `/**\n`;
    const parts = [`Command: \`${msg.command}\``];
    if (msg.params) {
      parts.push(`Parameters: \`${msg.params}\``);
    }
    if (msg.doc) {
      parts.push(msg.doc);
    }
    ts += parts.join("\n\n");
    ts += `\n*/\n`;
    ts += toType(msg);
    ts += "\n\n";
  }

  const union = messages
    .map(m => m.name ?? m.command)
    .filter(Boolean)
    .join("|");
  ts += `type _ = ${union};\nexport default _;\n`;
  fs.writeFile(
    path.join(__dirname, "..", "src", "messages", "generated.d.ts"),
    ts
  );
}

main();
