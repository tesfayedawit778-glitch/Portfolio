/* =====================================================================
   Dawit Tesfaye — multi-OS portfolio (macOS · Windows · Linux)
   Vanilla JS: OS picker, window manager, desktop, dock/taskbar, apps.
   Content comes from data.js (window.PORTFOLIO).
   ===================================================================== */
(() => {
  "use strict";

  const D = window.PORTFOLIO;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------ helpers */

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
    del(key) {
      try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
    },
  };
  const session = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, v) { try { sessionStorage.setItem(key, v); } catch { /* ignore */ } },
    del(key) { try { sessionStorage.removeItem(key); } catch { /* ignore */ } },
  };

  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
  const isCoarse = () => window.matchMedia("(pointer: coarse)").matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const svgUrl = (svg) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  /* ------------------------------------------------------------------ operating system */

  let OS = null; // "mac" | "win" | "linux"
  const OS_META = {
    mac: { name: "macOS", sub: "Menu bar, Dock, Finder & Spotlight" },
    win: { name: "Windows", sub: "Start menu, taskbar & File Explorer" },
    linux: { name: "Linux", sub: "Ubuntu-style GNOME desktop" },
  };
  /** Pick the value for the current OS from { mac, win, linux }. */
  const pick = (o) => (o[OS] !== undefined ? o[OS] : o.mac);

  /* ------------------------------------------------------------------ icons */

  const P = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    folder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9l2 2.5h7.5A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    cube: '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    pen: '<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="m14 7 3 3"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3.3 15a1.6 1.6 0 0 1 2.6-1.8L8 15"/>',
    devices: '<rect x="2" y="4" width="15" height="11" rx="1.5"/><path d="M6 19h7"/><rect x="16" y="9" width="6" height="11" rx="1.5"/>',
    play: '<path d="M7 5v14l11-7z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 15 5-5 4 4 3-3 6 6"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    note: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    power: '<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    chevup: '<path d="m6 15 6-6 6 6"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    sort: '<path d="M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3"/>',
    view: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
    chevdown: '<path d="m6 9 6 6 6-6"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;

  const TRAY_SVG =
    '<svg viewBox="0 0 20 15" width="16" height="13" aria-hidden="true"><path fill="currentColor" d="M10 2.3c3 0 5.8 1.2 7.8 3.2l1.4-1.5C16.8 1.6 13.5.2 10 .2S3.2 1.6.8 4l1.4 1.5c2-2 4.8-3.2 7.8-3.2zm0 4.2c1.9 0 3.6.7 4.9 2l1.4-1.5C14.6 5.3 12.4 4.4 10 4.4S5.4 5.3 3.7 7l1.4 1.5c1.3-1.3 3-2 4.9-2zm0 4.2c.8 0 1.5.3 2 .8L10 13.7l-2-2.2c.5-.5 1.2-.8 2-.8z"/></svg>' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>' +
    '<svg viewBox="0 0 28 14" width="22" height="11" aria-hidden="true"><rect x="0.5" y="0.5" width="23" height="13" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2.5" y="2.5" width="19" height="9" rx="2" fill="currentColor"/><path d="M25.5 5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="currentColor" opacity=".5"/></svg>';

  const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';
  const ICONS = {
    mac: {
      finder: svgUrl(`<svg ${XMLNS} viewBox="0 0 100 100"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76cdff"/><stop offset="1" stop-color="#1683ea"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f6fc"/><stop offset="1" stop-color="#c9d8ea"/></linearGradient></defs><rect width="100" height="100" fill="url(#b)"/><path d="M0 0h55c-6 18-9 34-8 52h-9c0 18 3 34 9 48H0z" fill="url(#a)"/><rect x="29" y="27" width="5.5" height="15" rx="2.7" fill="#0d2a47"/><rect x="65" y="27" width="5.5" height="15" rx="2.7" fill="#0d2a47"/><path d="M23 66c17 11 37 11 54 0" stroke="#0d2a47" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>`),
      notes: "assets/img/notes.png",
      photos: svgUrl(`<svg ${XMLNS} viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><g transform="translate(50 50)">${["#f9b52c", "#fb7a3c", "#ee4d78", "#b45bd1", "#5d6fe0", "#2fb7ef", "#4fc66d", "#c9da3a"].map((c, i) => `<ellipse rx="11" ry="20" cy="-17" fill="${c}" opacity=".82" transform="rotate(${i * 45})"/>`).join("")}</g></svg>`),
      mail: "assets/img/dock-mail.webp",
      terminal: svgUrl(`<svg ${XMLNS} viewBox="0 0 100 100"><rect width="100" height="100" fill="#d9d9de"/><rect x="6" y="8" width="88" height="84" rx="12" fill="#1c1c1e"/><path d="M22 36l14 11-14 11" stroke="#f2f2f2" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 61h22" stroke="#f2f2f2" stroke-width="5.5" stroke-linecap="round"/></svg>`),
      settings: svgUrl(`<svg ${XMLNS} viewBox="0 0 100 100"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9bcc4"/><stop offset="1" stop-color="#7b7f88"/></linearGradient></defs><rect width="100" height="100" fill="url(#a)"/><circle cx="50" cy="50" r="31" fill="none" stroke="#3f4249" stroke-width="10" stroke-dasharray="7 5.2"/><circle cx="50" cy="50" r="24" fill="#d9dbe0"/><circle cx="50" cy="50" r="9" fill="#5b5f68"/><path d="M50 26v15M50 59v15M26 50h15M59 50h15" stroke="#5b5f68" stroke-width="4"/></svg>`),
      trash: svgUrl(`<svg ${XMLNS} viewBox="0 0 100 100"><path d="M22 26h56l-5 64a5 5 0 0 1-5 4.5H32a5 5 0 0 1-5-4.5z" fill="rgba(235,238,245,.8)" stroke="rgba(255,255,255,.95)" stroke-width="2"/><path d="M38 36v48M50 36v48M62 36v48" stroke="rgba(120,125,140,.6)" stroke-width="3" stroke-linecap="round"/><rect x="16" y="18" width="68" height="10" rx="5" fill="rgba(245,246,250,.95)"/></svg>`),
      folder: "assets/img/folder.png",
    },
    win: {
      start: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ccfff"/><stop offset="1" stop-color="#0067c0"/></linearGradient></defs><rect x="6" y="6" width="17" height="17" rx="2" fill="url(#a)"/><rect x="25" y="6" width="17" height="17" rx="2" fill="url(#a)"/><rect x="6" y="25" width="17" height="17" rx="2" fill="url(#a)"/><rect x="25" y="25" width="17" height="17" rx="2" fill="url(#a)"/></svg>`),
      finder: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><path d="M4 12a4 4 0 0 1 4-4h11l4 4h17a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#e9a91c"/><rect x="4" y="16" width="40" height="24" rx="4" fill="#ffd04f"/><rect x="4" y="22" width="40" height="5" fill="#2b7de9"/></svg>`),
      notes: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="9" y="4" width="30" height="40" rx="4" fill="#f4f8fc" stroke="#9fb7d0" stroke-width="1.5"/><path d="M13 4h22a4 4 0 0 1 4 4v5H9V8a4 4 0 0 1 4-4z" fill="#2f7fd8"/><path d="M15 20h18M15 26h18M15 32h12" stroke="#7d93ab" stroke-width="2" stroke-linecap="round"/></svg>`),
      photos: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb7ff"/><stop offset="1" stop-color="#1b6fd1"/></linearGradient></defs><rect x="4" y="7" width="40" height="34" rx="6" fill="url(#a)"/><circle cx="33" cy="16" r="4" fill="#ffe27a"/><path d="M4 34l12-12 9 9 6-5 13 11a6 6 0 0 1-6 4H10a6 6 0 0 1-6-6z" fill="#e8f4ff"/></svg>`),
      mail: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ba2ff"/><stop offset="1" stop-color="#0a5fc4"/></linearGradient></defs><rect x="4" y="9" width="40" height="30" rx="5" fill="url(#a)"/><path d="M6 13l18 13 18-13" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`),
      terminal: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="4" y="7" width="40" height="34" rx="5" fill="#1f1f1f" stroke="#5a5a5a"/><path d="M9 7h30a5 5 0 0 1 5 5v2H4v-2a5 5 0 0 1 5-5z" fill="#3a3a3a"/><path d="M12 22l7 5-7 5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 33h11" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`),
      settings: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6b5"/><stop offset="1" stop-color="#5d6877"/></linearGradient></defs><circle cx="24" cy="24" r="15" fill="none" stroke="url(#a)" stroke-width="7" stroke-dasharray="5.6 4.2"/><circle cx="24" cy="24" r="13" fill="url(#a)"/><circle cx="24" cy="24" r="5" fill="#e9eef4"/></svg>`),
      trash: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><path d="M11 13h26l-2.5 29a3 3 0 0 1-3 2.7h-15a3 3 0 0 1-3-2.7z" fill="rgba(220,235,250,.85)" stroke="#7fa6c9" stroke-width="1.5"/><rect x="8" y="8" width="32" height="5" rx="2" fill="#a9c6e2"/><path d="M18.5 36l3-5M29.5 36l-3-5M21 26.5l3-4 3 4M18.5 36h11" stroke="#2b8a3e" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
      folder: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><path d="M3 11a4 4 0 0 1 4-4h11l4 4h19a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#e3a21a"/><rect x="3" y="15" width="42" height="26" rx="4" fill="#ffcf4a"/></svg>`),
    },
    linux: {
      finder: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="9" fill="#f2f2f2"/><path d="M10 15a3 3 0 0 1 3-3h8l3 3h11a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#e95420"/><rect x="10" y="19" width="28" height="17" rx="3" fill="#f6844f"/></svg>`),
      notes: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="8" y="4" width="32" height="40" rx="5" fill="#fafafa" stroke="#cfcfcf"/><path d="M14 14h20M14 20h20M14 26h14" stroke="#9a9a9a" stroke-width="2.2" stroke-linecap="round"/><path d="M26 38l2-6 11-11 4 4-11 11z" fill="#e95420"/></svg>`),
      photos: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="36" rx="6" fill="#3d3846"/><rect x="8" y="10" width="32" height="28" rx="3" fill="#8ff0a4"/><path d="M8 32l9-9 7 7 5-4 11 9a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="#26a269"/><circle cx="31" cy="17" r="3.5" fill="#f6d32d"/></svg>`),
      mail: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="4" y="9" width="40" height="30" rx="5" fill="#f6f5f4" stroke="#c0bfbc"/><path d="M6 12l18 14 18-14" fill="none" stroke="#e95420" stroke-width="3" stroke-linejoin="round"/></svg>`),
      terminal: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="36" rx="7" fill="#300a24" stroke="#5e2750" stroke-width="1.5"/><path d="M12 18l7 6-7 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 31h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`),
      settings: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="none" stroke="#77767b" stroke-width="7" stroke-dasharray="6 4.4"/><circle cx="24" cy="24" r="14" fill="#9a9996"/><circle cx="24" cy="24" r="5.5" fill="#deddda"/></svg>`),
      trash: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><path d="M11 13h26l-2 29a3 3 0 0 1-3 2.8H16a3 3 0 0 1-3-2.8z" fill="#deddda" stroke="#9a9996" stroke-width="1.5"/><rect x="8" y="8" width="32" height="6" rx="2" fill="#c0bfbc"/><path d="M19 20v18M24 20v18M29 20v18" stroke="#9a9996" stroke-width="2" stroke-linecap="round"/></svg>`),
      folder: svgUrl(`<svg ${XMLNS} viewBox="0 0 48 48"><path d="M4 12a3 3 0 0 1 3-3h12l4 4h18a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#c4622f"/><rect x="4" y="17" width="40" height="24" rx="3" fill="#ea8556"/></svg>`),
    },
  };

  const OS_LOGO = {
    mac: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6M9 9v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h2.5a2.5 2.5 0 1 1-2.5 2.5V15zm0 0H9m0 0v2.5A2.5 2.5 0 1 1 6.5 15H9z"/></svg>',
    win: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8.4" height="8.4" rx="1" fill="currentColor"/><rect x="12.6" y="3" width="8.4" height="8.4" rx="1" fill="currentColor"/><rect x="3" y="12.6" width="8.4" height="8.4" rx="1" fill="currentColor"/><rect x="12.6" y="12.6" width="8.4" height="8.4" rx="1" fill="currentColor"/></svg>',
    linux: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="19" cy="12" r="2.9" fill="currentColor"/><circle cx="8.5" cy="5.9" r="2.9" fill="currentColor"/><circle cx="8.5" cy="18.1" r="2.9" fill="currentColor"/></svg>',
  };
  const MONOGRAM = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 8h17c14.4 0 24 9.6 24 24S45.4 56 31 56H14V8zm10 9v30h7c8.6 0 14-5.9 14-15s-5.4-15-14-15h-7z" fill="currentColor"/></svg>';

  /* ------------------------------------------------------------------ apps registry */

  const APPS = {
    finder: { name: { mac: "Finder", win: "File Explorer", linux: "Files" }, open: () => openFinder("works") },
    notes: { name: { mac: "Notes", win: "Notepad", linux: "Text Editor" }, open: () => openNotes("about") },
    photos: { name: { mac: "Photos", win: "Photos", linux: "Image Viewer" }, open: () => openPhotos(0) },
    mail: { name: { mac: "Mail", win: "Mail", linux: "Mail" }, open: () => openMail() },
    terminal: { name: { mac: "Terminal", win: "Terminal", linux: "Terminal" }, open: () => openTerminal() },
    settings: { name: { mac: "System Settings", win: "Settings", linux: "Settings" }, open: () => openSettings() },
    trash: { name: { mac: "Trash", win: "Recycle Bin", linux: "Trash" }, open: () => openTrash() },
  };
  const PINNED = ["finder", "notes", "photos", "mail", "terminal", "settings"];
  const LINKS = [
    { name: "Figma", img: "assets/img/dock-figma.jpg", href: D.links.figma },
    { name: "X", img: "assets/img/dock-x.webp", href: D.links.x },
    { name: "LinkedIn", img: "assets/img/dock-linkedin.webp", href: D.links.linkedin },
    { name: "Telegram", img: "assets/img/dock-telegram.jpg", href: D.links.telegram },
  ];
  const appName = (id) => (APPS[id] ? pick(APPS[id].name) : id);
  const appIcon = (id) => ICONS[OS || "mac"][id] || ICONS.mac[id];
  function iconFor(app, explicit) {
    if (explicit) return explicit;
    if (APPS[app]) return appIcon(app);
    if (app === "preview") return appIcon("photos");
    return D.owner.photo;
  }

  /* ------------------------------------------------------------------ theme + wallpaper */

  function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === "light" || mode === "dark") root.dataset.theme = mode;
    else delete root.dataset.theme;
    store.set("dt-theme", mode || "auto");
    refreshOpen("settings");
    renderCC();
  }
  const currentTheme = () => store.get("dt-theme", "auto");
  const effectiveDark = () => {
    const t = currentTheme();
    return t === "dark" || (t === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  };
  function toggleDark() { applyTheme(effectiveDark() ? "light" : "dark"); }

  const wallKey = () => "dt-wall-" + (OS || "mac");
  const currentWall = () => {
    const id = store.get(wallKey(), D.defaultWallpaper[OS || "mac"]);
    return D.wallpapers.some((w) => w.id === id) ? id : D.defaultWallpaper[OS || "mac"];
  };
  const wallCss = (wp) => (wp.src ? `url("${wp.src}")` : wp.gradient);

  function applyWallpaper(id, animate = true) {
    const wp = D.wallpapers.find((w) => w.id === id) || D.wallpapers[0];
    const el = $("#wallpaper");
    const set = () => {
      el.style.backgroundImage = wallCss(wp);
      el.classList.remove("fade");
    };
    if (animate) {
      el.classList.add("fade");
      if (wp.src) {
        const img = new Image();
        img.onload = img.onerror = () => setTimeout(set, 200);
        img.src = wp.src;
      } else setTimeout(set, 250);
    } else set();
    store.set(wallKey(), wp.id);
    refreshOpen("settings");
  }

  /* ------------------------------------------------------------------ clock */

  function tickClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
    set("#mb-date", now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", ""));
    set("#mb-time", time);
    set("#tb-time", time);
    set("#tb-date", now.toLocaleDateString("en-GB"));
    set("#tp-clock", `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}  ${time}`);
  }

  /* ------------------------------------------------------------------ notifications */

  function notify({ title, body, img = D.owner.photo, timeout = 6500 }) {
    const n = h("div", { class: "notif", role: "status" }, [
      h("button", { class: "n-close", "aria-label": "Dismiss", html: '<svg viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6"/></svg>', onclick: () => dismiss() }),
      h("img", { src: img, alt: "" }),
      h("div", {}, [h("b", { text: title }), h("p", { html: body })]),
      h("span", { class: "n-time", text: "now" }),
    ]);
    const dismiss = () => {
      if (!n.isConnected) return;
      n.classList.add("out");
      n.addEventListener("animationend", () => n.remove(), { once: true });
      setTimeout(() => n.remove(), 500);
    };
    $("#notifications").append(n);
    if (timeout) setTimeout(dismiss, timeout);
    return n;
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      notify({ title: "Copied", body: `${esc(label)} copied to clipboard.`, timeout: 2500 });
    } catch {
      notify({ title: label, body: esc(text), timeout: 5000 });
    }
  }

  /* ==================================================================
     Window manager
     ================================================================== */

  const WM = { wins: new Map(), z: 100, active: null, cascade: 0 };

  const GLYPHS = {
    close: '<svg viewBox="0 0 8 8"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    min: '<svg viewBox="0 0 8 8"><path d="M1.2 4h5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    max: '<svg viewBox="0 0 8 8"><path d="M1.5 4.6V6.5h1.9zM6.5 3.4V1.5H4.6z" fill="currentColor" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/></svg>',
    wmin: '<svg viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" stroke-width="1"/></svg>',
    wmax: '<svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor"/></svg>',
    wclose: '<svg viewBox="0 0 10 10"><path d="M.5.5l9 9M9.5.5l-9 9" stroke="currentColor" stroke-width="1"/></svg>',
    lmin: '<svg viewBox="0 0 10 10"><path d="M2 7h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    lmax: '<svg viewBox="0 0 10 10"><rect x="2.2" y="2.2" width="5.6" height="5.6" rx=".8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    lclose: '<svg viewBox="0 0 10 10"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };

  function topInset() {
    if (OS === "win") return 0;
    if (OS === "linux") return 32;
    return $("#menubar").offsetHeight;
  }

  function desktopArea() {
    const W = window.innerWidth, H = window.innerHeight;
    if (isMobile()) return { left: 0, top: topInset(), width: W, height: H - topInset() };
    if (OS === "win") return { left: 0, top: 0, width: W, height: H - 48 };
    if (OS === "linux") return { left: 64, top: 32, width: W - 64, height: H - 32 };
    const top = topInset();
    const dock = $("#dock").getBoundingClientRect();
    return { left: 0, top, width: W, height: Math.max(dock.top - 8, top + 200) - top };
  }

  function buildTitlebar(opts, win) {
    const titleEl = h("div", { class: "tb-title", text: opts.title });
    const tb = h("header", { class: `titlebar ${opts.titleStyle || ""}`, "data-drag": "" });
    const act = (fn) => (e) => { e.stopPropagation(); fn(win); };

    if (OS === "mac") {
      tb.append(h("div", { class: "lights" }, [
        h("button", { class: "light close", "aria-label": "Close", html: GLYPHS.close, onclick: act(closeWindow) }),
        h("button", { class: "light min", "aria-label": "Minimize", html: GLYPHS.min, disabled: opts.noMinimize, onclick: act(minimizeWindow) }),
        h("button", { class: "light max", "aria-label": "Zoom", html: GLYPHS.max, disabled: opts.noResize, onclick: act(toggleMaximize) }),
      ]), titleEl);
      if (opts.toolbar) tb.append(opts.toolbar);
    } else if (OS === "win") {
      if (opts.app === "finder" || opts.app === "notes") {
        // Windows 11 tabbed title bar (File Explorer, Notepad).
        const tab = h("div", { class: "win-tab active" }, [h("img", { class: "tb-appicon", src: iconFor(opts.app, opts.icon), alt: "" }), titleEl]);
        win.tabsEl = h("div", { class: "win-tabs", role: "tablist" }, [tab, h("button", { class: "win-tab-add", "aria-label": "New tab", disabled: true, html: icon("plus") })]);
        tb.classList.add("has-tabs");
        tb.append(win.tabsEl);
      } else {
        tb.append(h("img", { class: "tb-appicon", src: iconFor(opts.app, opts.icon), alt: "" }), titleEl);
      }
      if (opts.toolbar) tb.append(opts.toolbar);
      tb.append(h("div", { class: "wctrls" }, [
        h("button", { class: "wc", "aria-label": "Minimize", html: GLYPHS.wmin, disabled: opts.noMinimize, onclick: act(minimizeWindow) }),
        h("button", { class: "wc", "aria-label": "Maximize", html: GLYPHS.wmax, disabled: opts.noResize, onclick: act(toggleMaximize) }),
        h("button", { class: "wc close", "aria-label": "Close", html: GLYPHS.wclose, onclick: act(closeWindow) }),
      ]));
    } else {
      tb.append(titleEl);
      if (opts.toolbar) tb.append(opts.toolbar);
      tb.append(h("div", { class: "lctrls" }, [
        opts.noMinimize ? null : h("button", { class: "lc", "aria-label": "Minimize", html: GLYPHS.lmin, onclick: act(minimizeWindow) }),
        opts.noResize ? null : h("button", { class: "lc", "aria-label": "Maximize", html: GLYPHS.lmax, onclick: act(toggleMaximize) }),
        h("button", { class: "lc close", "aria-label": "Close", html: GLYPHS.lclose, onclick: act(closeWindow) }),
      ]));
    }
    return { tb, titleEl };
  }

  function openWindow(opts) {
    const existing = WM.wins.get(opts.id);
    if (existing) {
      if (existing.minimized) restoreWindow(existing);
      focusWindow(existing);
      if (opts.onReopen) opts.onReopen(existing);
      return existing;
    }

    const area = desktopArea();
    const w = Math.min(opts.width || 760, area.width - 24);
    const hgt = Math.min(opts.height || 520, area.height - 16);
    const off = (WM.cascade++ % 6) * 26;
    const x = area.left + clamp(Math.round((area.width - w) / 2 + off - 60), 8, Math.max(8, area.width - w - 8));
    const y = clamp(Math.round(area.top + Math.max(10, (area.height - hgt) / 2 - 10) + off), area.top + 4, area.top + Math.max(4, area.height - hgt));
    const overlaySidebar = OS === "mac" && opts.sidebar;

    const el = h("section", {
      class: `window ${opts.className || ""} ${overlaySidebar ? "has-sidebar" : ""}`,
      role: "dialog",
      "aria-label": opts.title,
      "data-app": opts.app || "",
      style: { left: x + "px", top: y + "px", width: w + "px", height: hgt + "px", "--sbw": (opts.sidebar || 0) + "px" },
    });
    if (opts.minWidth) el.style.minWidth = opts.minWidth + "px";
    if (opts.minHeight) el.style.minHeight = opts.minHeight + "px";

    const win = {
      id: opts.id, el, app: opts.app || "finder", title: opts.title,
      icon: opts.icon, minimized: false, maximized: false, prevRect: null, dockEl: null, onClose: opts.onClose,
      setTitle(t) { this.title = t; this.titleEl.textContent = t; el.setAttribute("aria-label", t); syncTasks(); },
    };
    const { tb, titleEl } = buildTitlebar(opts, win);
    win.titleEl = titleEl;
    const body = h("div", { class: "win-body" });
    win.body = body;
    el.append(tb, body);

    if (!opts.noResize) {
      for (const dir of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) el.append(h("div", { class: `resizer ${dir}`, "data-dir": dir }));
    }

    WM.wins.set(opts.id, win);
    $("#windows").append(el);

    el.addEventListener("pointerdown", () => focusWindow(win), true);
    tb.addEventListener("dblclick", (e) => { if (!e.target.closest("button,input,a") && !opts.noResize) toggleMaximize(win); });
    bindDrag(win);
    if (!opts.noResize) bindResize(win);

    opts.render?.(body, win);
    focusWindow(win);
    syncTasks();
    return win;
  }

  function focusWindow(win) {
    win.el.style.zIndex = ++WM.z;
    WM.active = win;
    for (const w of WM.wins.values()) w.el.classList.toggle("inactive", w !== win);
    if (win.id.startsWith("project-")) setHash("#/work/" + win.id.slice(8));
    syncTasks();
  }

  function topWindow() {
    let top = null;
    for (const w of WM.wins.values()) if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
    return top;
  }

  function closeWindow(win, instant = false) {
    if (!win || !WM.wins.has(win.id)) return;
    WM.wins.delete(win.id);
    win.dockEl?.remove();
    win.onClose?.();
    if (instant) win.el.remove();
    else {
      win.el.classList.add("closing");
      const done = () => win.el.remove();
      win.el.addEventListener("animationend", done, { once: true });
      setTimeout(done, 400);
    }
    if (WM.active === win) {
      WM.active = null;
      const next = topWindow();
      if (next) focusWindow(next);
    }
    if (win.id.startsWith("project-") && location.hash.includes(win.id.slice(8))) setHash("");
    syncTasks();
  }

  function closeAllWindows() {
    for (const w of [...WM.wins.values()]) closeWindow(w, true);
    WM.cascade = 0;
  }

  function toggleMaximize(win) {
    const el = win.el;
    el.classList.add("animating");
    if (!win.maximized) {
      win.prevRect = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      const a = desktopArea();
      Object.assign(el.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
      el.classList.add("maximized");
    } else {
      Object.assign(el.style, win.prevRect);
      el.classList.remove("maximized");
    }
    win.maximized = !win.maximized;
    setTimeout(() => el.classList.remove("animating"), 350);
  }

  function taskElFor(win) {
    if (OS === "mac") return addMiniToDock(win);
    const root = OS === "win" ? $("#taskbar") : $("#ldock");
    return $(`[data-win="${CSS.escape(win.id)}"]`, root) || $(`[data-app="${win.app}"]`, root) || root;
  }

  function minimizeWindow(win) {
    if (isMobile()) return closeWindow(win);
    win.minimized = true;
    const target = taskElFor(win);
    const r = win.el.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const dx = t.left + t.width / 2 - (r.left + r.width / 2);
    const dy = t.top + t.height / 2 - (r.top + r.height / 2);
    const s = Math.max(Math.min(t.width, 60) / r.width, 0.05);
    win.el.classList.add("minimizing");
    win.el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    win.el.style.opacity = "0";
    setTimeout(() => {
      if (!win.minimized) return;
      win.el.style.visibility = "hidden";
      win.el.classList.remove("minimizing");
    }, 460);
    if (WM.active === win) {
      WM.active = null;
      const next = topWindow();
      if (next) focusWindow(next);
    }
    syncTasks();
  }

  function restoreWindow(win) {
    win.minimized = false;
    win.dockEl?.remove();
    win.dockEl = null;
    win.el.classList.remove("minimizing");
    win.el.style.visibility = "";
    win.el.classList.add("restoring");
    requestAnimationFrame(() => {
      win.el.style.transform = "";
      win.el.style.opacity = "";
    });
    setTimeout(() => win.el.classList.remove("restoring"), 420);
    focusWindow(win);
  }

  /** Taskbar / dock click on a window: restore, focus, or minimize it. */
  function toggleTask(win) {
    if (win.minimized) restoreWindow(win);
    else if (WM.active === win) minimizeWindow(win);
    else focusWindow(win);
  }

  function bindDrag(win) {
    const el = win.el;
    el.addEventListener("pointerdown", (e) => {
      const handle = e.target.closest("[data-drag]");
      if (!handle || !el.contains(handle) || e.button !== 0 || isMobile()) return;
      if (e.target.closest("button, input, textarea, a, select, .no-drag")) return;
      e.preventDefault();
      const start = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop };
      const top = desktopArea().top;
      let moved = false;
      const move = (ev) => {
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < 3) return;
        if (!moved && win.maximized) {
          // Restore under the cursor, like a real desktop.
          const ratio = (start.x - start.l) / el.offsetWidth;
          Object.assign(el.style, win.prevRect);
          el.classList.remove("maximized");
          win.maximized = false;
          start.l = start.x - el.offsetWidth * ratio;
        }
        moved = true;
        el.style.left = clamp(start.l + dx, -el.offsetWidth + 120, window.innerWidth - 120) + "px";
        el.style.top = clamp(start.t + dy, top, window.innerHeight - 60) + "px";
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  function bindResize(win) {
    const el = win.el;
    for (const r of $$(".resizer", el)) {
      r.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        focusWindow(win);
        const dir = r.dataset.dir;
        const s = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
        const minW = parseFloat(getComputedStyle(el).minWidth) || 340;
        const minH = parseFloat(getComputedStyle(el).minHeight) || 240;
        const top = desktopArea().top;
        win.maximized = false;
        el.classList.remove("maximized");
        const move = (ev) => {
          const dx = ev.clientX - s.x, dy = ev.clientY - s.y;
          if (dir.includes("e")) el.style.width = Math.max(minW, s.w + dx) + "px";
          if (dir.includes("s")) el.style.height = Math.max(minH, s.h + dy) + "px";
          if (dir.includes("w")) {
            const w = Math.max(minW, s.w - dx);
            el.style.width = w + "px";
            el.style.left = s.l + (s.w - w) + "px";
          }
          if (dir.includes("n")) {
            const hh = Math.max(minH, s.h - dy);
            const t = s.t + (s.h - hh);
            if (t >= top) { el.style.height = hh + "px"; el.style.top = t + "px"; }
          }
        };
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      });
    }
  }

  function refreshOpen(id) {
    const w = WM.wins.get(id);
    if (w && w.refresh) w.refresh();
  }

  window.addEventListener("resize", () => {
    if (!OS) return;
    for (const w of WM.wins.values()) {
      const el = w.el;
      if (w.maximized) {
        const a = desktopArea();
        Object.assign(el.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
        continue;
      }
      if (el.offsetWidth > window.innerWidth - 16) el.style.width = window.innerWidth - 16 + "px";
      if (el.offsetLeft > window.innerWidth - 120) el.style.left = Math.max(8, window.innerWidth - el.offsetWidth - 8) + "px";
      if (el.offsetTop > window.innerHeight - 80) el.style.top = desktopArea().top + 10 + "px";
    }
    layoutIcons();
  });

  /* ==================================================================
     Desktop icons
     ================================================================== */

  let DESKTOP_ITEMS = [];

  function buildDesktopItems() {
    const folder = appIcon("folder");
    const items = [];
    if (OS === "win") items.push({ id: "trash", label: "Recycle Bin", kind: "sys", img: appIcon("trash"), open: openTrash });
    items.push(
      { id: "about", label: "About", kind: "folder", img: folder, open: () => openFinder("about") },
      { id: "services", label: "Services", kind: "folder", img: folder, open: () => openFinder("services") },
      { id: "gallery", label: "Gallery", kind: "folder", img: folder, open: () => openFinder("gallery") },
      { id: "hello", label: OS === "win" ? "hello.txt" : "hello :)", kind: "note", img: appIcon("notes"), open: () => openNotes("about") },
      ...D.projects.map((p) => ({ id: p.slug, label: p.label, kind: "project", img: p.icon, x: p.x, y: p.y, open: () => openProject(p.slug) }))
    );
    if (OS === "linux") items.push({ id: "trash", label: "Trash", kind: "sys", img: appIcon("trash"), open: openTrash });
    return items;
  }

  let iconPos = store.get("dt-icons", {});
  let lastClick = { id: null, t: 0 };

  function defaultPos(item) {
    if (item.kind === "project") return { x: item.x, y: item.y };
    const desk = $("#desktop").getBoundingClientRect();
    const idx = ["about", "services", "gallery", "hello"].indexOf(item.id);
    return { x: ((desk.width - 78) / desk.width) * 100, y: ((70 + idx * 128) / desk.height) * 100 };
  }

  function renderIcons() {
    DESKTOP_ITEMS = buildDesktopItems();
    const wrap = $("#icons");
    wrap.innerHTML = "";
    for (const item of DESKTOP_ITEMS) {
      const el = h("div", {
        class: `dicon ${item.kind}`, tabindex: "0", role: "button", "aria-label": `Open ${item.label}`, "data-id": item.id,
      }, [
        h("div", { class: "dicon-img" }, h("img", { src: item.img, alt: "", draggable: "false" })),
        h("span", { class: "dicon-label", text: item.label }),
      ]);
      bindIcon(el, item);
      wrap.append(el);
    }
    layoutIcons();
  }

  function layoutIcons() {
    if (OS !== "mac" || isMobile()) return;
    for (const el of $$(".dicon")) {
      const item = DESKTOP_ITEMS.find((i) => i.id === el.dataset.id);
      const p = iconPos[item.id] || defaultPos(item);
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
    }
  }

  function selectIcons(els, additive = false) {
    if (!additive) $$(".dicon.selected").forEach((e) => e.classList.remove("selected"));
    els.forEach((e) => e.classList.add("selected"));
  }

  function bindIcon(el, item) {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.open(); }
    });
    el.addEventListener("click", () => { if (isMobile()) item.open(); });
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectIcons([el]);
      const menu = [{ label: "Open", action: item.open }];
      if (item.kind === "project") {
        menu.push({ label: pick({ mac: "Get Info", win: "Properties", linux: "Properties" }), action: item.open });
        menu.push("sep", { label: pick({ mac: "Copy Link", win: "Copy link", linux: "Copy Link" }), action: () => copyText(shareUrl("#/work/" + item.id), "Link") });
      }
      showMenu(menu, e.clientX, e.clientY);
    });
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || isMobile()) return;
      e.stopPropagation();
      closeMenus();
      closeLauncher();
      if (e.metaKey || e.ctrlKey || e.shiftKey) el.classList.toggle("selected");
      else if (!el.classList.contains("selected")) selectIcons([el]);
      const canDrag = OS === "mac";
      const desk = $("#desktop").getBoundingClientRect();
      const group = $$(".dicon.selected").map((g) => ({ el: g, x: parseFloat(g.style.left), y: parseFloat(g.style.top) }));
      const start = { x: e.clientX, y: e.clientY };
      let moved = false;
      el.setPointerCapture(e.pointerId);
      const move = (ev) => {
        if (!canDrag) return;
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        if (!moved) group.forEach((g) => g.el.classList.add("dragging"));
        moved = true;
        for (const g of group) {
          g.el.style.left = clamp(g.x + (dx / desk.width) * 100, 3, 97) + "%";
          g.el.style.top = clamp(g.y + (dy / desk.height) * 100, 5, 88) + "%";
        }
      };
      const up = (ev) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        if (moved) {
          for (const g of group) {
            g.el.classList.remove("dragging");
            iconPos[g.el.dataset.id] = { x: parseFloat(g.el.style.left), y: parseFloat(g.el.style.top) };
          }
          store.set("dt-icons", iconPos);
          return;
        }
        const now = Date.now();
        const isDouble = lastClick.id === item.id && now - lastClick.t < 450;
        lastClick = { id: item.id, t: now };
        if (isDouble || ev.pointerType === "touch") {
          lastClick = { id: null, t: 0 };
          el.animate([{ scale: 1 }, { scale: 0.9 }, { scale: 1 }], { duration: 220 });
          item.open();
        }
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    });
  }

  function cleanUpIcons() {
    iconPos = {};
    store.del("dt-icons");
    const els = $$(".dicon");
    els.forEach((e) => (e.style.transition = "left .4s cubic-bezier(.2,.9,.3,1), top .4s cubic-bezier(.2,.9,.3,1)"));
    layoutIcons();
    setTimeout(() => els.forEach((e) => (e.style.transition = "")), 450);
  }

  function refreshDesktop() {
    $("#icons").style.opacity = "0";
    setTimeout(() => { renderIcons(); $("#icons").style.opacity = ""; }, 150);
  }

  function desktopMenu() {
    const common = [
      { label: pick({ mac: "Change Wallpaper…", win: "Personalize", linux: "Change Background…" }), action: () => openSettings() },
      { label: effectiveDark() ? pick({ mac: "Use Light Appearance", win: "Light mode", linux: "Light Style" }) : pick({ mac: "Use Dark Appearance", win: "Dark mode", linux: "Dark Style" }), action: toggleDark },
    ];
    if (OS === "win") return [
      { label: "Refresh", action: refreshDesktop },
      "sep",
      { label: "Open in Terminal", action: openTerminal },
      { label: "Open File Explorer", action: () => openFinder("works") },
      "sep",
      ...common,
      { label: "Display settings", action: () => openSettings() },
      "sep",
      { label: "Switch operating system…", action: () => powerCycle() },
    ];
    if (OS === "linux") return [
      { label: "New Folder", disabled: true },
      "sep",
      { label: "Open in Terminal", action: openTerminal },
      { label: "Show Desktop in Files", action: () => openFinder("works") },
      "sep",
      ...common,
      { label: "Display Settings", action: () => openSettings() },
      "sep",
      { label: "Switch Operating System…", action: () => powerCycle() },
    ];
    return [
      { label: "New Folder", disabled: true },
      "sep",
      { label: "Get Info", action: openAboutMac },
      ...common,
      "sep",
      { label: "Clean Up", action: cleanUpIcons },
      { label: "Open Finder", action: () => openFinder("works") },
      "sep",
      { label: "Switch Operating System…", action: () => powerCycle() },
    ];
  }

  function bindDesktop() {
    const desk = $("#desktop");
    const rectEl = $("#selection-rect");
    desk.addEventListener("pointerdown", (e) => {
      if (e.target !== desk && e.target.id !== "icons") return;
      closeMenus();
      closeCC();
      closeLauncher();
      selectIcons([]);
      if (e.button !== 0 || isMobile()) return;
      const box = desk.getBoundingClientRect();
      const sx = e.clientX - box.left + desk.scrollLeft, sy = e.clientY - box.top;
      const icons = $$(".dicon").map((el) => ({ el, r: el.getBoundingClientRect() }));
      const move = (ev) => {
        const cx = ev.clientX - box.left, cy = ev.clientY - box.top;
        const l = Math.min(sx, cx), t = Math.min(sy, cy), w = Math.abs(cx - sx), hh = Math.abs(cy - sy);
        Object.assign(rectEl.style, { left: l + "px", top: t + "px", width: w + "px", height: hh + "px" });
        rectEl.hidden = w < 3 && hh < 3;
        const sel = { l: l + box.left, t: t + box.top, r: l + w + box.left, b: t + hh + box.top };
        for (const { el, r } of icons) {
          el.classList.toggle("selected", r.left < sel.r && r.right > sel.l && r.top < sel.b && r.bottom > sel.t);
        }
      };
      const up = () => {
        rectEl.hidden = true;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });

    desk.addEventListener("contextmenu", (e) => {
      if (e.target !== desk && e.target.id !== "icons") return;
      e.preventDefault();
      showMenu(desktopMenu(), e.clientX, e.clientY);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || document.activeElement !== document.body) return;
      $$(".dicon.selected").forEach((el) => DESKTOP_ITEMS.find((i) => i.id === el.dataset.id)?.open());
    });
  }

  /* ==================================================================
     Apps
     ================================================================== */

  /* ---------------- Finder / File Explorer / Files ---------------- */

  const PANES = {
    about: { label: "About", icon: "user" },
    services: { label: "Services", icon: "briefcase" },
    works: { label: "Selected Works", icon: "folder" },
    gallery: { label: "Gallery", icon: "photo" },
  };

  function openFinder(pane = "works") {
    if (OS === "win") return openExplorer(pane);
    const existing = WM.wins.get("finder");
    if (existing) {
      existing.navigate(pane);
      if (existing.minimized) restoreWindow(existing);
      focusWindow(existing);
      return;
    }
    const state = { pane, history: [pane], index: 0, view: store.get("dt-view", "grid"), query: "" };

    openWindow({
      id: "finder", title: PANES[pane].label, app: "finder", width: 1000, height: 640, sidebar: 210, minWidth: 560, minHeight: 380,
      render(body, win) {
        const sidebar = h("aside", { class: "sidebar" }, [
          h("div", { class: "sb-heading", text: pick({ mac: "Favourites", win: "Quick access", linux: "Places" }) }),
          ...Object.entries(PANES).map(([key, p]) =>
            h("button", { class: "sb-row", "data-pane": key, html: icon(p.icon) + `<span>${p.label}</span>`, onclick: () => win.navigate(key) })
          ),
          h("div", { class: "sb-contact" }, [
            h("div", { class: "sb-heading", text: "Let’s connect" }),
            h("a", { href: `mailto:${D.owner.email}`, text: D.owner.email }),
            h("a", { href: `tel:${D.owner.phone.replace(/\s/g, "")}`, text: D.owner.phone }),
          ]),
        ]);
        const back = h("button", { class: "tb-btn", "aria-label": "Back", html: icon("left"), onclick: () => go(-1) });
        const fwd = h("button", { class: "tb-btn", "aria-label": "Forward", html: icon("right"), onclick: () => go(1) });
        const upBtn = OS === "win" ? h("button", { class: "tb-btn", "aria-label": "Up", html: icon("up"), onclick: () => win.navigate("works") }) : null;
        const title = h("div", { class: "tb-title tb-path" });
        const viewSeg = h("div", { class: "tb-seg" }, [
          h("button", { class: "tb-btn", "data-view": "grid", "aria-label": "Icon view", html: icon("grid"), onclick: () => setView("grid") }),
          h("button", { class: "tb-btn", "data-view": "list", "aria-label": "List view", html: icon("list"), onclick: () => setView("list") }),
        ]);
        const search = h("input", {
          class: "tb-search", type: "search", placeholder: OS === "win" ? "Search Dawit Tesfaye" : "Search", "aria-label": "Search projects",
          oninput: (e) => { state.query = e.target.value; if (state.pane !== "works") win.navigate("works"); else draw(); },
        });
        const toolbar = h("div", { class: "titlebar finder-toolbar", "data-drag": "" }, [back, fwd, upBtn, title, h("div", { class: "tb-actions" }, [viewSeg, search])]);
        const content = h("div", { class: "finder-content" });
        const status = h("div", { class: "statusbar" });
        body.append(h("div", { class: "finder" }, [sidebar, h("div", { class: "finder-main" }, [toolbar, content, status])]));

        function setView(v) { state.view = v; store.set("dt-view", v); draw(); }
        function go(d) {
          const i = state.index + d;
          if (i < 0 || i >= state.history.length) return;
          state.index = i;
          state.pane = state.history[i];
          draw();
        }
        function draw() {
          const p = state.pane;
          win.setTitle(PANES[p].label);
          title.innerHTML = OS === "mac"
            ? esc(PANES[p].label)
            : OS === "win"
              ? `${icon("monitor")}<span>›</span><span>Dawit Tesfaye</span><span>›</span><b>${esc(PANES[p].label)}</b>`
              : `<span class="crumb">${icon("home")}Dawit</span><span>/</span><b>${esc(PANES[p].label)}</b>`;
          back.disabled = state.index === 0;
          fwd.disabled = state.index >= state.history.length - 1;
          viewSeg.style.display = p === "works" ? "" : "none";
          $$("[data-view]", viewSeg).forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
          $$(".sb-row", sidebar).forEach((r) => r.classList.toggle("active", r.dataset.pane === p));
          content.innerHTML = "";
          content.scrollTop = 0;
          const pane = h("div", { class: "pane" });
          ({ about: paneAbout, services: paneServices, works: paneWorks, gallery: paneGallery })[p](pane, state);
          content.append(pane);
          const count = { about: 1, services: D.services.length, works: D.projects.length, gallery: D.gallery.length }[p];
          status.textContent = `${count} item${count === 1 ? "" : "s"}`;
        }
        win.navigate = (key) => {
          if (key !== state.pane) {
            state.history = state.history.slice(0, state.index + 1);
            state.history.push(key);
            state.index = state.history.length - 1;
            state.pane = key;
          }
          draw();
        };
        draw();
      },
    });
  }

  function paneAbout(el) {
    const o = D.owner;
    const clients = [...new Set(D.projects.map((p) => p.client))];
    el.append(
      h("div", { class: "about-hero" }, [
        h("img", { class: "about-photo", src: o.photo, alt: o.name }),
        h("h1", { class: "about-name", text: o.name }),
        h("p", { class: "about-title", text: o.title }),
        h("p", { class: "about-intro", text: o.intro }),
      ]),
      h("dl", { class: "stat-row" }, [
        h("div", { class: "stat" }, [h("dt", { text: "Profession/" }), h("dd", { text: "Product & UI/UX" })]),
        h("div", { class: "stat" }, [h("dt", { text: "Experience/" }), h("dd", { text: o.experience })]),
        h("div", { class: "stat" }, [h("dt", { text: "Focus/" }), h("dd", { text: o.focus })]),
      ]),
      h("h2", { class: "section-h", text: "Beyond the work" }),
      h("p", { class: "prose", text: o.outside }),
      h("h2", { class: "section-h", text: "Clients & collaborators" }),
      h("div", { class: "clients" }, clients.map((c) => h("span", { class: "chip", text: c }))),
      h("div", { class: "btn-row" }, [
        h("button", { class: "btn primary", html: icon("mail") + "Email me", onclick: () => openMail() }),
        h("a", { class: "btn", href: D.links.linkedin, target: "_blank", rel: "noopener", html: icon("external") + "LinkedIn" }),
        h("a", { class: "btn", href: D.links.figma, target: "_blank", rel: "noopener", html: icon("external") + "Figma" }),
        h("button", { class: "btn", html: icon("folder") + "Selected Works", onclick: () => WM.wins.get("finder")?.navigate("works") }),
      ])
    );
  }

  function paneServices(el) {
    el.append(
      h("h1", { class: "pane-h", text: "Services" }),
      h("p", { class: "pane-sub", text: "How I can help — from first research to a polished, shippable interface." }),
      h("div", { class: "svc-grid" }, D.services.map((s) =>
        h("article", { class: "svc" }, [h("div", { class: "svc-ico", html: icon(s.icon) }), h("h3", { text: s.title }), h("p", { text: s.text })])
      )),
      h("div", { class: "btn-row" }, [
        h("button", { class: "btn primary", html: icon("send") + "Start a project", onclick: () => openMail() }),
        h("a", { class: "btn", href: D.links.telegram, target: "_blank", rel: "noopener", html: icon("external") + "Message on Telegram" }),
      ])
    );
  }

  function paneWorks(el, state) {
    const q = state.query.trim().toLowerCase();
    const items = D.projects.filter((p) => !q || [p.title, p.label, p.client, ...p.category].join(" ").toLowerCase().includes(q));
    el.append(h("p", { class: "pane-sub", style: { margin: "4px 0 14px" }, text: `${items.length} item${items.length === 1 ? "" : "s"}` }));
    if (!items.length) return el.append(h("p", { class: "proj-empty", text: `No projects match “${state.query}”.` }));
    const open = (p) => openProject(p.slug);

    if (state.view === "list") {
      return el.append(h("table", { class: "file-list" }, [
        h("thead", {}, h("tr", {}, [h("th", { text: "Name" }), h("th", { text: "Client" }), h("th", { text: "Category" }), h("th", { text: "Year" })])),
        h("tbody", {}, items.map((p) =>
          h("tr", { ondblclick: () => open(p), onclick: () => isCoarse() && open(p), tabindex: "0", onkeydown: (e) => e.key === "Enter" && open(p) }, [
            h("td", {}, h("span", { class: "fl-name" }, [h("img", { src: p.icon, alt: "" }), p.title])),
            h("td", { text: p.client }),
            h("td", { text: p.category[0] }),
            h("td", { text: p.timeline }),
          ])
        )),
      ]));
    }

    const grid = h("div", { class: "file-grid" });
    for (const p of items) {
      const f = h("button", { class: "file", "aria-label": `Open ${p.title}` }, [h("img", { src: p.icon, alt: "" }), h("span", { text: p.title }), h("small", { text: p.category[0] })]);
      f.addEventListener("click", () => {
        if (isCoarse()) return open(p);
        $$(".file.selected", grid).forEach((x) => x.classList.remove("selected"));
        f.classList.add("selected");
      });
      f.addEventListener("dblclick", () => open(p));
      f.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); open(p); } });
      grid.append(f);
    }
    el.append(grid);
  }

  function paneGallery(el) {
    el.append(
      h("h1", { class: "pane-h", text: "Gallery" }),
      h("p", { class: "pane-sub", text: "Photographs I return to — and what they taught me about interfaces." }),
      h("div", { class: "photo-grid" }, D.gallery.map((g, i) =>
        h("figure", { class: "photo", tabindex: "0", role: "button", "aria-label": `Open ${g.title}`, onclick: () => openPhotos(i), onkeydown: (e) => e.key === "Enter" && openPhotos(i), style: { margin: 0 } }, [
          h("img", { src: g.image, alt: g.title, loading: "lazy" }),
          h("figcaption", { html: `${esc(g.title)}<small>${esc(g.category)}</small>` }),
        ])
      ))
    );
  }

  /* ---------------- Windows File Explorer ---------------- */

  const EX_ROOT = "root";
  const exPaneLabel = (k) => (k === EX_ROOT ? D.owner.name : PANES[k].label);
  const PHOTO_SIZES = ["208 KB", "206 KB", "264 KB", "196 KB", "153 KB"];

  function exDate(i, timeline) {
    const m = String(timeline || "").match(/(\d{4})(?!.*\d{4})/);
    const y = m ? m[1] : "2025";
    const mo = String(((i * 5) % 12) + 1).padStart(2, "0");
    const d = String(((i * 7) % 27) + 1).padStart(2, "0");
    const hh = String(9 + ((i * 3) % 9)).padStart(2, "0");
    const mm = String((i * 13) % 60).padStart(2, "0");
    return { text: `${d}/${mo}/${y} ${hh}:${mm}`, sort: `${y}${mo}${d}${hh}${mm}` };
  }

  /** Everything a folder "contains" in the Windows explorer. */
  function exItems(pane) {
    const w = ICONS.win;
    const nav = (k) => () => WM.wins.get("finder")?.navigate(k);
    const fixed = { text: "20/10/2026 09:14", sort: "202610200914" };
    const file = (name, ic, type, size, open, extra = {}) => ({ id: name, name, icon: ic, type, size, date: fixed, open, ...extra });
    const txt = (name, key) => file(name, w.notes, "Text Document", "1 KB", () => openNotes(key));

    if (pane === EX_ROOT) {
      return [
        ...["about", "services", "works", "gallery"].map((k, i) => ({
          id: k, name: PANES[k].label, icon: w.folder, type: "File folder", size: "", date: exDate(i + 3, "2026"), folder: true, open: nav(k),
        })),
        txt("hello.txt", "about"),
      ];
    }
    if (pane === "about") {
      return [
        txt("hello.txt", "about"),
        txt("contact.txt", "contact"),
        txt("work.txt", "work"),
        file("Dawit Tesfaye.png", D.owner.photo, "PNG File", "189 KB", () => openViewer(D.owner.photo, "Dawit Tesfaye.png"), { thumb: true }),
      ];
    }
    if (pane === "services") return D.services.map((s, i) => txt(`${s.title}.txt`, "svc" + i));
    if (pane === "gallery") {
      return D.gallery.map((g, i) => file(`${g.title}.jpg`, g.image, "JPG File", PHOTO_SIZES[i] || "200 KB", () => openPhotos(i), {
        thumb: true, meta: { Category: g.category, Summary: g.summary },
      }));
    }
    return D.projects.map((p, i) => ({
      id: p.slug, name: p.title, icon: p.icon, type: "File folder", size: "", date: exDate(i, p.timeline), folder: true, thumb: true,
      link: "#/work/" + p.slug, open: () => openProject(p.slug),
      meta: { Client: p.client, Category: p.category.join(", "), Timeline: p.timeline, "My role": p.role.join(", ") },
    }));
  }

  function openExplorer(pane = "works") {
    const existing = WM.wins.get("finder");
    if (existing) {
      existing.navigate(pane);
      if (existing.minimized) restoreWindow(existing);
      focusWindow(existing);
      return;
    }
    const state = {
      pane, history: [pane], index: 0, view: store.get("dt-view-win", "details"), sortKey: null, sortDir: 1,
      query: "", sel: new Set(), anchor: null, details: store.get("dt-details-pane", false), navPane: true,
    };

    openWindow({
      id: "finder", title: exPaneLabel(pane), app: "finder", width: 1060, height: 650, minWidth: 600, minHeight: 380, className: "explorer-win",
      render(body, win) {
        let cur = [];
        const imgIco = (src) => `<img src="${src}" alt="">`;
        const toast = (name) => () => notify({ title: name, body: "This is a portfolio — there’s no real PC behind it. 🙂", img: appIcon("settings"), timeout: 3000 });

        /* navigation pane */
        const navBtn = (key, name, ico, pinned) =>
          h("button", { class: "ex-nav-item", "data-pane": key, onclick: () => win.navigate(key),
            html: `<span class="ex-ico">${ico}</span><span class="ex-nav-name">${esc(name)}</span>${pinned ? `<span class="ex-pin">${icon("pin")}</span>` : ""}` });
        const nav = h("aside", { class: "ex-nav", "aria-label": "Navigation pane" }, [
          navBtn(EX_ROOT, "Home", icon("home")),
          h("div", { class: "ex-nav-sep" }),
          h("button", { class: "ex-nav-group", onclick: () => win.navigate(EX_ROOT), html: `<span class="ex-caret">${icon("chevdown")}</span><span>${esc(D.owner.name)}</span>` }),
          ...["about", "services", "works", "gallery"].map((k) => navBtn(k, PANES[k].label, imgIco(ICONS.win.folder), true)),
          h("div", { class: "ex-nav-sep" }),
          h("button", { class: "ex-nav-item", onclick: toast("This PC"), html: `<span class="ex-ico">${icon("monitor")}</span><span class="ex-nav-name">This PC</span>` }),
          h("button", { class: "ex-nav-item", onclick: toast("Network"), html: `<span class="ex-ico">${icon("link")}</span><span class="ex-nav-name">Network</span>` }),
        ]);

        /* address row */
        const back = h("button", { class: "ex-btn", "aria-label": "Back", title: "Back", html: icon("left"), onclick: () => go(-1) });
        const fwd = h("button", { class: "ex-btn", "aria-label": "Forward", title: "Forward", html: icon("right"), onclick: () => go(1) });
        const upb = h("button", { class: "ex-btn", "aria-label": "Up", title: "Up one level", html: icon("up"), onclick: () => win.navigate(EX_ROOT) });
        const addr = h("div", { class: "ex-addr" });
        const search = h("input", {
          class: "ex-search", type: "search", autocomplete: "off", "aria-label": "Search",
          oninput: (e) => { state.query = e.target.value; draw(); },
        });
        const addrRow = h("div", { class: "ex-addr-row" }, [back, fwd, upb, addr, search]);

        /* command bar */
        const cmd = (ic, label, fn, o = {}) =>
          h("button", {
            class: `ex-cmd-btn ${o.cls || ""}`, title: o.title || label || "", "aria-label": o.title || label, disabled: o.disabled,
            html: icon(ic) + (label ? `<span>${label}</span>` : "") + (o.chev ? icon("chevdown") : ""), onclick: fn,
          });
        const btnCopy = cmd("copy", "", () => doCopy(false), { title: "Copy", disabled: true });
        const btnShare = cmd("share", "", () => doCopy(true), { title: "Share (copy link)", disabled: true });
        const btnDelete = cmd("trash", "", () => denyDelete(), { title: "Delete", disabled: true });
        const btnRename = cmd("pen", "", null, { title: "Rename", disabled: true });
        const cutBtn = cmd("scissors", "", null, { title: "Cut", disabled: true });
        const pasteBtn = cmd("clipboard", "", null, { title: "Paste", disabled: true });
        const cmdBar = h("div", { class: "ex-cmd" }, [
          cmd("plus", "New", (e) => showMenu([{ label: "Folder", disabled: true }, { label: "Text Document", disabled: true }, "sep", { label: "Shortcut", disabled: true }], ...below(e.currentTarget)), { chev: true }),
          h("span", { class: "ex-cmd-sep" }),
          cutBtn, btnCopy, pasteBtn, btnRename, btnShare, btnDelete,
          h("span", { class: "ex-cmd-sep" }),
          cmd("sort", "Sort", (e) => showMenu(sortItems(), ...below(e.currentTarget)), { chev: true }),
          cmd("view", "View", (e) => showMenu(viewItems(), ...below(e.currentTarget)), { chev: true }),
          h("span", { class: "ex-cmd-sep" }),
          cmd("more", "", (e) => showMenu([
            { label: "Select all", kbd: "Ctrl+A", action: selectAll },
            { label: "Select none", action: () => { state.sel.clear(); paint(); } },
            { label: "Invert selection", action: invertSel },
            "sep",
            { label: "Options", disabled: true },
          ], ...below(e.currentTarget)), { title: "See more" }),
          h("span", { class: "ex-grow" }),
          cmd("panel", "Details", () => toggleDetails(), { cls: "hide-sm", title: "Details pane" }),
        ]);

        /* body */
        const content = h("div", { class: "ex-content", tabindex: "0", "aria-label": "Items" });
        const stCount = h("span", { class: "ex-st-count" });
        const stSel = h("span", { class: "ex-st-sel" });
        const vDetails = h("button", { class: "ex-vbtn", "aria-label": "Details view", title: "Details", html: icon("list"), onclick: () => setView("details") });
        const vIcons = h("button", { class: "ex-vbtn", "aria-label": "Large icons view", title: "Large icons", html: icon("grid"), onclick: () => setView("lg") });
        const status = h("div", { class: "ex-status" }, [stCount, stSel, h("span", { class: "ex-grow" }), vDetails, vIcons]);
        const details = h("aside", { class: "ex-details", "aria-label": "Details pane" });
        const main = h("section", { class: "ex-main" }, [content, status]);
        body.append(h("div", { class: "explorer" }, [addrRow, cmdBar, h("div", { class: "ex-body" }, [nav, main, details])]));

        /* helpers */
        function below(el) { const r = el.getBoundingClientRect(); return [r.left, r.bottom + 4]; }
        const selected = () => cur.filter((i) => state.sel.has(i.id));
        const viewLabels = { xl: "Extra large icons", lg: "Large icons", md: "Medium icons", details: "Details" };
        function viewItems() {
          return [
            ...Object.entries(viewLabels).map(([k, l]) => ({ label: l, checked: state.view === k, action: () => setView(k) })),
            "sep",
            { label: "Navigation pane", checked: state.navPane, action: toggleNav },
            { label: "Details pane", checked: state.details, action: toggleDetails },
          ];
        }
        function sortItems() {
          return [
            ...[["name", "Name"], ["date", "Date modified"], ["type", "Type"]].map(([k, l]) => ({ label: l, checked: state.sortKey === k, action: () => sortBy(k, true) })),
            "sep",
            { label: "Ascending", checked: state.sortDir === 1, action: () => { state.sortDir = 1; state.sortKey ||= "name"; draw(); } },
            { label: "Descending", checked: state.sortDir === -1, action: () => { state.sortDir = -1; state.sortKey ||= "name"; draw(); } },
          ];
        }
        function sortBy(k, keepDir) {
          if (state.sortKey === k && !keepDir) state.sortDir *= -1;
          else if (state.sortKey !== k) { state.sortKey = k; if (!keepDir) state.sortDir = 1; }
          draw();
        }
        function setView(v) { state.view = v; store.set("dt-view-win", v); draw(); }
        function toggleNav() { state.navPane = !state.navPane; nav.hidden = !state.navPane; }
        function toggleDetails() { state.details = !state.details; store.set("dt-details-pane", state.details); paintDetails(); }
        function doCopy(link) {
          const it = selected()[0];
          if (!it) return;
          copyText(link && it.link ? shareUrl(it.link) : it.name, link && it.link ? "Link" : "Name");
        }
        function denyDelete() {
          if (!state.sel.size) return;
          notify({ title: "File Explorer", body: "You need permission to delete this item. Dawit’s projects are protected. 🙂", img: appIcon("finder"), timeout: 3500 });
        }
        function selectAll() { state.sel = new Set(cur.map((i) => i.id)); paint(); }
        function invertSel() { state.sel = new Set(cur.filter((i) => !state.sel.has(i.id)).map((i) => i.id)); paint(); }

        function sorted(items) {
          const k = state.sortKey;
          if (!k) return items;
          const dir = state.sortDir;
          const cmpVal = (a, b) => {
            if (k === "name") return a.name.localeCompare(b.name, undefined, { numeric: true });
            const x = k === "date" ? a.date.sort : a.type, y = k === "date" ? b.date.sort : b.type;
            return x < y ? -1 : x > y ? 1 : 0;
          };
          return [...items].sort((a, b) => (b.folder ? 1 : 0) - (a.folder ? 1 : 0) || dir * cmpVal(a, b));
        }

        /* selection */
        function select(it, e) {
          const idx = cur.indexOf(it);
          if (e && (e.ctrlKey || e.metaKey)) {
            state.sel.has(it.id) ? state.sel.delete(it.id) : state.sel.add(it.id);
            state.anchor = it.id;
          } else if (e && e.shiftKey && state.anchor) {
            const a = cur.findIndex((i) => i.id === state.anchor);
            const [lo, hi] = [Math.min(a < 0 ? idx : a, idx), Math.max(a < 0 ? idx : a, idx)];
            state.sel = new Set(cur.slice(lo, hi + 1).map((i) => i.id));
          } else {
            state.sel = new Set([it.id]);
            state.anchor = it.id;
          }
          paint();
        }
        function paint() {
          $$("[data-i]", content).forEach((el) => el.classList.toggle("selected", state.sel.has(cur[+el.dataset.i]?.id)));
          const n = state.sel.size;
          stCount.textContent = `${cur.length} item${cur.length === 1 ? "" : "s"}`;
          stSel.textContent = n ? `${n} item${n === 1 ? "" : "s"} selected` : "";
          const one = n >= 1;
          btnCopy.disabled = !one;
          btnShare.disabled = !one;
          btnDelete.disabled = !one;
          paintDetails();
        }
        function move(d) {
          if (!cur.length) return;
          const a = cur.findIndex((i) => i.id === state.anchor);
          const n = clamp((a < 0 ? (d > 0 ? -1 : cur.length) : a) + d, 0, cur.length - 1);
          state.sel = new Set([cur[n].id]);
          state.anchor = cur[n].id;
          paint();
          $(`[data-i="${n}"]`, content)?.scrollIntoView({ block: "nearest" });
        }

        /* details pane */
        function paintDetails() {
          details.hidden = !state.details;
          if (!state.details) return;
          details.innerHTML = "";
          const sel = selected();
          if (sel.length === 1) {
            const it = sel[0];
            const props = [["Date modified", it.date.text], ...(it.size ? [["Size", it.size]] : []), ...Object.entries(it.meta || {})];
            details.append(
              h("div", { class: `exd-icon ${it.thumb ? "thumb" : ""}` }, h("img", { src: it.icon, alt: "" })),
              h("h2", { text: it.name }),
              h("p", { class: "exd-type", text: it.type }),
              h("dl", { class: "exd-props" }, props.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })])),
              h("button", { class: "btn primary", text: "Open", onclick: it.open })
            );
          } else if (sel.length > 1) {
            details.append(h("div", { class: "exd-icon" }, h("img", { src: ICONS.win.folder, alt: "" })), h("h2", { text: `${sel.length} items selected` }));
          } else {
            details.append(
              h("div", { class: "exd-icon" }, h("img", { src: ICONS.win.folder, alt: "" })),
              h("h2", { text: exPaneLabel(state.pane) }),
              h("p", { class: "exd-type", text: "File folder" }),
              h("p", { class: "exd-hint", text: `${cur.length} item${cur.length === 1 ? "" : "s"}. Select a file to view its details.` })
            );
          }
        }

        /* menus */
        function itemMenu(it) {
          return [
            { label: "Open", action: it.open },
            { label: "Open in new tab", disabled: true },
            { label: "Pin to Quick access", disabled: true },
            "sep",
            { label: it.link ? "Copy link" : "Copy as name", action: () => copyText(it.link ? shareUrl(it.link) : it.name, it.link ? "Link" : "Name") },
            "sep",
            { label: "Delete", action: denyDelete },
            { label: "Properties", action: () => { state.details = true; paintDetails(); } },
          ];
        }
        function blankMenu() {
          return [
            ...Object.entries(viewLabels).map(([k, l]) => ({ label: l, checked: state.view === k, action: () => setView(k) })),
            "sep",
            ...sortItems().slice(0, 3),
            "sep",
            { label: "Refresh", action: refresh },
            "sep",
            { label: "Properties", action: () => { state.details = true; paintDetails(); } },
          ];
        }
        function refresh() { content.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 220 }); draw(); }

        /* rendering */
        function draw() {
          const p = state.pane;
          win.setTitle(exPaneLabel(p));
          win.titleEl.textContent = exPaneLabel(p);
          back.disabled = state.index === 0;
          fwd.disabled = state.index >= state.history.length - 1;
          upb.disabled = p === EX_ROOT;
          nav.hidden = !state.navPane;
          $$(".ex-nav-item", nav).forEach((b) => b.classList.toggle("active", b.dataset.pane === p));
          search.placeholder = `Search ${exPaneLabel(p)}`;
          if (search.value !== state.query) search.value = state.query;

          addr.innerHTML = "";
          const chev = () => h("span", { class: "ex-chev", html: icon("right") });
          const seg = (label, fn) => h("button", { class: "ex-seg", text: label, onclick: fn });
          addr.append(
            h("span", { class: "ex-addr-ico", html: icon("monitor") }), chev(),
            seg("This PC", toast("This PC")), chev(),
            seg(D.owner.name, () => win.navigate(EX_ROOT))
          );
          if (p !== EX_ROOT) addr.append(chev(), seg(exPaneLabel(p), () => {}));
          addr.append(h("button", { class: "ex-btn ex-refresh", "aria-label": "Refresh", title: "Refresh", html: icon("refresh"), onclick: refresh }));

          const q = state.query.trim().toLowerCase();
          cur = sorted(exItems(p).filter((i) => !q || i.name.toLowerCase().includes(q) || (i.meta && Object.values(i.meta).join(" ").toLowerCase().includes(q))));
          state.sel = new Set([...state.sel].filter((id) => cur.some((i) => i.id === id)));

          vDetails.classList.toggle("on", state.view === "details");
          vIcons.classList.toggle("on", state.view !== "details");
          content.innerHTML = "";
          if (!cur.length) content.append(h("p", { class: "ex-empty", text: q ? "No items match your search." : "This folder is empty." }));
          else if (state.view === "details") content.append(detailsTable());
          else content.append(iconGrid());
          paint();
        }
        function detailsTable() {
          const cols = [["name", "Name"], ["date", "Date modified"], ["type", "Type"], ["size", "Size"]];
          const head = h("tr", {}, cols.map(([k, l]) => h("th", {
            class: `ex-th ${k}`, onclick: k === "size" ? null : () => sortBy(k),
            html: `<span>${l}</span>${state.sortKey === k ? `<i class="ex-sort">${icon(state.sortDir > 0 ? "chevup" : "chevdown")}</i>` : ""}`,
          })));
          return h("table", { class: "ex-table" }, [
            h("thead", {}, head),
            h("tbody", {}, cur.map((it, i) => h("tr", { class: "ex-row", "data-i": i, title: it.name }, [
              h("td", {}, h("span", { class: `ex-cell-name ${it.thumb ? "thumb" : ""}` }, [h("img", { src: it.icon, alt: "" }), h("span", { text: it.name })])),
              h("td", { text: it.date.text }),
              h("td", { text: it.type }),
              h("td", { class: "ex-size", text: it.size }),
            ]))),
          ]);
        }
        function iconGrid() {
          return h("div", { class: `ex-grid ${state.view}` }, cur.map((it, i) =>
            h("div", { class: `ex-item ${it.thumb ? "thumb" : ""}`, "data-i": i, title: `${it.name}\n${it.type}` }, [h("img", { src: it.icon, alt: "" }), h("span", { text: it.name })])
          ));
        }

        /* events */
        const itemAt = (e) => { const el = e.target.closest("[data-i]"); return el ? cur[+el.dataset.i] : null; };
        content.addEventListener("pointerdown", (e) => {
          if (e.button > 2) return;
          const it = itemAt(e);
          if (!it) { if (e.button === 0 && !e.target.closest("th")) { state.sel.clear(); paint(); } return; }
          if (e.button === 2 && state.sel.has(it.id)) return;
          select(it, e);
        });
        content.addEventListener("dblclick", (e) => itemAt(e)?.open());
        content.addEventListener("click", (e) => { if (isCoarse()) itemAt(e)?.open(); });
        content.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const it = itemAt(e);
          showMenu(it ? itemMenu(it) : blankMenu(), e.clientX, e.clientY);
        });
        content.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); move(1); }
          else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
          else if (e.key === "Home") { e.preventDefault(); move(-cur.length); }
          else if (e.key === "End") { e.preventDefault(); move(cur.length); }
          else if (e.key === "Enter") selected().forEach((i) => i.open());
          else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); selectAll(); }
          else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") doCopy(false);
          else if (e.key === "Delete") denyDelete();
          else if (e.key === "F5") { e.preventDefault(); refresh(); }
        });
        body.addEventListener("keydown", (e) => {
          if (e.altKey && e.key === "ArrowLeft") go(-1);
          if (e.altKey && e.key === "ArrowRight") go(1);
          if (e.altKey && e.key === "ArrowUp") win.navigate(EX_ROOT);
        });

        function go(d) {
          const i = state.index + d;
          if (i < 0 || i >= state.history.length) return;
          state.index = i;
          state.pane = state.history[i];
          state.query = "";
          state.sel.clear();
          draw();
        }
        win.navigate = (key) => {
          if (key !== state.pane) {
            state.history = state.history.slice(0, state.index + 1);
            state.history.push(key);
            state.index = state.history.length - 1;
            state.pane = key;
            state.query = "";
            state.sel.clear();
          }
          draw();
        };
        draw();
      },
    });
  }

  /* ---------------- Project ---------------- */

  function openProject(slug) {
    const idx = D.projects.findIndex((p) => p.slug === slug);
    if (idx < 0) return;
    const p = D.projects[idx];
    openWindow({
      id: "project-" + slug, title: p.title, app: "project", icon: p.icon, width: 900, height: 700, minWidth: 420,
      toolbar: h("div", { class: "tb-actions" }, [
        h("button", { class: "tb-btn", "aria-label": "Copy link", title: "Copy link", html: icon("link"), onclick: () => copyText(shareUrl("#/work/" + slug), "Link") }),
        h("a", { class: "tb-btn", href: D.links.figma, target: "_blank", rel: "noopener", title: "Open in Figma", "aria-label": "Open in Figma", html: icon("external") }),
      ]),
      render(body) {
        const meta = [["Client", p.client], ["Timeline", p.timeline], ["My role", p.role.join(" · ")]];
        const prev = D.projects[(idx - 1 + D.projects.length) % D.projects.length];
        const next = D.projects[(idx + 1) % D.projects.length];
        const cards = [["Challenge", p.challenge], ["Solution", p.solution]].filter(([, v]) => v);

        body.append(h("article", { class: "proj" }, [
          h("header", { class: "proj-hero" }, [
            h("img", { src: p.icon, alt: "" }),
            h("div", {}, [h("h1", { text: p.title }), h("div", { class: "proj-tags" }, p.category.map((c) => h("span", { class: "chip accent", text: c })))]),
          ]),
          h("dl", { class: "proj-meta" }, meta.map(([k, v]) => h("div", {}, [h("dt", { text: k }), h("dd", { text: v })]))),
          h("section", { class: "proj-sec" }, [h("h2", { text: "Project overview" }), h("p", { class: "prose", text: p.overview })]),
          cards.length ? h("div", { class: "proj-cols", style: cards.length === 1 ? { gridTemplateColumns: "1fr" } : null },
            cards.map(([k, v]) => h("div", { class: "proj-card" }, [h("h2", { text: k }), h("p", { text: v })]))) : null,
          p.delivered ? h("section", { class: "proj-sec" }, [h("h2", { text: "Delivered" }), h("div", { class: "clients" }, p.delivered.map((d) => h("span", { class: "chip", text: d })))]) : null,
          h("section", { class: "proj-sec" }, [
            h("h2", { text: "Screens" }),
            p.shots && p.shots.length
              ? h("div", { class: "shots" }, p.shots.map((s) =>
                  h("figure", { class: "shot", tabindex: "0", role: "button", "aria-label": `View ${s.caption}`, onclick: () => openViewer(s.src, `${p.title} — ${s.caption}`), onkeydown: (e) => e.key === "Enter" && openViewer(s.src, `${p.title} — ${s.caption}`) }, [
                    h("div", { class: "shot-frame" }, h("img", { src: s.src, alt: s.caption, loading: "lazy" })),
                    h("figcaption", { text: s.caption }),
                  ])))
              : h("div", { class: "proj-empty", html: `Full case study screens are available in Figma. <a href="${D.links.figma}" target="_blank" rel="noopener">Open the Figma files ↗</a>` }),
          ]),
          h("nav", { class: "proj-nav" }, [
            h("button", { class: "btn", html: icon("left") + esc(prev.title), onclick: () => openProject(prev.slug) }),
            h("button", { class: "btn", html: esc(next.title) + icon("right"), onclick: () => openProject(next.slug) }),
          ]),
        ]));
      },
    });
  }

  /* ---------------- Image viewer ---------------- */

  function openViewer(src, title) {
    let fit = false;
    openWindow({
      id: "viewer-" + src, title, app: "preview", width: 960, height: 760, minWidth: 360,
      toolbar: h("div", { class: "tb-actions" }, [
        h("button", { class: "tb-btn", title: "Toggle fit", "aria-label": "Toggle fit to window", html: icon("zoom"), onclick: (e) => { fit = !fit; e.currentTarget.closest(".window").querySelector(".viewer").classList.toggle("fit", fit); } }),
        h("a", { class: "tb-btn", href: src, target: "_blank", rel: "noopener", title: "Open full size", "aria-label": "Open full size", html: icon("external") }),
      ]),
      render(body) {
        body.append(h("div", { class: "viewer" }, h("img", { src, alt: title })));
      },
    });
  }

  /* ---------------- Photos ---------------- */

  function openPhotos(index = 0) {
    const existing = WM.wins.get("photos");
    if (existing) { existing.show(index); if (existing.minimized) restoreWindow(existing); focusWindow(existing); return; }
    openWindow({
      id: "photos", title: appName("photos"), app: "photos", width: 1000, height: 640, minWidth: 520,
      render(body, win) {
        const stage = h("div", { class: "photos-stage" });
        const info = h("aside", { class: "photos-info" });
        body.append(h("div", { class: "photos" }, [stage, info]));
        let i = index;
        win.show = (n) => {
          i = (n + D.gallery.length) % D.gallery.length;
          const g = D.gallery[i];
          win.setTitle(OS === "mac" ? g.title : `${g.title} — ${appName("photos")}`);
          stage.innerHTML = "";
          stage.append(
            h("img", { src: g.image, alt: g.title }),
            h("button", { class: "photo-nav prev", "aria-label": "Previous photo", html: icon("left"), onclick: () => win.show(i - 1) }),
            h("button", { class: "photo-nav next", "aria-label": "Next photo", html: icon("right"), onclick: () => win.show(i + 1) })
          );
          info.innerHTML = "";
          info.append(
            h("span", { class: "chip accent", style: { alignSelf: "flex-start" }, text: g.category }),
            h("h1", { text: g.title }),
            h("p", { class: "lead", text: g.summary }),
            ...g.body.map((t) => h("p", { text: t })),
            h("div", { class: "btn-row" }, [
              h("button", {
                class: "btn primary", html: icon("image") + pick({ mac: "Set as Wallpaper", win: "Set as background", linux: "Set as Background" }),
                onclick: () => { applyWallpaper(g.title.toLowerCase()); notify({ title: "Wallpaper updated", body: `${esc(g.title)} is now your desktop background.`, img: g.image, timeout: 3000 }); },
              }),
            ])
          );
        };
        body.tabIndex = 0;
        body.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") win.show(i - 1);
          if (e.key === "ArrowRight") win.show(i + 1);
        });
        win.show(i);
      },
    });
  }

  /* ---------------- Notes / Notepad / Text Editor ---------------- */

  function getNotes() {
    const o = D.owner;
    const notes = {
      about: {
        title: "About me", file: "hello.txt", preview: o.note,
        render: () => [
          h("h1", { text: "hello :)" }),
          h("p", { text: o.note }),
          h("p", { text: o.intro }),
          h("p", { text: o.outside }),
          h("ul", { class: "checklist" }, [
            h("li", { text: `${o.experience} designing digital products` }),
            h("li", { text: `Focus: ${o.focus}` }),
            h("li", { text: `Based in ${o.location}` }),
          ]),
        ],
        text: ["hello :)", "", o.note, "", o.intro, "", o.outside, "", `[x] ${o.experience} designing digital products`, `[x] Focus: ${o.focus}`, `[x] Based in ${o.location}`].join("\n"),
      },
      contact: {
        title: "Contact", file: "contact.txt", preview: o.email,
        render: () => [
          h("h1", { text: "Let’s connect" }),
          h("p", { html: `Email — <a href="mailto:${o.email}">${o.email}</a><br>Phone — <a href="tel:${o.phone.replace(/\s/g, "")}">${o.phone}</a>` }),
          h("p", { html: `<a href="${D.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${D.links.x}" target="_blank" rel="noopener">X</a> · <a href="${D.links.telegram}" target="_blank" rel="noopener">Telegram</a> · <a href="${D.links.figma}" target="_blank" rel="noopener">Figma</a>` }),
        ],
        text: ["Let's connect", "", `Email:    ${o.email}`, `Phone:    ${o.phone}`, "", `LinkedIn: ${D.links.linkedin}`, `X:        ${D.links.x}`, `Telegram: ${D.links.telegram}`, `Figma:    ${D.links.figma}`].join("\n"),
      },
      work: {
        title: "Selected work", file: "work.txt", preview: `${D.projects.length} projects`,
        render: () => [
          h("h1", { text: "Selected work" }),
          h("ul", {}, D.projects.map((p) => h("li", {}, h("a", { href: "#/work/" + p.slug, onclick: (e) => { e.preventDefault(); openProject(p.slug); }, text: `${p.title} — ${p.client}, ${p.timeline}` })))),
        ],
        text: ["Selected work", "", ...D.projects.map((p) => `- ${p.title} (${p.client}, ${p.timeline})`)].join("\n"),
      },
    };
    D.services.forEach((s, i) => {
      notes["svc" + i] = {
        title: s.title, file: `${s.title}.txt`, preview: s.text, extra: true,
        render: () => [h("h1", { text: s.title }), h("p", { text: s.text })],
        text: `${s.title}\n\n${s.text}`,
      };
    });
    return notes;
  }

  function openNotes(which = "about") {
    if (OS === "win") return openNotepad(which);
    const existing = WM.wins.get("notes");
    if (existing) { existing.show(which); if (existing.minimized) restoreWindow(existing); focusWindow(existing); return; }
    const NOTES = getNotes();
    openWindow({
      id: "notes", title: appName("notes"), app: "notes", width: 780, height: 540, sidebar: 200, minWidth: 460,
      render(body, win) {
        const list = h("aside", { class: "notes-list" });
        const toolbar = h("div", { class: "titlebar slim pane-toolbar", "data-drag": "" }, [h("div", { class: "tb-title" })]);
        const content = h("div", { class: "note-body" });
        body.append(h("div", { class: "notes" }, [list, h("div", { class: "note-main" }, [toolbar, content])]));
        win.show = (key) => {
          const n = NOTES[key] || NOTES.about;
          if (!NOTES[key]) key = "about";
          win.setTitle(pick({ mac: n.title, win: `${n.file} - Notepad`, linux: `${n.file} — Text Editor` }));
          toolbar.firstChild.textContent = n.title;
          list.innerHTML = "";
          for (const [k, v] of Object.entries(NOTES)) {
            if (v.extra) continue;
            list.append(h("button", { class: `note-row ${k === key ? "active" : ""}`, onclick: () => win.show(k) }, [h("b", { text: OS === "mac" ? v.title : v.file }), h("small", { text: v.preview })]));
          }
          content.innerHTML = "";
          content.append(h("p", { class: "when", text: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }), ...n.render());
        };
        win.show(which);
      },
    });
  }

  /** Windows 11 Notepad: tabs in the title bar, menu bar, editable text, status bar. */
  function openNotepad(which = "about") {
    const existing = WM.wins.get("notes");
    if (existing) { existing.show(which); if (existing.minimized) restoreWindow(existing); focusWindow(existing); return; }
    const NOTES = getNotes();
    openWindow({
      id: "notes", title: "hello.txt - Notepad", app: "notes", width: 780, height: 540, minWidth: 420, minHeight: 280, className: "notepad-win",
      render(body, win) {
        const tabs = [];
        const edits = {};
        let active = null;
        let untitled = 0;

        const area = h("textarea", { class: "np-text", spellcheck: "false", "aria-label": "Text editor" });
        const status = h("div", { class: "np-status" });
        const items = (m) => ({
          File: [
            { label: "New tab", kbd: "Ctrl+T", action: newTab },
            { label: "Close tab", kbd: "Ctrl+W", disabled: !active, action: () => closeTab(active) },
            "sep",
            { label: "Exit", action: () => closeWindow(win) },
          ],
          Edit: [
            { label: "Select all", kbd: "Ctrl+A", action: () => { area.focus(); area.select(); } },
            { label: "Copy all", action: () => copyText(area.value, "Text") },
          ],
          View: [
            { label: "Word wrap", checked: area.style.whiteSpace !== "pre", action: () => { area.style.whiteSpace = area.style.whiteSpace === "pre" ? "" : "pre"; area.wrap = area.style.whiteSpace === "pre" ? "off" : "soft"; } },
          ],
        })[m];
        const menu = h("div", { class: "np-menu" }, ["File", "Edit", "View"].map((m) =>
          h("button", { class: "np-menu-item", text: m, onclick: (e) => { const r = e.currentTarget.getBoundingClientRect(); showMenu(items(m), r.left, r.bottom + 2); } })
        ));
        body.append(h("div", { class: "np" }, [menu, area, status]));

        const stat = () => {
          const v = area.value;
          const before = v.slice(0, area.selectionStart).split("\n");
          status.innerHTML = `<span>Ln ${before.length}, Col ${before[before.length - 1].length + 1}</span><span>${v.length} characters</span><span>100%</span><span class="hide-sm">Windows (CRLF)</span><span class="hide-sm">UTF-8</span>`;
        };
        const drawTabs = () => {
          const ts = win.tabsEl;
          ts.innerHTML = "";
          tabs.forEach((k) => {
            const n = NOTES[k];
            ts.append(h("div", { class: `win-tab ${k === active ? "active" : ""}`, role: "tab", onclick: () => win.show(k) }, [
              h("img", { class: "tb-appicon", src: appIcon("notes"), alt: "" }),
              h("span", { class: "tb-title", text: n.file }),
              h("button", { class: "win-tab-x", "aria-label": `Close ${n.file}`, html: GLYPHS.wclose, onclick: (e) => { e.stopPropagation(); closeTab(k); } }),
            ]));
          });
          ts.append(h("button", { class: "win-tab-add", "aria-label": "New tab", title: "New tab", html: icon("plus"), onclick: newTab }));
        };
        function newTab() {
          const key = "untitled" + ++untitled;
          NOTES[key] = { title: "Untitled", file: untitled === 1 ? "Untitled" : `Untitled ${untitled}`, text: "" };
          win.show(key);
          area.focus();
        }
        function closeTab(k) {
          const i = tabs.indexOf(k);
          if (i < 0) return;
          tabs.splice(i, 1);
          delete edits[k];
          if (!tabs.length) return closeWindow(win);
          if (active === k) win.show(tabs[Math.min(i, tabs.length - 1)]);
          else drawTabs();
        }
        win.show = (key) => {
          if (!NOTES[key]) key = "about";
          if (active) edits[active] = area.value;
          if (!tabs.includes(key)) tabs.push(key);
          active = key;
          area.value = edits[key] ?? NOTES[key].text;
          win.setTitle(`${NOTES[key].file} - Notepad`);
          drawTabs();
          stat();
        };
        ["input", "keyup", "click", "select"].forEach((ev) => area.addEventListener(ev, stat));
        area.addEventListener("keydown", (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") { e.preventDefault(); newTab(); }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") { e.preventDefault(); closeTab(active); }
        });
        win.show(which);
      },
    });
  }

  /* ---------------- Mail ---------------- */

  function openMail() {
    openWindow({
      id: "mail", title: "New Message", app: "mail", width: 620, height: 500, minWidth: 380,
      render(body, win) {
        const subject = h("input", { type: "text", placeholder: "Let’s work together", "aria-label": "Subject" });
        const name = h("input", { type: "text", placeholder: "Your name", "aria-label": "Your name" });
        const msg = h("textarea", { placeholder: "Hi Dawit, …", "aria-label": "Message" });
        const send = () => {
          const text = msg.value.trim() + (name.value.trim() ? `\n— ${name.value.trim()}` : "");
          window.location.href = `mailto:${D.owner.email}?subject=${encodeURIComponent(subject.value || "Hello Dawit")}&body=${encodeURIComponent(text)}`;
          notify({ title: appName("mail"), body: "Opening your email app to send the message…", img: appIcon("mail"), timeout: 3500 });
          setTimeout(() => closeWindow(win), 600);
        };
        body.append(h("div", { class: "mail" }, [
          h("div", { class: "mail-bar" }, [
            h("button", { class: "mail-send", html: icon("send") + "<span>Send</span>", onclick: send }),
          ]),
          h("div", { class: "mail-field" }, [h("label", { text: "To:" }), h("span", { class: "mail-to", text: D.owner.name })]),
          h("div", { class: "mail-field" }, [h("label", { text: "From:" }), name]),
          h("div", { class: "mail-field" }, [h("label", { text: "Subject:" }), subject]),
          msg,
        ]));
        setTimeout(() => subject.focus(), 50);
      },
    });
  }

  /* ---------------- Terminal ---------------- */

  function openTerminal() {
    const prompt = pick({
      mac: '<span class="p">dawit@portfolio</span> <span class="d">~</span> %',
      win: '<span class="d">PS C:\\Users\\Dawit&gt;</span>',
      linux: '<span class="p">dawit@portfolio</span>:<span class="d">~</span>$',
    });
    openWindow({
      id: "terminal", app: "terminal", width: 700, height: 440, className: "term-win", titleStyle: "center slim",
      title: pick({ mac: "dawit — -zsh — 80×24", win: "Windows PowerShell", linux: "dawit@portfolio: ~" }),
      render(body) {
        const term = h("div", { class: "term" });
        body.append(term);
        const input = h("input", { type: "text", "aria-label": "Terminal input", autocomplete: "off", spellcheck: "false" });
        const inputRow = h("div", { class: "in-row" }, [h("span", { html: prompt }), input]);
        term.append(inputRow);
        const out = (html, cls = "") => term.insertBefore(h("div", { class: "line " + cls, html }), inputRow);
        out(pick({
          mac: `Last login: ${new Date().toDateString()} on ttys000`,
          win: "Windows PowerShell\nCopyright (C) Dawit Tesfaye. All rights reserved.\n",
          linux: `Welcome to Dawit OS (GNU/Linux x86_64)\n\n * Portfolio: ${D.projects.length} projects installed\n`,
        }), "m");
        out(`Type <span class="y">help</span> to see available commands.`);
        const hist = [];
        let hi = 0;
        const cmds = {
          help: () => out(["about", "projects", "open &lt;name&gt;", "services", "contact", "socials", "os &lt;mac|windows|linux&gt;", "theme &lt;light|dark|auto&gt;", "wallpaper &lt;name&gt;", "uname", "date", "clear", "exit"].map((c) => `  <span class="y">${c}</span>`).join("\n")),
          about: () => out(`${esc(D.owner.name)} — ${esc(D.owner.title)}\n${esc(D.owner.intro)}`),
          whoami: () => out("guest — but you could be a client. Try <span class=\"y\">contact</span>."),
          projects: () => out(D.projects.map((p) => `  <span class="d">${p.slug.padEnd(24)}</span> ${esc(p.title)}`).join("\n")),
          services: () => out(D.services.map((s) => `  • ${esc(s.title)}`).join("\n")),
          contact: () => out(`email  <a href="mailto:${D.owner.email}">${D.owner.email}</a>\nphone  ${D.owner.phone}`),
          socials: () => out(Object.entries(D.links).map(([k, v]) => `  ${k.padEnd(9)}<a href="${v}" target="_blank" rel="noopener">${esc(v.replace(/^https?:\/\//, "").slice(0, 48))}</a>`).join("\n")),
          uname: () => out(pick({ mac: "Darwin portfolio 24.0 (macOS edition)", win: "Microsoft Windows [Portfolio edition]", linux: "Linux portfolio 6.8.0-dawit x86_64 GNU/Linux" })),
          date: () => out(new Date().toString()),
          clear: () => $$(".line", term).forEach((l) => l.remove()),
          exit: () => closeWindow(WM.wins.get("terminal")),
          sudo: () => out(OS === "win" ? "sudo: not recognised. Nice try. 🙂" : "Nice try. 🙂"),
          theme: (a) => { if (["light", "dark", "auto"].includes(a)) { applyTheme(a); out(`appearance set to ${a}`); } else out("usage: theme light|dark|auto"); },
          wallpaper: (a) => {
            const wp = D.wallpapers.find((w) => w.id === a || w.name.toLowerCase() === (a || "").toLowerCase());
            if (wp) { applyWallpaper(wp.id); out(`wallpaper set to ${wp.name}`); }
            else out("available: " + D.wallpapers.map((w) => w.id).join(", "));
          },
          os: (a = "") => {
            const m = { mac: "mac", macos: "mac", osx: "mac", windows: "win", win: "win", linux: "linux", ubuntu: "linux" }[a.toLowerCase()];
            if (!m) return out("usage: os mac|windows|linux");
            out(`rebooting into ${OS_META[m].name}…`);
            setTimeout(() => powerCycle(m), 600);
          },
          open: (a = "") => {
            const q = a.toLowerCase();
            if (PANES[q]) return openFinder(q), out(`opening ${q}…`);
            if (q === "works") return openFinder("works"), out("opening works…");
            const p = D.projects.find((x) => x.slug === q || x.slug.startsWith(q) || x.title.toLowerCase().includes(q));
            if (q && p) { openProject(p.slug); out(`opening ${esc(p.title)}…`); }
            else out("usage: open &lt;about|services|gallery|project-name&gt;");
          },
        };
        Object.assign(cmds, { ls: cmds.projects, dir: cmds.projects, cls: cmds.clear, ver: cmds.uname, neofetch: cmds.uname, start: cmds.open, xdg: cmds.open });
        input.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) input.value = hist[--hi]; return; }
          if (e.key === "ArrowDown") { e.preventDefault(); if (hi < hist.length) input.value = hist[++hi] || ""; return; }
          if (e.key !== "Enter") return;
          const raw = input.value.trim();
          input.value = "";
          out(`${prompt} ${esc(raw)}`);
          if (!raw) return;
          hist.push(raw);
          hi = hist.length;
          const [c, ...args] = raw.split(/\s+/);
          const fn = cmds[c.toLowerCase()];
          if (fn) fn(args.join(" "));
          else out(OS === "win"
            ? `${esc(c)} : The term '${esc(c)}' is not recognized as the name of a cmdlet. Try <span class="y">help</span>.`
            : `${OS === "mac" ? "zsh" : "bash"}: command not found: ${esc(c)}`);
          term.scrollTop = term.scrollHeight;
        });
        term.addEventListener("click", () => { if (!window.getSelection().toString()) input.focus(); });
        setTimeout(() => input.focus(), 50);
      },
    });
  }

  /* ---------------- Settings ---------------- */

  function openSettings() {
    openWindow({
      id: "settings", title: appName("settings"), app: "settings", width: 800, height: 600, sidebar: 200, minWidth: 480,
      render(body, win) {
        const jump = (id) => () => main.querySelector(id).scrollIntoView({ behavior: "smooth" });
        const sidebar = h("aside", { class: "sidebar" }, [
          h("div", { class: "sb-user" }, [h("img", { src: D.owner.photo, alt: "" }), h("div", {}, [h("b", { text: D.owner.name }), h("small", { text: D.owner.email })])]),
          h("button", { class: "sb-row", html: icon("sun") + "<span>Appearance</span>", onclick: jump("#set-appearance") }),
          h("button", { class: "sb-row active", html: icon("image") + `<span>${pick({ mac: "Wallpaper", win: "Personalization", linux: "Background" })}</span>`, onclick: jump("#set-wallpaper") }),
          h("button", { class: "sb-row", html: icon("monitor") + "<span>Operating System</span>", onclick: jump("#set-os") }),
        ]);
        const toolbar = h("div", { class: "titlebar slim pane-toolbar", "data-drag": "" }, [h("div", { class: "tb-title", text: pick({ mac: "Wallpaper", win: "Personalization", linux: "Appearance" }) })]);
        const main = h("div", { class: "settings-main" });
        body.append(h("div", { class: "settings" }, [sidebar, h("div", { class: "note-main" }, [toolbar, main])]));
        win.refresh = () => {
          const theme = currentTheme();
          const wall = currentWall();
          main.innerHTML = "";
          main.append(
            OS === "mac" ? null : h("h2", { text: pick({ win: "Personalization", linux: "Appearance" }) }),
            h("div", { class: "set-group", id: "set-appearance" }, [
              h("h3", { text: pick({ mac: "Appearance", win: "Choose your mode", linux: "Style" }) }),
              h("div", { class: "appearance" }, ["light", "dark", "auto"].map((m) =>
                h("button", { class: theme === m ? "on" : "", onclick: () => applyTheme(m), "aria-pressed": String(theme === m) }, [h("span", { class: `sw ${m}` }), m[0].toUpperCase() + m.slice(1)])
              )),
            ]),
            h("div", { class: "set-group", id: "set-wallpaper" }, [
              h("h3", { text: pick({ mac: "Wallpaper", win: "Background", linux: "Background" }) }),
              h("div", { class: "wp-grid" }, D.wallpapers.map((w) =>
                h("button", { class: `wp ${wall === w.id ? "on" : ""}`, onclick: () => applyWallpaper(w.id), "aria-pressed": String(wall === w.id) }, [
                  h("span", { class: "sw", style: { backgroundImage: wallCss(w) } }),
                  w.name,
                ])
              )),
            ]),
            h("div", { class: "set-group", id: "set-os" }, [
              h("h3", { text: "Operating system" }),
              h("p", { class: "set-note", text: "Restart the portfolio in a different desktop style." }),
              h("div", { class: "os-choices" }, ["mac", "win", "linux"].map((os) =>
                h("button", { class: `os-choice ${os === OS ? "on" : ""}`, onclick: () => os !== OS && powerCycle(os), "aria-pressed": String(os === OS) }, [
                  h("span", { class: "os-logo", html: OS_LOGO[os] }),
                  h("span", {}, [h("b", { text: OS_META[os].name }), h("small", { text: os === OS ? "Current" : "Restart to switch" })]),
                ])
              )),
            ])
          );
        };
        win.refresh();
      },
    });
  }

  /* ---------------- About this portfolio ---------------- */

  function openAboutMac() {
    const o = D.owner;
    openWindow({
      id: "aboutmac", title: OS === "mac" ? "" : "About", app: "about", width: 300, height: 480, noResize: true, noMinimize: true, titleStyle: "slim",
      render(body) {
        body.append(h("div", { class: "about-mac" }, [
          h("img", { src: o.photo, alt: o.name }),
          h("h1", { text: o.name }),
          h("div", { class: "ver", text: `${o.title} · ${OS_META[OS].name} edition` }),
          h("dl", {}, [
            h("dt", { text: "Based in" }), h("dd", { text: o.location }),
            h("dt", { text: "Experience" }), h("dd", { text: o.experience }),
            h("dt", { text: "Focus" }), h("dd", { text: o.focus }),
            h("dt", { text: "Projects" }), h("dd", { text: String(D.projects.length) }),
          ]),
          h("button", { class: "btn", text: "More Info…", onclick: () => openFinder("about") }),
          h("p", { class: "fine", html: `Built with HTML, CSS &amp; JavaScript.<br>© ${new Date().getFullYear()} ${esc(o.name)}.` }),
        ]));
      },
    });
  }

  function openTrash() {
    notify({ title: appName("trash"), body: `${appName("trash")} is empty — every project made the cut.`, img: appIcon("trash"), timeout: 3500 });
  }

  /* ==================================================================
     Shells: macOS Dock · Windows taskbar · Linux top bar + dock
     ================================================================== */

  function renderShell() {
    $("#dock").innerHTML = "";
    $("#taskbar").innerHTML = "";
    $("#topbar").innerHTML = "";
    $("#ldock").innerHTML = "";
    if (OS === "mac") renderMacDock();
    if (OS === "win") renderTaskbar();
    if (OS === "linux") renderLinuxShell();
    syncTasks();
    syncPlaying();
  }

  /* ---------------- macOS dock ---------------- */

  function renderMacDock() {
    const dock = $("#dock");
    const add = (app) => {
      const id = app.id;
      const inner = `<img class="dock-img" src="${app.img}" alt="">`;
      const item = h("div", {
        class: `dock-item ${app.cls || ""}`, "data-app": id || "", role: app.href ? null : "button", tabindex: app.href ? null : "0", "aria-label": app.href ? null : app.name,
        html: (app.href ? `<a href="${app.href}" target="_blank" rel="noopener" aria-label="${app.name}">${inner}</a>` : inner) + `<span class="dock-tip">${app.name}</span><span class="dock-dot"></span>`,
      });
      if (id) {
        const launch = () => {
          if (![...WM.wins.values()].some((w) => w.app === id)) {
            item.classList.remove("bounce"); void item.offsetWidth; item.classList.add("bounce");
            setTimeout(() => item.classList.remove("bounce"), 1400);
          }
          APPS[id].open();
        };
        item.addEventListener("click", launch);
        item.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), launch()));
      }
      dock.append(item);
    };
    const hideSm = new Set(["notes", "photos", "terminal", "settings"]);
    PINNED.forEach((id) => add({ id, name: appName(id), img: appIcon(id), cls: hideSm.has(id) ? "hide-sm" : "" }));
    dock.append(h("div", { class: "dock-sep hide-sm" }));
    LINKS.forEach((l) => add({ ...l, cls: l.name === "X" ? "hide-sm" : "" }));
    dock.append(h("div", { class: "dock-sep hide-sm", id: "dock-mini-sep" }));
    add({ id: "trash", name: appName("trash"), img: appIcon("trash"), cls: "hide-sm" });
    bindMagnify(dock);
  }

  function addMiniToDock(win) {
    const sep = $("#dock-mini-sep");
    const mini = h("div", {
      class: "dock-item mini", role: "button", tabindex: "0", "aria-label": `Restore ${win.title}`,
      html: `<div class="dock-img"><span class="mini-title">${esc(win.title)}</span></div><span class="mini-badge"><img src="${iconFor(win.app, win.icon)}" alt=""></span><span class="dock-tip">${esc(win.title)}</span>`,
      onclick: () => restoreWindow(win),
    });
    sep.after(mini);
    win.dockEl = mini;
    return mini;
  }

  function bindMagnify(dock) {
    if (dock.dataset.bound) return;
    dock.dataset.bound = "1";
    const base = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dock-size")) || 54;
    dock.addEventListener("mousemove", (e) => {
      if (isMobile() || isCoarse()) return;
      dock.classList.remove("idle");
      const b = base();
      for (const item of $$(".dock-item", dock)) {
        const r = item.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const k = Math.max(0, 1 - d / (b * 2.6));
        item.style.setProperty("--s", (b * (1 + 0.55 * Math.sin((k * Math.PI) / 2))).toFixed(1) + "px");
      }
    });
    dock.addEventListener("mouseleave", () => {
      dock.classList.add("idle");
      $$(".dock-item", dock).forEach((i) => i.style.removeProperty("--s"));
    });
  }

  /* ---------------- Windows taskbar ---------------- */

  function activateApp(id) {
    const wins = [...WM.wins.values()].filter((w) => w.app === id);
    if (!wins.length) return APPS[id].open();
    const target = wins.find((w) => w === WM.active) || wins.sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex)[0];
    toggleTask(target);
  }

  function taskButton({ cls, app, img, label, html, onclick, href }) {
    const inner = (html || `<img src="${img}" alt="">`) + `<span class="ind"></span><span class="task-tip">${esc(label)}</span>`;
    if (href) return h("a", { class: cls, href, target: "_blank", rel: "noopener", "aria-label": label, html: inner });
    return h("button", { class: cls, "data-app": app || null, "aria-label": label, html: inner, onclick });
  }

  function renderTaskbar() {
    const tb = $("#taskbar");
    const hideSm = new Set(["notes", "photos", "terminal", "settings"]);
    const apps = h("div", { class: "tb-apps" }, [
      taskButton({ cls: "tb-app tb-start", img: ICONS.win.start, label: "Start", onclick: () => toggleLauncher() }),
      taskButton({ cls: "tb-app tb-searchbtn hide-sm", html: icon("search"), label: "Search", onclick: () => toggleLauncher() }),
      ...PINNED.map((id) => taskButton({ cls: `tb-app ${hideSm.has(id) ? "hide-sm" : ""}`, app: id, img: appIcon(id), label: appName(id), onclick: () => activateApp(id) })),
      ...LINKS.map((l) => taskButton({ cls: `tb-app ${l.name === "X" || l.name === "Telegram" ? "hide-sm" : ""}`, img: l.img, label: l.name, href: l.href })),
      h("div", { class: "tb-extra" }),
    ]);
    const tray = h("div", { class: "tb-tray" }, [
      h("button", { class: "tray-btn hide-sm", "aria-label": "Show hidden icons", html: icon("chevup") }),
      h("span", { class: "tray-btn tray-music", id: "tray-music", hidden: true, html: icon("music") }),
      h("button", { class: "tray-btn tray-sys", "aria-label": "Quick settings", html: TRAY_SVG, onclick: toggleCC }),
      h("button", { class: "tray-btn tray-clock", "aria-label": "Date and time", onclick: toggleCC }, [h("span", { id: "tb-time" }), h("span", { id: "tb-date" })]),
      h("button", { class: "tray-peek", "aria-label": "Show desktop", onclick: showDesktop }),
    ]);
    tb.append(apps, tray);
    tickClock();
  }

  function showDesktop() {
    const open = [...WM.wins.values()].filter((w) => !w.minimized);
    if (open.length) open.forEach(minimizeWindow);
    else [...WM.wins.values()].forEach(restoreWindow);
  }

  /* ---------------- Linux top bar + dock ---------------- */

  function renderLinuxShell() {
    $("#topbar").append(
      h("button", { class: "tp-btn tp-activities", onclick: () => toggleLauncher() }, [h("span", { class: "tp-dots", html: "<i></i><i></i><i></i>" }), h("span", { class: "hide-sm", text: "Activities" })]),
      h("button", { class: "tp-btn tp-clock", id: "tp-clock", onclick: toggleCC }),
      h("div", { class: "tp-right" }, [
        h("span", { class: "tp-btn tp-music", id: "tp-music", hidden: true, html: icon("music") }),
        h("button", { class: "tp-btn tp-ind", "aria-label": "System menu", html: TRAY_SVG + icon("power"), onclick: toggleCC }),
      ])
    );
    const hideSm = new Set(["notes", "photos", "terminal", "settings"]);
    $("#ldock").append(
      ...PINNED.map((id) => taskButton({ cls: `ld-app ${hideSm.has(id) ? "hide-sm" : ""}`, app: id, img: appIcon(id), label: appName(id), onclick: () => activateApp(id) })),
      h("div", { class: "ld-sep hide-sm" }),
      ...LINKS.map((l) => taskButton({ cls: `ld-app ${l.name === "X" || l.name === "Telegram" ? "hide-sm" : ""}`, img: l.img, label: l.name, href: l.href })),
      h("div", { class: "ld-extra" }),
      h("div", { class: "ld-spacer" }),
      taskButton({ cls: "ld-app hide-sm", app: "trash", img: appIcon("trash"), label: appName("trash"), onclick: openTrash }),
      taskButton({ cls: "ld-app ld-showapps", html: '<svg viewBox="0 0 24 24" aria-hidden="true">' + [4, 12, 20].flatMap((y) => [4, 12, 20].map((x) => `<circle cx="${x}" cy="${y}" r="2.2" fill="currentColor"/>`)).join("") + "</svg>", label: "Show Apps", onclick: () => toggleLauncher() })
    );
    tickClock();
  }

  /** Keep running indicators, active state and extra window buttons in sync. */
  function syncTasks() {
    if (!OS) return;
    const running = new Set([...WM.wins.values()].map((w) => w.app));
    if (OS === "mac") {
      $$(".dock-item[data-app]").forEach((d) => d.classList.toggle("running", running.has(d.dataset.app)));
      return;
    }
    const root = OS === "win" ? $("#taskbar") : $("#ldock");
    const cls = OS === "win" ? "tb-app" : "ld-app";
    const activeApp = WM.active && !WM.active.minimized ? WM.active.app : null;
    $$(`.${cls}[data-app]`, root).forEach((el) => {
      el.classList.toggle("running", running.has(el.dataset.app));
      el.classList.toggle("active", el.dataset.app === activeApp);
    });
    const extra = $(OS === "win" ? ".tb-extra" : ".ld-extra", root);
    if (!extra) return;
    extra.innerHTML = "";
    for (const w of WM.wins.values()) {
      if (PINNED.includes(w.app)) continue;
      const b = taskButton({ cls: `${cls} running ${w === WM.active && !w.minimized ? "active" : ""}`, img: iconFor(w.app, w.icon), label: w.title || "Window", onclick: () => toggleTask(w) });
      b.dataset.win = w.id;
      extra.append(b);
    }
  }

  /* ==================================================================
     Menus (menu bar + context + power)
     ================================================================== */

  let openMenuKey = null;

  function closeMenus() {
    $("#menu-layer").innerHTML = "";
    $$(".mb-item.open").forEach((b) => b.classList.remove("open"));
    openMenuKey = null;
  }

  function showMenu(items, x, y, { above = false, alignRight = false } = {}) {
    closeMenus();
    const menu = h("div", { class: "menu", role: "menu" });
    for (const it of items) {
      if (it === "sep") { menu.append(h("div", { class: "menu-sep" })); continue; }
      menu.append(h("button", {
        class: `menu-item ${it.disabled ? "disabled" : ""}`, role: "menuitem", disabled: it.disabled,
        html: `<span><span class="check">${it.checked ? "✓" : ""}</span>${esc(it.label)}</span>${it.kbd ? `<span class="kbd">${it.kbd}</span>` : ""}`,
        onclick: () => { closeMenus(); it.action?.(); },
      }));
    }
    $("#menu-layer").append(menu);
    const r = menu.getBoundingClientRect();
    const left = alignRight ? x - r.width : x;
    const top = above ? y - r.height : y;
    menu.style.left = clamp(left, 4, window.innerWidth - r.width - 4) + "px";
    menu.style.top = clamp(top, 0, window.innerHeight - r.height - 4) + "px";
    return menu;
  }

  function powerMenu(anchor) {
    const r = anchor.getBoundingClientRect();
    const items = [
      { label: pick({ mac: "Switch Operating System…", win: "Switch operating system…", linux: "Switch Operating System…" }), action: () => powerCycle() },
      { label: "Restart", action: () => powerCycle(OS) },
      { label: "Sleep", action: sleep },
    ];
    if (OS === "win") showMenu(items, r.right, r.top - 6, { above: true, alignRight: true });
    else showMenu(items, r.right, r.bottom + 6, { alignRight: true });
  }

  function sleep() {
    closeCC();
    closeLauncher();
    const dim = $("#dimmer");
    dim.style.transition = "opacity .8s ease";
    dim.style.opacity = "1";
    dim.style.pointerEvents = "auto";
    const wake = () => {
      dim.style.opacity = String((1 - brightness) * 0.9);
      dim.style.pointerEvents = "none";
      setTimeout(() => (dim.style.transition = ""), 800);
    };
    setTimeout(() => dim.addEventListener("pointerdown", wake, { once: true }), 300);
  }

  function menuDefs() {
    const go = (k) => () => openFinder(k);
    const link = (u) => () => window.open(u, "_blank", "noopener");
    const wins = [...WM.wins.values()];
    return {
      system: [
        { label: "About This Portfolio", action: openAboutMac },
        "sep",
        { label: "System Settings…", action: openSettings },
        { label: effectiveDark() ? "Light Appearance" : "Dark Appearance", action: toggleDark },
        "sep",
        { label: "Switch Operating System…", action: () => powerCycle() },
        { label: "Sleep", action: sleep },
        { label: "Restart…", action: () => powerCycle("mac") },
      ],
      app: [
        { label: `About ${D.owner.name}`, action: go("about") },
        { label: "Services", action: go("services") },
        "sep",
        { label: "Email Dawit…", action: () => openMail() },
        { label: "Copy Email Address", action: () => copyText(D.owner.email, "Email address") },
      ],
      file: [
        { label: "New Finder Window", action: go("works") },
        { label: "Find…", kbd: "⌘K", action: openLauncher },
        "sep",
        { label: "Close Window", disabled: !WM.active, action: () => closeWindow(WM.active) },
      ],
      edit: [
        { label: "Copy Email Address", action: () => copyText(D.owner.email, "Email address") },
        { label: "Copy Phone Number", action: () => copyText(D.owner.phone, "Phone number") },
        { label: "Copy Link to Portfolio", action: () => copyText(shareUrl(""), "Link") },
      ],
      view: [
        { label: effectiveDark() ? "Use Light Appearance" : "Use Dark Appearance", action: toggleDark },
        { label: "Change Wallpaper…", action: openSettings },
        { label: "Clean Up Desktop", action: cleanUpIcons },
        "sep",
        { label: document.fullscreenElement ? "Exit Full Screen" : "Enter Full Screen", action: toggleFullscreen },
      ],
      go: [
        { label: "About", action: go("about") },
        { label: "Services", action: go("services") },
        { label: "Selected Works", action: go("works") },
        { label: "Gallery", action: go("gallery") },
        "sep",
        { label: "Figma", action: link(D.links.figma) },
        { label: "LinkedIn", action: link(D.links.linkedin) },
        { label: "X", action: link(D.links.x) },
        { label: "Telegram", action: link(D.links.telegram) },
      ],
      window: [
        { label: "Minimize", disabled: !WM.active, action: () => minimizeWindow(WM.active) },
        { label: "Zoom", disabled: !WM.active, action: () => toggleMaximize(WM.active) },
        "sep",
        ...(wins.length
          ? wins.map((w) => ({ label: w.title || "Window", checked: w === WM.active, action: () => { if (w.minimized) restoreWindow(w); focusWindow(w); } }))
          : [{ label: "No Windows", disabled: true }]),
        "sep",
        { label: "Close All", disabled: !wins.length, action: () => wins.forEach((w) => closeWindow(w)) },
      ],
      help: [
        { label: "Keyboard Shortcuts", action: showShortcuts },
        { label: "Open Terminal", action: openTerminal },
        "sep",
        { label: "Contact Dawit…", action: () => openMail() },
      ],
    };
  }

  function openMenubarMenu(btn) {
    const r = btn.getBoundingClientRect();
    showMenu(menuDefs()[btn.dataset.menu], r.left, r.bottom + 4);
    btn.classList.add("open");
    openMenuKey = btn.dataset.menu;
  }

  function bindMenubar() {
    for (const btn of $$("#menubar [data-menu]")) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (openMenuKey === btn.dataset.menu) return closeMenus();
        openMenubarMenu(btn);
      });
      btn.addEventListener("mouseenter", () => {
        if (openMenuKey && openMenuKey !== btn.dataset.menu) openMenubarMenu(btn);
      });
    }
    document.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".menu, #menubar [data-menu]")) closeMenus();
      if (!e.target.closest("#cc-panel, #mb-cc, #mb-clock, .tray-sys, .tray-clock, .tp-clock, .tp-ind, .menu")) closeCC();
      if (!e.target.closest(".sp-box, .start, .ov-search, .ov-body, #mb-spotlight, .tb-start, .tb-searchbtn, .tp-activities, .ld-showapps, .menu")) closeLauncher();
    });
    $("#mb-spotlight").addEventListener("click", () => toggleLauncher());
    $("#mb-cc").addEventListener("click", toggleCC);
    $("#mb-clock").addEventListener("click", toggleCC);
  }

  function showShortcuts() {
    notify({
      title: "Keyboard shortcuts",
      body: "<kbd>⌘/Ctrl</kbd> <kbd>K</kbd> Search<br><kbd>Esc</kbd> Close menus &amp; search<br><kbd>Enter</kbd> Open selected icon<br>Double-click icons to open them",
      timeout: 9000,
    });
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  /* ==================================================================
     Dynamic Island — music player (macOS)
     ================================================================== */

  const audio = $("#audio");
  const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

  function bindIsland() {
    const isl = $("#island");
    const m = D.music;
    $(".isl-art-sm", isl).src = m.artwork;
    $(".isl-art", isl).src = m.artwork;
    $(".isl-title", isl).textContent = m.title;
    $(".isl-artist", isl).textContent = m.artist;

    let hoverTimer;
    const expand = (v) => isl.classList.toggle("expanded", v);
    isl.addEventListener("mouseenter", () => { if (!isCoarse()) { clearTimeout(hoverTimer); expand(true); } });
    isl.addEventListener("mouseleave", () => { if (!isCoarse()) hoverTimer = setTimeout(() => expand(false), 250); });
    isl.addEventListener("click", (e) => { if (!e.target.closest("button, .isl-track")) expand(!isl.classList.contains("expanded")); });
    isl.addEventListener("focusin", () => expand(true));
    isl.addEventListener("focusout", (e) => { if (!isl.contains(e.relatedTarget)) expand(false); });
    document.addEventListener("pointerdown", (e) => { if (!isl.contains(e.target)) expand(false); });

    $$(".isl-btn", isl).forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const act = b.dataset.act;
      if (act === "play") togglePlay();
      if (act === "back") audio.currentTime = Math.max(0, audio.currentTime - 10);
      if (act === "fwd") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    }));
    const track = $(".isl-track", isl);
    track.addEventListener("click", (e) => {
      e.stopPropagation();
      const r = track.getBoundingClientRect();
      if (audio.duration) audio.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * audio.duration;
    });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") audio.currentTime += 5;
      if (e.key === "ArrowLeft") audio.currentTime -= 5;
    });

    audio.addEventListener("timeupdate", () => {
      $(".isl-fill", isl).style.width = (audio.duration ? (audio.currentTime / audio.duration) * 100 : 0) + "%";
      $(".isl-cur", isl).textContent = fmt(audio.currentTime);
      $(".isl-dur", isl).textContent = fmt(audio.duration);
    });
    audio.addEventListener("play", syncPlaying);
    audio.addEventListener("pause", syncPlaying);
  }

  function togglePlay() {
    if (!audio.src) audio.src = D.music.src;
    if (audio.paused) audio.play().catch(() => notify({ title: "Music", body: "Playback was blocked by the browser — tap play again.", timeout: 3000 }));
    else audio.pause();
  }

  function syncPlaying() {
    const playing = !audio.paused;
    $("#island").classList.toggle("playing", playing);
    $(".isl-play").setAttribute("aria-label", playing ? "Pause" : "Play");
    for (const id of ["#mb-music", "#tray-music", "#tp-music"]) { const el = $(id); if (el) el.hidden = !playing; }
    renderCC();
  }

  /* ==================================================================
     Control Center / Quick settings
     ================================================================== */

  let brightness = 1;

  function renderCC() {
    const panel = $("#cc-panel");
    if (!panel || panel.hidden) return;
    const dark = effectiveDark();
    const playing = !audio.paused;
    panel.innerHTML = "";
    panel.append(
      h("div", { class: "cc-tile" }, h("button", { class: `cc-toggle ${dark ? "on" : ""}`, onclick: toggleDark }, [
        h("span", { class: "cc-circle", html: icon(dark ? "moon" : "sun") }),
        h("span", { html: `${pick({ mac: "Dark Mode", win: "Dark mode", linux: "Dark Style" })}<small>${dark ? "On" : "Off"}</small>` }),
      ])),
      h("div", { class: "cc-tile" }, h("button", { class: "cc-toggle", onclick: () => { closeCC(); openSettings(); } }, [
        h("span", { class: "cc-circle", html: icon("image") }),
        h("span", { html: `${pick({ mac: "Wallpaper", win: "Personalize", linux: "Background" })}<small>Change…</small>` }),
      ])),
      h("div", { class: "cc-tile cc-wide" }, [
        h("span", { class: "cc-label", text: pick({ mac: "Display", win: "Brightness", linux: "Brightness" }) }),
        h("input", { class: "cc-range", type: "range", min: "0.35", max: "1", step: "0.01", value: String(brightness), "aria-label": "Display brightness", oninput: (e) => { brightness = +e.target.value; $("#dimmer").style.opacity = String((1 - brightness) * 0.9); } }),
      ]),
      h("div", { class: "cc-tile cc-wide" }, [
        h("span", { class: "cc-label", text: pick({ mac: "Sound", win: "Volume", linux: "Volume" }) }),
        h("input", { class: "cc-range", type: "range", min: "0", max: "1", step: "0.01", value: String(audio.volume), "aria-label": "Volume", oninput: (e) => (audio.volume = +e.target.value) }),
      ]),
      h("div", { class: "cc-tile cc-wide" }, h("div", { class: "cc-now" }, [
        h("img", { src: D.music.artwork, alt: "" }),
        h("div", {}, [h("b", { text: D.music.title }), h("small", { text: playing ? D.music.artist : "Not playing" })]),
        h("button", {
          "aria-label": playing ? "Pause" : "Play",
          html: playing
            ? '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4.5" height="16" rx="1.2" fill="currentColor"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.2" fill="currentColor"/></svg>'
            : '<svg viewBox="0 0 24 24"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.4-7.2c.6-.4.6-1.4 0-1.8L8.6 3.9C7.9 3.5 7 4 7 4.8z" fill="currentColor"/></svg>',
          onclick: togglePlay,
        }),
      ])),
      h("div", { class: "cc-tile cc-wide cc-foot" }, [
        h("button", { class: "cc-user", onclick: () => { closeCC(); openFinder("about"); } }, [h("img", { src: D.owner.photo, alt: "" }), h("span", { text: D.owner.name })]),
        h("button", { class: "cc-power", "aria-label": "Power options", html: icon("power"), onclick: (e) => powerMenu(e.currentTarget) }),
      ])
    );
  }
  function toggleCC() {
    const p = $("#cc-panel");
    closeLauncher();
    p.hidden = !p.hidden;
    renderCC();
  }
  function closeCC() { $("#cc-panel").hidden = true; }

  /* ==================================================================
     Launcher: Spotlight (mac) · Start menu (win) · Activities (linux)
     ================================================================== */

  let spIndex = 0;
  let spItems = [];

  function searchIndex() {
    const items = [];
    for (const [k, p] of Object.entries(PANES)) items.push({ group: "Sections", label: p.label, sub: "Folder", icon: p.icon, keys: p.label, run: () => openFinder(k) });
    for (const p of D.projects) items.push({ group: "Projects", label: p.title, sub: p.category[0], img: p.icon, keys: [p.title, p.label, p.client, ...p.category].join(" "), run: () => openProject(p.slug) });
    for (const id of PINNED) items.push({ group: "Apps", label: appName(id), sub: "App", img: appIcon(id), keys: `${appName(id)} ${id} app`, run: APPS[id].open });
    D.gallery.forEach((g, i) => items.push({ group: "Photos", label: g.title, sub: g.category, img: g.image, keys: `${g.title} ${g.category} photo`, run: () => openPhotos(i) }));
    const acts = [
      ["Email Dawit", "mail", () => openMail(), "contact mail message hire"],
      ["Toggle Dark Mode", "moon", toggleDark, "theme appearance light dark"],
      ["Change Wallpaper", "image", openSettings, "background desktop settings personalize"],
      ["Switch Operating System", "monitor", () => powerCycle(), "os windows linux mac macos ubuntu restart"],
      ["LinkedIn", "external", () => window.open(D.links.linkedin, "_blank", "noopener"), "social"],
      ["Figma", "external", () => window.open(D.links.figma, "_blank", "noopener"), "design files"],
      ["X (Twitter)", "external", () => window.open(D.links.x, "_blank", "noopener"), "social twitter"],
      ["Telegram", "external", () => window.open(D.links.telegram, "_blank", "noopener"), "social message chat"],
    ];
    for (const [label, ic, run, extra] of acts) items.push({ group: "Actions", label, sub: "Action", icon: ic, keys: `${label} ${extra}`, run });
    return items;
  }

  function search(q) {
    const ql = q.trim().toLowerCase();
    return searchIndex()
      .map((i) => {
        const l = i.label.toLowerCase(), k = i.keys.toLowerCase();
        return { ...i, score: l.startsWith(ql) ? 3 : l.includes(ql) ? 2 : k.includes(ql) ? 1 : 0 };
      })
      .filter((i) => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14);
  }

  function renderResults(container, list, topHit) {
    spItems = list;
    spIndex = 0;
    container.innerHTML = "";
    const ul = h("ul", { class: "sp-results", role: "listbox" });
    let lastGroup = null;
    list.forEach((it, n) => {
      const group = topHit && n === 0 ? pick({ mac: "Top Hit", win: "Best match", linux: "Top Result" }) : it.group;
      if (group !== lastGroup) { ul.append(h("li", { class: "sp-group", text: group })); lastGroup = group; }
      ul.append(h("li", {
        class: `sp-item ${n === 0 ? "active" : ""}`, role: "option", "data-n": n,
        onmousemove: () => setSpActive(n),
        onclick: () => runSp(n),
      }, [
        it.img ? h("img", { src: it.img, alt: "" }) : h("span", { class: "sp-ico", html: icon(it.icon) }),
        h("b", { text: it.label }),
        h("small", { text: it.sub }),
      ]));
    });
    if (!list.length) ul.append(h("li", { class: "sp-group", text: "No results" }));
    container.append(ul);
  }

  function tile(cls, img, label, run) {
    return h("button", { class: cls, onclick: () => { closeLauncher(); run(); } }, [h("img", { src: img, alt: "" }), h("span", { text: label })]);
  }

  function launcherDefault(body) {
    spItems = [];
    body.innerHTML = "";
    if (OS === "mac") {
      const all = searchIndex();
      renderResults(body, all.filter((i) => i.group === "Sections").concat(all.filter((i) => i.group === "Projects").slice(0, 4)), false);
      return;
    }
    if (OS === "win") {
      const pinned = [
        ...PINNED.map((id) => tile("start-tile", appIcon(id), appName(id), APPS[id].open)),
        ...D.projects.slice(0, 6).map((p) => tile("start-tile", p.icon, p.label, () => openProject(p.slug))),
      ];
      const rec = [
        ...Object.entries(PANES).map(([k, p]) => h("button", { class: "rec-item", onclick: () => { closeLauncher(); openFinder(k); } }, [h("img", { src: appIcon("folder"), alt: "" }), h("span", {}, [h("b", { text: p.label }), h("small", { text: "Folder" })])])),
        ...D.projects.slice(6, 8).map((p) => h("button", { class: "rec-item", onclick: () => { closeLauncher(); openProject(p.slug); } }, [h("img", { src: p.icon, alt: "" }), h("span", {}, [h("b", { text: p.title }), h("small", { text: `${p.client} · ${p.timeline}` })])])),
      ];
      body.append(
        h("div", { class: "start-h" }, [h("span", { text: "Pinned" }), h("button", { class: "start-all", text: "All projects ›", onclick: () => { closeLauncher(); openFinder("works"); } })]),
        h("div", { class: "start-grid" }, pinned),
        h("div", { class: "start-h" }, [h("span", { text: "Recommended" })]),
        h("div", { class: "start-rec" }, rec)
      );
      return;
    }
    body.append(h("div", { class: "ov-grid" }, [
      ...PINNED.map((id) => tile("ov-tile", appIcon(id), appName(id), APPS[id].open)),
      ...D.projects.map((p) => tile("ov-tile", p.icon, p.label, () => openProject(p.slug))),
      ...Object.entries(PANES).map(([k, p]) => tile("ov-tile", appIcon("folder"), p.label, () => openFinder(k))),
    ]));
  }

  function openLauncher() {
    closeMenus();
    closeCC();
    const L = $("#launcher");
    L.hidden = false;
    L.innerHTML = "";
    const input = h("input", { class: "sp-input", type: "text", autocomplete: "off", spellcheck: "false", "aria-label": "Search" });
    let body;
    if (OS === "win") {
      input.placeholder = "Search for apps, projects and settings";
      body = h("div", { class: "start-body" });
      L.append(h("div", { class: "start", role: "dialog", "aria-label": "Start" }, [
        h("div", { class: "start-search" }, [h("span", { html: icon("search") }), input]),
        body,
        h("div", { class: "start-foot" }, [
          h("button", { class: "start-user", onclick: () => { closeLauncher(); openFinder("about"); } }, [h("img", { src: D.owner.photo, alt: "" }), h("span", { text: D.owner.name })]),
          h("button", { class: "start-power", "aria-label": "Power", html: icon("power"), onclick: (e) => powerMenu(e.currentTarget) }),
        ]),
      ]));
    } else if (OS === "linux") {
      input.placeholder = "Type to search";
      body = h("div", { class: "ov-body" });
      L.append(h("div", { class: "overview", role: "dialog", "aria-label": "Activities" }, [
        h("div", { class: "ov-search" }, [h("span", { html: icon("search") }), input]),
        body,
      ]));
    } else {
      input.placeholder = "Spotlight Search";
      body = h("div", { class: "sp-body" });
      L.append(h("div", { class: "sp-box", role: "dialog", "aria-label": "Spotlight Search" }, [
        h("div", { class: "sp-input-row" }, [h("span", { html: icon("search") }), input]),
        body,
      ]));
    }
    launcherDefault(body);
    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (!q) launcherDefault(body);
      else renderResults(body, search(q), true);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSpActive(Math.min(spIndex + 1, spItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSpActive(Math.max(spIndex - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); runSp(spIndex); }
    });
    $$(".tb-start, .tp-activities").forEach((b) => b.classList.add("open"));
    setTimeout(() => input.focus(), 10);
  }
  function closeLauncher() {
    const L = $("#launcher");
    if (L.hidden) return;
    L.hidden = true;
    L.innerHTML = "";
    $$(".tb-start, .tp-activities").forEach((b) => b.classList.remove("open"));
  }
  function toggleLauncher() { $("#launcher").hidden ? openLauncher() : closeLauncher(); }

  function setSpActive(n) {
    if (!spItems.length) return;
    spIndex = n;
    $$(".sp-item").forEach((li) => li.classList.toggle("active", +li.dataset.n === n));
    $(`.sp-item[data-n="${n}"]`)?.scrollIntoView({ block: "nearest" });
  }
  function runSp(n) {
    const it = spItems[n];
    if (!it) return;
    closeLauncher();
    it.run();
  }

  /* ==================================================================
     Boot · OS picker · OS splash · power cycling
     ================================================================== */

  function bootLoader() {
    const el = $("#boot");
    if (session.get("dt-booted") === "1") { el.remove(); return Promise.resolve(); }
    const bar = $(".boot-bar span", el);
    const assets = ["assets/img/wallpaper-tahoe.jpg", "assets/img/wall-win11.jpg", "assets/img/wall-ubuntu-crown.jpg", D.owner.photo, ...D.projects.map((p) => p.icon)];
    let loaded = 0;
    const loads = assets.map((src) => new Promise((res) => {
      const i = new Image();
      i.onload = i.onerror = () => { loaded++; bar.style.width = Math.round((loaded / assets.length) * 85) + "%"; res(); };
      i.src = src;
    }));
    const minTime = new Promise((r) => setTimeout(r, 1300));
    const maxTime = new Promise((r) => setTimeout(r, 6000));
    return Promise.race([Promise.all([Promise.all(loads), minTime]), maxTime]).then(() => {
      bar.style.width = "100%";
      return new Promise((r) => setTimeout(() => {
        el.classList.add("done");
        session.set("dt-booted", "1");
        setTimeout(() => { el.remove(); r(); }, 500);
      }, 250));
    });
  }

  const PICKER = {
    mac: { tagline: "Menu bar, Dock & Spotlight", chips: ["Finder", "Spotlight", "Dynamic Island"], color: "#8cc8ff", wall: "tahoe" },
    win: { tagline: "Start menu, taskbar & Explorer", chips: ["Start", "File Explorer", "Notepad"], color: "#4cc2ff", wall: "win11" },
    linux: { tagline: "Ubuntu-style GNOME desktop", chips: ["Activities", "Files", "Terminal"], color: "#ff7a45", wall: "ubuntu-crown" },
  };

  /** A small, realistic desktop for each OS: real wallpaper, icons and project art. */
  function miniShot(os) {
    const wall = D.wallpapers.find((w) => w.id === PICKER[os].wall);
    const ic = (src) => `<img src="${src}" alt="">`;
    const tiles = D.projects.slice(0, 6).map((p) => `<i style="background-image:url(${p.icon})"></i>`).join("");
    const side = "<b></b><b></b><b></b><b></b>";
    const winBody = `<div class="pv-body"><div class="pv-side">${side}</div><div class="pv-grid">${tiles}</div></div>`;
    const bg = `<div class="pv-wall" style="background-image:${wallCss(wall).replace(/"/g, "'")}"></div>`;

    if (os === "mac") {
      const m = ICONS.mac;
      return `<div class="pv pv-mac">${bg}
        <div class="pv-bar"><span class="pv-dot"></span><b></b><b></b><b></b><em></em></div>
        <div class="pv-win"><div class="pv-tb"><u class="r"></u><u class="y"></u><u class="g"></u></div>${winBody}</div>
        <div class="pv-dock">${[m.finder, m.photos, m.mail, m.terminal, m.settings, "assets/img/dock-figma.jpg", "assets/img/dock-linkedin.webp"].map(ic).join("")}</div></div>`;
    }
    if (os === "win") {
      const w = ICONS.win;
      return `<div class="pv pv-win11">${bg}
        <div class="pv-win"><div class="pv-tb"><span class="pv-tab"></span><span class="pv-ctl"><u></u><u></u><u class="x"></u></span></div>${winBody}</div>
        <div class="pv-task">${[w.start, w.finder, w.notes, w.photos, w.mail, w.terminal, w.settings].map(ic).join("")}<em></em></div></div>`;
    }
    const l = ICONS.linux;
    return `<div class="pv pv-lx">${bg}
      <div class="pv-bar"><span class="pv-pill"></span><b></b><em></em></div>
      <div class="pv-ldock">${[l.finder, l.notes, l.photos, l.mail, l.terminal].map(ic).join("")}</div>
      <div class="pv-win"><div class="pv-tb"><span class="pv-title"></span><span class="pv-ctl"><u></u><u></u><u class="x"></u></span></div>${winBody}</div></div>`;
  }

  function showPicker() {
    const el = $("#picker");
    el.hidden = false;
    el.classList.remove("out");
    el.innerHTML = "";
    const last = store.get("dt-os-last", "mac");
    const remembered = store.get("dt-os-remember", null);
    const order = ["mac", "win", "linux"];

    const remember = h("input", { type: "checkbox", id: "pk-remember", checked: remembered ? true : null });
    const layers = order.map((os) => {
      const wall = D.wallpapers.find((w) => w.id === PICKER[os].wall);
      return h("div", { class: "pk-bgl", "data-os": os, style: { backgroundImage: wallCss(wall) } });
    });
    const setBg = (os) => layers.forEach((l) => l.classList.toggle("on", l.dataset.os === os));

    const cards = order.map((os, i) => {
      const info = PICKER[os];
      const card = h("button", {
        class: "pk-card", "data-os": os, style: { "--c": info.color, "--i": i }, "aria-label": `Start ${OS_META[os].name}`,
        onclick: () => choose(os),
        html: `
          <div class="pk-shot">${miniShot(os)}<span class="pk-key">${i + 1}</span></div>
          <div class="pk-info">
            <div class="pk-title"><span class="pk-logo">${OS_LOGO[os]}</span><span class="pk-name">${OS_META[os].name}</span><span class="pk-go" aria-hidden="true">${icon("right")}</span></div>
            <p class="pk-desc">${info.tagline}</p>
            <div class="pk-chips">${info.chips.map((c) => `<span>${c}</span>`).join("")}</div>
          </div>`,
      });
      if (!isCoarse()) {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.setProperty("--ry", ((px - 0.5) * 9).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - py) * 7).toFixed(2) + "deg");
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        });
        card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
      }
      card.addEventListener("pointerenter", () => setBg(os));
      card.addEventListener("focus", () => setBg(os));
      return card;
    });

    el.append(
      h("div", { class: "pk-bg", "aria-hidden": "true" }, [...layers, h("div", { class: "pk-veil" }), h("div", { class: "pk-grain" })]),
      h("div", { class: "pk-brand" }, [h("span", { class: "pk-mono", html: MONOGRAM }), h("span", { text: D.owner.name })]),
      h("div", { class: "pk-inner" }, [
        h("div", { class: "pk-head" }, [
          h("div", { class: "pk-eyebrow" }, [h("img", { src: D.owner.photo, alt: "" }), h("span", { text: `${D.owner.title}` })]),
          h("h1", { html: "Choose your <span>operating system</span>" }),
          h("p", { text: "One portfolio, three desktops. Pick the one you feel at home in — you can switch any time from the power menu." }),
        ]),
        h("div", { class: "pk-grid", role: "group", "aria-label": "Operating systems" }, cards),
        h("div", { class: "pk-foot" }, [
          h("label", { class: "pk-remember" }, [remember, h("span", { class: "pk-switch" }), h("span", { text: "Remember my choice" })]),
          h("span", { class: "pk-hint hide-sm", html: "Press <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> or use <kbd>←</kbd> <kbd>→</kbd> <kbd>Enter</kbd>" }),
        ]),
      ])
    );

    setBg(last);
    setTimeout(() => cards[Math.max(0, order.indexOf(last))]?.focus({ preventScroll: true }), 650);

    el.onkeydown = (e) => {
      const i = cards.indexOf(document.activeElement);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); cards[(i + 1 + cards.length) % cards.length].focus(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); cards[(i - 1 + cards.length) % cards.length].focus(); }
      if (["1", "2", "3"].includes(e.key) && e.target.tagName !== "INPUT") choose(order[+e.key - 1]);
    };

    function choose(os) {
      if (remember.checked) store.set("dt-os-remember", os);
      else store.del("dt-os-remember");
      store.set("dt-os-last", os);
      el.onkeydown = null;
      el.classList.add("out");
      setTimeout(() => { el.hidden = true; el.innerHTML = ""; }, 600);
      startOS(os);
    }
  }

  function runSplash(os) {
    const el = $("#os-splash");
    el.className = "splash-" + os;
    el.innerHTML = {
      mac: `<div class="sp-logo">${MONOGRAM}</div><div class="boot-bar"><span class="fill"></span></div>`,
      win: `<div class="sp-logo sp-win">${OS_LOGO.win}</div><div class="win-spin">${"<i></i>".repeat(5)}</div>`,
      linux: `<div class="sp-logo sp-linux">${OS_LOGO.linux}</div><div class="lx-name">${esc(D.owner.name)}</div><div class="lx-dots">${"<i></i>".repeat(5)}</div>`,
    }[os];
    el.hidden = false;
    el.style.opacity = "1";
    return new Promise((r) => setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => { el.hidden = true; el.innerHTML = ""; r(); }, 450);
    }, os === "mac" ? 1500 : 2000));
  }

  function applyOS(os) {
    OS = os;
    document.documentElement.dataset.os = os;
    applyWallpaper(currentWall(), false);
    renderShell();
    renderIcons();
    tickClock();
  }

  function welcome() {
    const touch = isMobile() || isCoarse();
    const how = touch ? "Tap any project to open it." : pick({
      mac: "Double-click a project to open it, or press <kbd>⌘</kbd> <kbd>K</kbd> to search.",
      win: "Double-click a project to open it, or click <b>Start</b> to search.",
      linux: "Double-click a project to open it, or open <b>Activities</b> to search.",
    });
    notify({
      title: `${D.owner.name} · ${OS_META[OS].name}`,
      body: `Welcome! ${how}<br>Switch OS any time from the power menu.`,
      timeout: 8000,
    });
  }

  function startOS(os, splash = true) {
    session.set("dt-os", os);
    const ready = splash ? runSplash(os) : Promise.resolve();
    if (splash) setTimeout(() => applyOS(os), 300);
    else applyOS(os);
    return ready.then(() => {
      const routed = route();
      if (splash && !routed) setTimeout(welcome, 300);
    });
  }

  /** Close everything and either reboot into `nextOS` or show the picker. */
  function powerCycle(nextOS) {
    closeMenus();
    closeCC();
    closeLauncher();
    closeAllWindows();
    audio.pause();
    $$(".notif").forEach((n) => n.remove());
    if (nextOS) startOS(nextOS);
    else {
      session.del("dt-os");
      showPicker();
    }
  }

  /* ==================================================================
     Keyboard + routing + init
     ================================================================== */

  function bindKeys() {
    let superAlone = false;
    document.addEventListener("keydown", (e) => {
      if (!OS) return;
      const mod = e.metaKey || e.ctrlKey;
      superAlone = e.key === "Meta" || e.key === "OS";
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleLauncher();
      }
      if (e.key === "Escape") {
        if (!$("#launcher").hidden) return closeLauncher();
        if ($("#menu-layer").childElementCount) return closeMenus();
        if (!$("#cc-panel").hidden) return closeCC();
        $("#island").classList.remove("expanded");
      }
    });
    document.addEventListener("keyup", (e) => {
      // Tapping the Windows / Super key alone opens Start or Activities.
      if (superAlone && (e.key === "Meta" || e.key === "OS") && OS !== "mac") toggleLauncher();
      superAlone = false;
    });
  }

  function shareUrl(hash) { return location.origin + location.pathname + hash; }
  function setHash(hash) {
    try { history.replaceState(null, "", hash || location.pathname + location.search); } catch { /* file:// or sandbox */ }
  }
  function route() {
    const m = location.hash.match(/^#\/(work|about|services|works|gallery)(?:\/([\w-]+))?/);
    if (!m) return false;
    if (m[1] === "work" && m[2]) openProject(m[2]);
    else openFinder(m[1] === "work" ? "works" : m[1]);
    return true;
  }

  function init() {
    const theme = store.get("dt-theme", "auto");
    if (theme !== "auto") document.documentElement.dataset.theme = theme;
    setInterval(tickClock, 10000);
    bindDesktop();
    bindMenubar();
    bindIsland();
    bindKeys();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { renderCC(); refreshOpen("settings"); });
    window.addEventListener("hashchange", () => OS && route());

    // ?os=mac|windows|linux opens straight into that OS (shareable links).
    const param = { mac: "mac", macos: "mac", windows: "win", win: "win", linux: "linux", ubuntu: "linux" }[
      (new URLSearchParams(location.search).get("os") || "").toLowerCase()
    ];

    bootLoader().then(() => {
      if (param) return startOS(param, session.get("dt-os") !== param);
      const current = session.get("dt-os");
      const remembered = store.get("dt-os-remember", null);
      if (current && OS_META[current]) return startOS(current, false);
      if (remembered && OS_META[remembered]) return startOS(remembered);
      showPicker();
    });
  }

  init();
})();
