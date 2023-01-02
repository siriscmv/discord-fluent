const TWEMOJI_URL = "https://emojis.wiki/twitter/";
import fetch from "node-fetch";
import { writeFileSync } from "fs";

const toFluent = (emoji) =>
    `https://api.iconify.design/fluent-emoji/${emoji}.svg`;
const toCSS = (emoji) =>
    `img[aria-label*="${emoji.emoji}"] { content: url("${emoji.url}"); }\n`;

const strip = (name) => {
    return name
        .replaceAll(":", "")
        .replaceAll("“", "")
        .replaceAll("”", "")
        .replaceAll("’", "")
        .replaceAll("️", "")
        .replace(/^tok$/g, "");
};

const getEmojis = async () => {
    const response = await fetch(TWEMOJI_URL);
    const text = await response.text();
    const emojis = text.match(/(?<=alt=")(.*)(?=")/g).map((e) => {
        const text = e.split('"')[0].split(" ");
        const emoji = text.shift();
        const name = strip(text.map((s) => s.toLowerCase()).join("-"));

        if (name === "") return { emoji: null, url: null };
        return { emoji, url: toFluent(name) };
    });

    return emojis;
};

const generateCSS = (emojis) =>
    emojis
        .filter((e) => e.emoji)
        .map(toCSS)
        .join("");

const saveFile = (css) => writeFileSync("emojis.css", css);

getEmojis().then(generateCSS).then(saveFile);
