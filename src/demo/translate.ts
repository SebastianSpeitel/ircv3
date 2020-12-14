import fetch from "node-fetch";
import * as IRC from "../";
import * as Twitch from "../twitch";
//@ts-ignore
import { nick, password } from "../../env.js";

interface TranslationResponse {
  from: string;
  original_text: string;
  to: string;
  translated_characters: number;
  translated_text: {
    [lang: string]: string;
  };
}

interface TranslationResponse2 {
  responseData: { translatedText: string; match: number };
  quotaFinished: boolean;
  mtLangSupported: null;
  responseDetails: string;
  responseStatus: number;
  responderId: string;
  exception_code: null;
  matches: [
    {
      id: "622095453";
      segment: string;
      translation: string;
      source: "en-GB";
      target: "it-IT";
      quality: "74";
      reference: null;
      "usage-count": 96;
      subject: "All";
      "created-by": "MateCat";
      "last-updated-by": "MateCat";
      "create-date": "2020-12-06 22:12:53";
      "last-update-date": "2020-12-06 22:12:53";
      match: 1;
    }
  ];
}

async function translate(
  text: string,
  { to = "en", from = "es" }: { to?: string; from?: string }
) {
  const resp = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${from}|${to}`
  );
  console.log(resp.status, resp.statusText);
  const json: TranslationResponse2 = await resp.json();

  return json.matches[0];
}

const PATTIES = [
  "Infopatty",
  "Chefredpatty",
  `Broadcastpatty`,
  `Sonnenstich-Patty`,
  `Modelpatty`,
  `Reflektor-Patty`,
  `sPi-Patty`,
  `Häschen Patty`,
  `Orga-Patty`,
  `EasyRig Patty`,
  `Aufmunterungspatty`,
  `Eskalationspatty`,
  `Japan-Patty`,
  `Hacker-Patty`,
  `Spoiler-Patty`,
  `Sherlok-Patty`,
  `Einzig wahre Patty`,
  `Empatty`,
  `Sympatty`,
  `Antipatty`,
  `Osteopatty`,
  `Homeopatty`,
  `Telepatty`,
  `Marketingpatty`,
  `Meme-Patty`,
  `Spanisch-Patty`,
  `Lebensretter Patty`,
  `Erste-Hilfe Patty`
];

function patty() {
  return PATTIES[Math.floor(Math.random() * PATTIES.length)];
}

function weird() {
  return "https://youtu.be/EKioiRfBbwo?t=2426";
}

const re = /(?<from>\w+)->(?<to>\w+)/;

async function main() {
  const client = await IRC.connect();
  console.log("connected");
  await IRC.commands.authenticate(client, {
    nick,
    password
  });
  console.log("authenticated");
  await IRC.commands.join(client, "sayo_aluka");
  await IRC.commands.join(client, "vorniy");
  console.log("joined");

  for await (const msg of client) {
    if (msg.command !== "PRIVMSG") continue;
    const text = msg.params[1];
    const room = msg.params[0].substr(1);

    if (text.startsWith("!patty")) {
      IRC.commands.say(client, room, `Patty ist jetzt ${patty()}.`);
      continue;
    }

    if (text.startsWith("!weird")) {
      IRC.commands.say(client, room, weird());
      continue;
    }

    const match = re.exec(text);
    if (!match) continue;
    const resp = await translate(text.replace(re, ""), match.groups ?? {});

    console.log(resp);
    if (!resp) continue;
    IRC.commands.say(client, room, resp.translation);
  }
}

main();
