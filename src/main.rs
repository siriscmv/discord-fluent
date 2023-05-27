use lazy_static::lazy_static;
use regex::Regex;
use std::{fs, fs::File, io::Write};
use urlencoding::encode;
use walkdir::WalkDir;

lazy_static! {
    static ref EMOJIS_PATH: String = "public/fluentui-emoji/assets/".to_owned();
    static ref EMOJI_REGEX: Regex = Regex::new("\"glyph\": \"([^\"]+)\"").unwrap();
}

fn main() {
    let emojis = fs::read_dir(EMOJIS_PATH.as_str()).unwrap();

    let mut css_animated = File::create("public/css/fluent-animated.css").unwrap();
    let mut css_3d = File::create("public/css/fluent-3d.css").unwrap();
    let mut css_color = File::create("public/css/fluent-color.css").unwrap();
    let mut css_flat = File::create("public/css/fluent-flat.css").unwrap();
    let mut css_high_contrast = File::create("public/css/fluent-high-contrast.css").unwrap();

    for emoji in emojis {
        let name = emoji.unwrap().file_name().into_string().unwrap();
        let metadata_path = format!("{}/{name}/metadata.json", EMOJIS_PATH.as_str());
        let metadata = fs::read_to_string(metadata_path).unwrap();

        let emoji = EMOJI_REGEX
            .captures(metadata.as_ref())
            .unwrap()
            .get(1)
            .unwrap()
            .as_str();

        let is_skintone_emoji = metadata.contains("Skintones");

        if let Some(css) = get_animated_css(emoji, &name) {
            css_animated.write_all(css.as_bytes()).unwrap();
        } else {
            css_animated
                .write_all(get_css(emoji, &name, is_skintone_emoji, "3D").as_bytes())
                .unwrap();
        };

        css_3d
            .write_all(get_css(emoji, &name, is_skintone_emoji, "3D").as_bytes())
            .unwrap();
        css_color
            .write_all(get_css(emoji, &name, is_skintone_emoji, "Color").as_bytes())
            .unwrap();
        css_flat
            .write_all(get_css(emoji, &name, is_skintone_emoji, "Flat").as_bytes())
            .unwrap();
        css_high_contrast
            .write_all(get_css(emoji, &name, is_skintone_emoji, "High Contrast").as_bytes())
            .unwrap();

        println!("Generated css for {emoji}!");
    }

    css_animated.flush().unwrap();
    css_3d.flush().unwrap();
    css_color.flush().unwrap();
    css_flat.flush().unwrap();
    css_high_contrast.flush().unwrap();

    println!("Done!");
}

fn get_css(emoji: &str, name: &str, is_skintone_emoji: bool, variant: &str) -> String {
    let url = format!(
        "https://discord-fluent.siris.me/fluentui-emoji/assets/{}/{}/{}_{}.{}",
        encode(name),
        if is_skintone_emoji {
            format!("Default/{}", encode(variant))
        } else {
            encode(variant).to_string()
        },
        name.to_lowercase().replace(" ", "_"),
        if is_skintone_emoji {
            format!("{}_default", variant.to_lowercase().replace(" ", "_"))
        } else {
            variant.to_lowercase().replace(" ", "_")
        },
        if variant == "3D" { "png" } else { "svg" }
    );

    format!("img[alt|=\"{emoji}\"] {{ content: url(\"{}\"); }}\n", url)
}

fn get_animated_css(emoji: &str, name: &str) -> Option<String> {
    let path = WalkDir::new("public/animated-fluent-emoji/Emojis")
        .into_iter()
        .filter_map(|e| e.ok())
        .find(|entry| {
            entry.file_name().to_str().unwrap().to_lowercase()
                == format!("{}.png", name.to_lowercase())
        })
        .map(|entry| entry.path().display().to_string().replace("public/", ""));

    if path.is_none() {
        eprintln!("Animated Emoji not found for {name}");
        return None;
    }

    let url = format!("https://discord-fluent.siris.me/{}", encode(&path.unwrap()));

    Some(format!(
        "img[alt|=\"{emoji}\"] {{ content: url(\"{}\"); }}\n",
        url
    ))
}
