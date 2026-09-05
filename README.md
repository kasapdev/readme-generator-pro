# README Generator Pro

[![CI](https://github.com/kasapdev/readme-generator-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/readme-generator-pro/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black)

Build a polished `README.md` from a simple form, with a live Markdown preview and real shields.io badges — fast, private, and fully offline.

> A zero-dependency README workbench. Fill in your project name, tagline, badges, install command, usage snippet, and feature list, and watch a properly rendered preview build itself in real time. Copy the raw Markdown or download `README.md` directly — nothing ever leaves your browser.

## Overview

README Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. A form on the left captures your project's details; the pane on the right renders a live, GitHub-flavored preview using a small hand-written Markdown-to-HTML converter (no external library). A segmented control flips the output pane between the rendered **Preview** and the raw **Markdown** source.

## Features

- **Project basics** — name and a one-line tagline.
- **Real shields.io badges** — toggle License, Build Status (static placeholder), Version, and Language badges; the License badge reflects your chosen license (MIT, Apache-2.0, GPL-3.0, BSD-3-Clause, ISC, Unlicense, MPL-2.0) with an appropriate color, and Version/Language badges use editable text.
- **Install command** — free-text, wrapped in a `bash` fenced code block.
- **Usage example** — a code snippet with a selectable fence language (bash / js / python / text).
- **Repeatable feature list** — add or remove bullet rows on the fly; renders as a Markdown list.
- **Contributing & License sections** — optional boilerplate sections, toggled independently.
- **Live Markdown → HTML preview** — a small, dependency-free renderer covering headings, bold/italic, inline code, fenced code blocks, links, images, lists, blockquotes, horizontal rules and paragraphs. All user input is HTML-escaped, so nothing you type can break the preview or inject markup.
- **Preview / Markdown toggle** — switch between the rendered view and the raw source at any time.
- **Copy** the raw Markdown or **Download** it as `README.md`.
- **Auto-persist** — your entire form is saved to `localStorage` and restored on return.
- **Dark & light themes**, fully responsive, accessible, and keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/web-utility-suite.git
cd web-utility-suite/readme-generator
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Enter your **project name** and a one-line **tagline**.
2. Toggle the **badges** you want (License, Build Status, Version, Language) — pick a license and edit the version/language text as needed.
3. Add an **install command** and a **usage example** (choose the fence language).
4. Click **Add feature** to build a repeatable feature list; remove any row with its trash icon.
5. Toggle **Contributing** and **License** sections on if you want the standard boilerplate.
6. Switch between **Preview** and **Markdown** to check your work, then **Copy** the Markdown or **Download** `README.md`.

## Keyboard Shortcuts

| Action                | Shortcut                       |
| --------------------- | ------------------------------ |
| Copy Markdown          | <kbd>Ctrl/⌘</kbd> + <kbd>C</kbd> |
| Download `README.md`  | <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> |
| Show shortcuts help   | <kbd>?</kbd>                    |
| Close dialog           | <kbd>Esc</kbd>                  |

## Screenshots

> _Screenshots coming soon._

## Roadmap

- [ ] Table of Contents auto-generation from headings
- [ ] Additional sections: Tech Stack, Roadmap, FAQ, Acknowledgments
- [ ] Import an existing `README.md` to edit it in the form
- [ ] Multiple starter templates (library, CLI tool, web app)
- [ ] Drag-to-reorder sections

## License

MIT Licensed. Part of the [Web Utility Suite](../index.html).
