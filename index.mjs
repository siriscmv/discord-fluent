import fetch from "node-fetch";
import { writeFileSync } from "fs";

const TWEMOJI_URL = "https://emojis.wiki/twitter/";

const toFluent = (emoji) =>
    `https://api.iconify.design/fluent-emoji/${emoji}.svg`;

const toCSS = (emoji) =>
    `img[aria-label*="${emoji.emoji}"] { content: url("${emoji.url}"); }`;

const clean = (name) => {
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
        const name = clean(text.map((s) => s.toLowerCase()).join("-"));

        if (name === "") return { emoji, url: null };
        return { emoji, url: toFluent(name) };
    });

    return emojis;
};

const generateCSS = (emojis) =>
    emojis
        .filter((e) => e.url)
        .map(toCSS)
        .join("\n");

getEmojis().then(generateCSS).then(css => writeFileSync("emojis.css", css));
