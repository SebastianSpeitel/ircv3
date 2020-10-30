import fetch from "node-fetch";
import { JSDOM } from "jsdom";

async function main() {
  const resp = await fetch("https://tools.ietf.org/html/rfc1459");
  const html = await resp.text();
  //console.log(html);

  const { window } = new JSDOM(html);
  const pages: HTMLPreElement[] = window.document.querySelectorAll(
    "pre.newpage"
  ) as any;
  const messages = {};
  let current = "";
  for (const page of pages) {
    page.querySelectorAll(".grey,.invisible").forEach(e => e.remove());
    for (const e of (page.childNodes as unknown) as (HTMLElement | Text)[]) {
      switch (e.nodeName) {
        case "#text":
          if (!current) break;
          messages[current] ??= {
            ''
          }
          messages[current] = (messages[current] ?? "") + e.textContent;
          break;
        case "SPAN":
          if (e.textContent.startsWith("4.")) {
            current = e.textContent;
          }

          if (e.textContent.startsWith("7.")) {
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
          //@ts-ignore
          console.log(e, e.nodeName, e.textContent, e.className);
      }
    }
  }
  console.log(messages);
  import("fs").then(fs =>
    fs.promises.writeFile("./messages.json", JSON.stringify(messages, null, 2))
  );
}

main();
