import { writeFileSync } from "fs";

const TWEMOJI_URL = "https://emojis.wiki/twitter/";

const toFluent = (emoji) => `https://api.iconify.design/fluent-emoji/${emoji}.svg`;

const toCSS = (emoji) => `img[aria-label*="${emoji.emoji}"] { content: url("${emoji.url}"); }`;

const isBlacklisted = (name) => {
    if (name === "") return true;
    if (name === "tok") return true;
    if (/^flag-/.test(name)) return true;

    return false;
};

const clean = (name) => {
    return name
        .replaceAll(":", "")
        .replaceAll("“", "")
        .replaceAll("”", "")
        .replaceAll("’", "")
        .replaceAll("️", "");
};

const getEmojis = async () => {
    const response = await fetch(TWEMOJI_URL);
    const text = await response.text();
    const emojis = text.match(/(?<=alt=")(.*)(?=")/g).map((e) => {
        const text = e.split('"')[0].split(" ");
        const emoji = text.shift();
        const name = clean(text.map((s) => s.toLowerCase()).join("-"));

        return {emoji, url: isBlacklisted(name) ? null : toFluent(name)};
    });

    return emojis;
};

const generateCSS = (emojis) =>
    emojis
        .filter((e) => e.url)
        .map(toCSS)
        .join("\n");

getEmojis().then(generateCSS).then(css => writeFileSync("emojis.css", css));
