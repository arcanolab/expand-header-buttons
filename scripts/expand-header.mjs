/**
 * Expand Header Buttons v6.1 — Foundry VTT v13
 *
 * Creates a vertical sidebar on the left side of sheets with buttons
 * normally hidden in the three-dot overflow menu.
 *
 * Features:
 *  - Deduplicates dropdown items, picks the last (functional) one
 *  - Disabled buttons return to the three-dot menu instead of vanishing
 *  - GM-only mode
 *  - Per-button toggle via settings
 */

const MODULE_ID = "expand-header-buttons";
const SIDEBAR_CLASS = "ehb-sidebar";
const SKIP_ACTIONS = new Set(["close", "toggleControls"]);

const debounceTimers = new Map();

// ——————————————————————————————————————————
// Settings
// ——————————————————————————————————————————

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing v6.1`);

  game.settings.register(MODULE_ID, "gmOnly", {
    name: "GM Only",
    hint: "If enabled, the sidebar only appears for the GM. Players will see the default three-dot menu.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register(MODULE_ID, "disabledButtons", {
    name: "Disabled Buttons",
    hint: "Buttons that remain in the default menu.",
    scope: "world",
    config: false,
    type: String,
    default: "[]",
  });

  game.settings.registerMenu(MODULE_ID, "buttonConfig", {
    name: "Configure Buttons",
    label: "Choose which buttons to show",
    hint: "Toggle individually which buttons appear in the sidebar. A sheet must be open for buttons to be detected.",
    icon: "fas fa-bars",
    type: EHBConfigApp,
    restricted: true,
  });
});

// ——————————————————————————————————————————
// Render Hooks
// ——————————————————————————————————————————

for (const hook of [
  "renderApplicationV2",
  "renderDocumentSheetV2",
  "renderActorSheet",
  "renderItemSheet",
  "renderApplication",
]) {
  Hooks.on(hook, (app) => scheduleBuild(app));
}

// ——————————————————————————————————————————
// Minimize — MutationObserver
// ——————————————————————————————————————————

Hooks.once("ready", () => {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName !== "class") continue;
      const el = m.target;
      const sidebar = el.querySelector?.(`.${SIDEBAR_CLASS}`);
      if (sidebar) {
        sidebar.style.display = el.classList.contains("minimized") ? "none" : "";
      }
    }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
});

// ——————————————————————————————————————————
// Debounce
// ——————————————————————————————————————————

function scheduleBuild(app) {
  if (!app?.hasFrame || !app?.window?.header) return;
  const key = app.id;
  if (debounceTimers.has(key)) clearTimeout(debounceTimers.get(key));
  debounceTimers.set(key, setTimeout(() => {
    debounceTimers.delete(key);
    try { buildSidebar(app); }
    catch (err) { console.warn(`${MODULE_ID} |`, err); }
  }, 400));
}

// ——————————————————————————————————————————
// Build Sidebar
// ——————————————————————————————————————————

function buildSidebar(app) {
  const appEl = app.element;
  if (!appEl) return;

  if (game.settings.get(MODULE_ID, "gmOnly") && !game.user.isGM) return;

  const dropdown = app.window?.controlsDropdown;
  if (!dropdown) return;

  let disabledKeys = new Set();
  try {
    disabledKeys = new Set(JSON.parse(game.settings.get(MODULE_ID, "disabledButtons")));
  } catch (e) { /* */ }

  const buttons = extractUniqueButtons(dropdown);
  if (buttons.length === 0) return;

  // Remove previous sidebar
  appEl.querySelectorAll(`.${SIDEBAR_CLASS}`).forEach(s => s.remove());

  // Restore visibility of all dropdown items before reprocessing
  dropdown.querySelectorAll("li, button").forEach(el => {
    el.classList.remove("ehb-hidden-in-dropdown");
  });

  const sidebar = document.createElement("div");
  sidebar.classList.add(SIDEBAR_CLASS);

  let sidebarCount = 0;
  let disabledCount = 0;

  for (const info of buttons) {
    if (disabledKeys.has(info.key)) {
      disabledCount++;
      continue;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("ehb-sidebar-btn");
    btn.dataset.tooltip = info.label;
    btn.dataset.tooltipDirection = "LEFT";
    btn.setAttribute("aria-label", info.label);
    btn.appendChild(info.iconEl.cloneNode(true));

    const clickTarget = info.originalEl;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      clickTarget.click();
    });

    sidebar.appendChild(btn);
    sidebarCount++;

    // Hide all duplicates of this button from the dropdown
    for (const dupEl of info.allElements) {
      dupEl.classList.add("ehb-hidden-in-dropdown");
    }
  }

  if (sidebarCount === 0) return;

  if (appEl.classList.contains("minimized")) {
    sidebar.style.display = "none";
  }

  appEl.appendChild(sidebar);

  // Three-dot button visibility:
  // If ALL buttons are in the sidebar → hide three-dot menu
  // If some remain in the dropdown → keep three-dot menu visible
  if (app.window.controls) {
    app.window.controls.style.display = disabledCount > 0 ? "" : "none";
  }

  console.debug(`${MODULE_ID} | Sidebar: ${sidebarCount} | Menu: ${disabledCount} | "${app.title}"`);
}

// ——————————————————————————————————————————
// Extract unique buttons — keeps the LAST duplicate (the functional one)
// ——————————————————————————————————————————

function extractUniqueButtons(dropdown) {
  const items = dropdown.querySelectorAll("li, button");
  const grouped = new Map();

  for (const item of items) {
    const action = item.dataset?.action || "";
    if (SKIP_ACTIONS.has(action)) continue;

    const iconEl = item.querySelector("i, svg");
    if (!iconEl) continue;

    const iconClass = iconEl.className?.trim() || "";
    const key = iconClass || action || item.textContent?.trim() || "";
    if (!key) continue;

    const label = getLabel(item);

    if (grouped.has(key)) {
      const existing = grouped.get(key);
      existing.originalEl = item;
      existing.iconEl = iconEl;
      existing.label = label || existing.label;
      existing.allElements.push(item);
    } else {
      grouped.set(key, {
        key,
        action,
        label,
        iconEl,
        originalEl: item,
        allElements: [item],
      });
    }
  }

  return Array.from(grouped.values());
}

// ——————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————

function getLabel(item) {
  const span = item.querySelector("span");
  if (span) return localizeLabel(span.textContent.trim());
  const clone = item.cloneNode(true);
  clone.querySelectorAll("i, svg").forEach(i => i.remove());
  return localizeLabel(clone.textContent.trim() || item.dataset?.tooltip || item.dataset?.action || "");
}

function localizeLabel(label) {
  if (!label) return "";
  try {
    const loc = game?.i18n?.localize(label);
    if (loc && loc !== label) return loc;
  } catch (e) { /* */ }
  return label;
}

// ——————————————————————————————————————————
// Discover all buttons for config (searches DOM directly)
// ——————————————————————————————————————————

function discoverAllButtons() {
  const allDropdowns = document.querySelectorAll(".controls-dropdown");
  const grouped = new Map();

  for (const dropdown of allDropdowns) {
    const items = dropdown.querySelectorAll("li, button");
    for (const item of items) {
      const action = item.dataset?.action || "";
      if (SKIP_ACTIONS.has(action)) continue;

      const iconEl = item.querySelector("i, svg");
      if (!iconEl) continue;

      const iconClass = iconEl.className?.trim() || "";
      const key = iconClass || action || item.textContent?.trim() || "";
      if (!key || grouped.has(key)) continue;

      grouped.set(key, {
        key,
        action,
        label: getLabel(item),
        iconClass,
      });
    }
  }

  console.log(`${MODULE_ID} | Config: found ${grouped.size} buttons in ${allDropdowns.length} dropdowns`);
  return Array.from(grouped.values());
}

// ——————————————————————————————————————————
// Config App
// ——————————————————————————————————————————

class EHBConfigApp extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ehb-config",
      title: "Expand Header Buttons — Configure",
      width: 480,
      height: "auto",
      closeOnSubmit: true,
    });
  }

  get template() {
    return `modules/${MODULE_ID}/templates/config.html`;
  }

  getData() {
    const allButtons = discoverAllButtons();
    let disabledKeys = new Set();
    try {
      disabledKeys = new Set(JSON.parse(game.settings.get(MODULE_ID, "disabledButtons")));
    } catch (e) { /* */ }

    return {
      buttons: allButtons.map(b => ({
        ...b,
        enabled: !disabledKeys.has(b.key),
        safeKey: encodeKey(b.key),
      })),
    };
  }

  async _updateObject(event, formData) {
    const allButtons = discoverAllButtons();
    const disabled = [];

    for (const b of allButtons) {
      const fieldName = `btn-${encodeKey(b.key)}`;
      if (!formData[fieldName]) {
        disabled.push(b.key);
      }
    }

    await game.settings.set(MODULE_ID, "disabledButtons", JSON.stringify(disabled));
    ui.notifications.info("Expand Header Buttons: Settings saved! Re-open sheets to apply.");
  }
}

function encodeKey(key) {
  return btoa(unescape(encodeURIComponent(key))).replace(/[=+/]/g, "_");
}
