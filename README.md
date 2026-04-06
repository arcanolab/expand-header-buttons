[README.md](https://github.com/user-attachments/files/26493249/README.md)
# Expand Header Buttons

![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v13-informational)
![Version](https://img.shields.io/badge/version-1.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A Foundry VTT v13 module that creates a vertical sidebar on the left side of sheets, exposing buttons normally hidden in the three-dot overflow menu as always-visible, clickable icons.

![Preview]
expanded buttons on the side
(<img width="394" height="463" alt="preview01" src="https://github.com/user-attachments/assets/e541ac5f-b55d-43b7-908c-a325ab9c60dd" />)
settings
(<img width="394" height="463" alt="preview02" src="https://github.com/user-attachments/assets/71d8a9e2-c8ae-48d3-aea7-5aea29edb2c6" />)
choosing which buttons appear next to
(<img width="394" height="463" alt="preview03" src="https://github.com/user-attachments/assets/1f3b5097-107c-4214-8ebc-51c067dfe516" />)

## Features

- **Vertical sidebar** — All header controls displayed as icons on the left side of every sheet
- **Per-button toggle** — Choose which buttons go to the sidebar and which stay in the three-dot menu
- **GM-only mode** — Optionally restrict the sidebar to the Game Master only
- **Minimize-aware** — Sidebar hides automatically when a sheet is minimized
- **Full module support** — Works with buttons added by other modules (Theatre Inserts, etc.)
- **No duplicates** — Intelligent deduplication of dropdown items
- **Lightweight** — No dependencies, no libraries, pure vanilla JS + CSS

## Installation

### Foundry Module Browser
1. Open Foundry VTT and go to **Add-on Modules**
2. Click **Install Module**
3. Search for **"Expand Header Buttons"**
4. Click **Install**

### Manifest URL
1. Open Foundry VTT and go to **Add-on Modules**
2. Click **Install Module**
3. Paste this URL in the **Manifest URL** field at the bottom:
```
https://github.com/arcanolab/expand-header-buttons/releases/latest/download/module.json
```
4. Click **Install**

## Configuration

After activating the module, go to **Settings → Module Settings → Expand Header Buttons**:

- **GM Only** — If enabled, only the GM sees the sidebar. Players see the default three-dot menu.
- **Configure Buttons** — Opens a window where you can toggle each button individually. Checked buttons appear in the sidebar; unchecked buttons remain in the three-dot menu.

> **Note:** A character sheet must be open for the button list to populate in the configuration window.

## Compatibility

| | Version |
|---|---|
| **Foundry VTT** | v13 (verified on build 348) |
| **Systems** | Any system using ApplicationV2 sheets (D&D 5e, Pathfinder 2e, etc.) |
| **Modules** | Compatible with modules that add header controls (Theatre Inserts, etc.) |

## Support

Found a bug or have a suggestion? Open an issue on [GitHub](https://github.com/arcanolab/expand-header-buttons/issues).

## License

This module is released under the [MIT License](LICENSE).
