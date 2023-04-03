import { readFileSync, writeFileSync } from "fs";

const toFluent = (name) => `https://api.iconify.design/fluent-emoji/${name}.svg`;
const toCSS = (emoji) => `img[alt|="${emoji.emoji}"] { content: url("${emoji.url}"); }`;

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
    const emojis = JSON.parse(readFileSync("emojis.json", "utf-8"));

    return emojis.map(e => {
        const emoji = e.emoji;
        const name = clean(e.name);
        const url = isBlacklisted(name) ? null : toFluent(name);

        return {emoji, url};
    });
};

const generateCSS = (emojis) =>
    emojis
        .filter((e) => e.url)
        .map(toCSS)
        .join("\n");

getEmojis().then(generateCSS).then(css => writeFileSync("emojis.css", css));
