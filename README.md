![Primary Simplified for Obsidian Overview](./assets/obsidian-overview-header.png)
<h1 align="center">Primary Simplified for <a href="https://obsidian.md">Obsidian</a></h1>
<p align="center">
    <a href="./LICENSE"><img alt="GPL-3.0 License" src="https://img.shields.io/badge/license-GPL--3.0-BF3F35?style=for-the-badge&labelColor=593E21"></a>
</p>

<p align="center" style="font-style: italic;">
    The original Primary theme won <a href="https://obsidian.md/october2021">Obsidian October 2021</a>'s Best Theme ✨
    <blockquote>
    Primary is soft, chewy, comforting — like a chocolate chip cookie, or a warm brownie. Primary instantly puts you in a relaxed state that opens the door to creativity and exploration. Wonderfully executed down to the smallest details, Primary ran away with first place.
    </blockquote>
</p>

<p align="right">
    <strong>Obsidian October 2021 Judges</strong>
</p>

## 🪪 Attribution & Fork Notice

**Primary Simplified** is an independent, community-maintained fork of [Primary](https://github.com/primary-theme/obsidian), originally created by Cecilia May. It is not affiliated with or endorsed by the original author.

This fork retains the original copyright and license notices and is distributed under the [GNU General Public License v3.0](./LICENSE). The repository began as an imported snapshot of Primary; it does not contain the complete upstream Git history.

If you want to support Cecilia May's original work, visit the original author's [Ko-fi page](https://ko-fi.com/ceciliamay).

## 🧭 Navigation
- [🧭 Navigation](#-navigation)
- [🪪 Attribution & Fork Notice](#-attribution--fork-notice)
- [🖼️ Previews](#️-previews)
  - [Light Mode](#light-mode)
    - [Desktop](#desktop)
    - [Mobile](#mobile)
  - [Dark Mode](#dark-mode)
    - [Desktop](#desktop-1)
    - [Mobile](#mobile-1)
- [🍭 Design Approach](#-design-approach)
  - [🌞 Principles](#-principles)
    - [Opinionated but Open](#opinionated-but-open)
    - [Functional Design](#functional-design)
    - [Balance of Aesthetic and Optimization](#balance-of-aesthetic-and-optimization)
    - [Top quality. Know you're in good hands.](#top-quality-know-youre-in-good-hands)
    - [A Collection of Fashion Houses](#a-collection-of-fashion-houses)
- [📖 Installation](#-installation)
  - [Install Primary Simplified manually](#install-primary-simplified-manually)
  - [Build from source](#build-from-source)
- [🧸 Features, Customization, and Plugins](#-features-customization-and-plugins)
- [🚧 Disclaimer](#-disclaimer)
- [🌺 Contributing](#-contributing)
  - [Non-developers](#non-developers)
  - [Developers](#developers)
    - [Build Instructions](#build-instructions)
    - [Setting up your Theme Dev Environment](#setting-up-your-theme-dev-environment)
    - [Code, Build and Test](#code-build-and-test)
  - [License](#license)
- [🧠 Creating Primary](#-creating-primary)
- [🩵 Credits](#-credits)

## 🖼️ Previews

### Light Mode

#### Desktop

![Primary for Obsidian on Desktop - Light Mode](./assets/desktop-1_light-mode.png)

#### Mobile

<p align="center">
<img alt="Primary for Obsidian on Mobile - Light Mode" src="./assets/mobile-1_light-mode.png" width="320px">
</p>

### Dark Mode

#### Desktop

![Primary for Obsidian on Desktop - Dark Mode](./assets/desktop-1_dark-mode.png)

#### Mobile

<p align="center">
<img alt="Primary for Obsidian on Mobile - Dark Mode" src="./assets/mobile-1_dark-mode.png" width="320px">
</p>

## 🍭 Design Approach

> [!NOTE]
> This section describes the design principles of the original Primary theme and is retained as project heritage.

Primary is an opinionated Obsidian theme that merges play with work.

Fine-tuned to pixel and color perfection, Primary aims to take away the need to think about customization, so that you can focus on what matters – the concepts, that link, this great idea.

Despite being opinionated, it has plenty of options and ways to make it yours.

Stay tuned, because Primary will come in more flavors soon.

### 🌞 Principles

#### Opinionated but Open

From high-level concept down to pixel-level perfection, we bring not only a theme, but an artistic experience.

Work doesn’t have to be boring, so we’re bringing play through Primary by putting you in interesting color environments.

A beautiful palette is to each their own, but we’re dedicated to allowing you to taste different versions of what we think is beautiful.

We made Primary to allow you to easily customize things on your own through snippets. Most of the code isn't hard coded, and the whole palette will be accessible through Style Settings.

#### Functional Design

- Primary forces you to focus on the files/note panes by lifting it up visually through dimming the sidebars
- Lower contrast/chroma for not so important things, and higher contrast/chroma to bring a sense of urgency.
- Layers (through visual cues of shadows, blur, and color) help establish different levels of the space
- Borders can easily garner attention due to the space they take (size, shape and color wise), but we added them with purpose: to either separate or lift

#### Balance of Aesthetic and Optimization

Primary is dedicated to serve bigger vaults. By following a design structure, it allows us to keep Primary’s code lean, lessening potential performance overhead while keeping its visual language.

This means sacrificing preset customizability. Most Primary users seem to use it out of the box, so we're putting out options in Style Settings for most customization use cases or special cases only.

Instead of presets, we exposed the variables, so that you're free to edit them to your liking. The caveat is that you do have to have some CSS knowledge, but rest assured we're here to explain as much as we can.

You will also be able to import Presets or create snippets, all using the exposed variables!

#### Top quality. Know you're in good hands.

Primary was built with every component's state in mind. Quality is considering the little things, that one may not know matters, but affects the overall experience.

We're here to build slow and deliberate, considering every pixel, fine tuning down to the decimals. Questions like: how does this thickness make me feel? What do these mix of colors trigger within me? We review the theme again and again every second you're immersed in it.

By giving you the best quality, we offload the stress of having to tinker to make Obsidian better by offering you a beautiful piece of product that just works.

#### A Collection of Fashion Houses

Primary isn’t here to give every single UI possibility. We’re here to give you just the Primary experience, but allow you to experience different fashion houses.

Additional color palettes and theme presets options will be available for those who want Primary’s design principles to better suit their personality.

## 📖 Installation

### Install Primary Simplified manually

Primary Simplified is not currently listed in Obsidian's Community Themes directory.

> [!IMPORTANT]
> Obsidian's directory policy requires a publicly verifiable approval from the original author, or evidence that an inactive author could not be reached, before a fork can be submitted. Primary Simplified will remain a manual release until that requirement is documented.

1. Download [`theme.css`](./theme.css) and [`manifest.json`](./manifest.json) from this repository.
2. Create `<vault>/.obsidian/themes/Primary Simplified/`.
3. Copy both downloaded files into that folder.
4. Reload Obsidian, then select **Primary Simplified** under **Settings → Appearance → Themes**.

The original **Primary** theme by Cecilia May remains available from Obsidian's Community Themes directory.

### Build from source

See [CONTRIBUTING.md](./CONTRIBUTING.md) for prerequisites, build commands, and the local development workflow.

## 🧸 Features, Customization, and Plugins

The [Primary for Obsidian Full Guide](https://primary-theme.github.io/) documents the original Primary theme. Most concepts still apply, but fork-specific behavior may diverge over time.

## 🚧 Disclaimer

The theme, as stated in the license, is provided as is. The theme is originally designed to be of personal use with macOS, Windows, and mobile. It isn't thoroughly tested in all operating systems, or in all use cases (considering Obsidian's flexibility).

The theme is a heavily modified version of Obsidian so it may break with future updates. It may also clash with other CSS snippets you have (or plugins' CSS styling).

Consider contributing to this open project if you'd like to support a necessary feature or plugin, or share your CSS snippets in the discussion page!

## 🌺 Contributing

### Non-developers

If you are not a developer, report problems and feature requests on this fork's [Issues page](../../issues). Before filing a report, check whether the problem is also present with Obsidian's default theme and disable snippets and community plugins where practical.

### Developers

#### Build Instructions

Primary Simplified is written with CSS and [Sass](https://sass-lang.com/) and built with a small Node.js script using Dart Sass.

Prerequisite: a current LTS [Node.js](https://nodejs.org/) release. No global packages are required.

#### Setting up your Theme Dev Environment

Within the repo's path, run `npm install` to install all necessary modules.

For immediate reloads during development, clone or symlink this repository as the active theme directory in a disposable vault. Obsidian reads the regenerated root `theme.css` directly.

#### Code, Build and Test

For a one-shot, deterministic build (used in CI and recommended before opening a PR):

```
npm run build
```

This compiles `src/scss`, embeds the local WOFF2 font subsets, and concatenates the license banner and Style Settings metadata into the single distributable `theme.css`.

For active development:

```
npm run watch
```

> [!NOTE] What does `watch` do?
> It watches `src/` and regenerates the root `theme.css` after every change. Obsidian reloads it when this repository is the installed theme directory.

Run `npm test` before publishing. The contract tests validate the manifest, Style Settings ids, offline assets, release workflow, supported project structure, and the CSS size budget. The full manual release matrix is in [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

### License

Primary Simplified is licensed under the **GNU General Public License v3.0**. See the [LICENSE](./LICENSE) file for the full text and [`src/css/readme.css`](./src/css/readme.css) for the fork and upstream notices.

## 🧠 Creating Primary

> [!NOTE]
> “Creating Primary” and “Credits” below are the original author's words, retained as project heritage and attribution.

I had 3 problems I wanted to solve.

1. I needed a theme that would give me instant visual context. Much like how Cybertron is, but less cyber-y.
2. I needed a theme that would remind me that my PKM is fun and welcoming.
3. I needed a theme that would remind me that my PKM is not perfect.

I decided to make a theme for my own use. (Coincidentally, I found out about Obsidian October at last minute. I literally didn't start until 10 days ago. HAHAHA. This event really pushed me to start making it!)

BUT, going back to the theme, I wanted to solve these three problems.

Coming from my experience in watercoloring back in high school (and expressing that color science nerd-side of mine), I figured I wanted to go back to the basics. I thought, why not primary colors? In paint mixing for most works, a defined set of "primary colors" (or a limited palette) are all you need! Each text emphasis would correspond to a primary color. To me, italics felt blue, bold felt red, and links felt yellow. And so Problem #1 was solved.

Now, what else has primary colors? Well, I remembered Bauhaus and Ikea. My favorite Ikea items were the wooden toys. They also came in primary colors. Despite the primary colors as a basis of the design, I still wanted it to be warm (as in, feeling cozy) and not so "in your face" or "poppy". While working on the theme, I stumbled upon one of my indie favorites, *I'm Fine by Hazel English*. The music video actually is just pages of retro magazines. What I noticed was how colorful but calming these pages were. I've gone through old magazines myself. The aspect I was most fascinated with was how the aging and yellowing affected the colors... The luxurious green was now minty. The blues were subdued. The reds were cozy. I decided to combine all of their visual language and concluded a summary explained in these following words: Warm. Wood is Warm. Primary Colors. Warm Primary Colors. Warm and Primary SCHOOLS. Primary is children? Children love to play. Children love games. Ikea wooden toys with primary colors that children love to play with? Anyway, Problem #2 is now solved.

All of these design choices and coincidences tied perfectly to this feeling of imperfectness. Like, a kid growing up. Karla—the ever so slightly weird looking font I've chosen for Primary—looks like a better version of your handwriting in 5th grade. The cherry on top was when I figured out how to create that specific button and box shadows style. It felt like the interface of a game I used to play!

Thus, 3 personal problems solved through this theme. I really enjoyed making this. I hope it'll give you joy too.

I'm planning to update it as best as I can and create more themes hopefully with a different design.

If you've read all the way down here, well, what the heck. Thank you for listening to my TED talk. Please go back to writing your notes or whatever was more important than my rambles. Hahaha!

<small style="font-style: italic;">written 2021-11-01</small>

## 🩵 Credits

I owe a lot to jdanielmourao ([Sanctum](https://github.com/jdanielmourao/obsidian-sanctum)), kepano ([Minimal](https://github.com/kepano/obsidian-minimal)), chetachiezikeuzor ([Yin and Yang](https://github.com/chetachiezikeuzor/Yin-and-Yang-Theme)), and sainhe ([Gruvbox Material](https://github.com/sainnhe/gruvbox-material) and [Everforest](https://github.com/sainnhe/everforest))! Their work inspired me design-wise and their themes helped me a lot in creating mine.

I would also like to thank the Community for continuously giving me inspiration! It's been that way since I joined the Obsidian Discord. I would never forget the welcoming and incredible response I received when I first posted Primary to the group. I'm forever grateful.

Lastly, I would like to say that I am very blessed to have such active, loving, and supportive users. Despite being inactive for a couple of years, many have stood by the theme, continued to support and encourage me. I cannot fathom this support, but I deeply appreciate it.

Thank you guys for everything.
