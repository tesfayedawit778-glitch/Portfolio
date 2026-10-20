# Dawit Tesfaye — multi-OS portfolio

A hand-coded clone of https://dawitdesign.framer.website/, rebuilt as a desktop OS.
After loading, visitors choose **macOS**, **Windows** or **Linux** (Ubuntu/GNOME style).
Plain HTML, CSS and JavaScript: no build step and no dependencies.

## Run locally

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Edit content

Everything you'd normally change is in `assets/js/data.js`: bio, contact, social links,
projects (text, icon, desktop position, screenshots), services, gallery and wallpapers.

- Each project's `x` / `y` is its default desktop position as a % of the screen.
- Add case-study screens to a project's `shots` array. Without them, the project
  window links to your Figma files instead.
- Images live in `assets/img/`, and the music player track is `assets/audio/lofi.mp3`.

## Operating systems

- Visitors pick an OS after the loading screen (with an optional "Remember my choice").
- Link straight to one with `?os=mac`, `?os=windows` or `?os=linux` (e.g. `index.html?os=windows#/work/blih-erp`).
- Switch any time: power menu (Start / quick settings / Apple-style menu), Settings → Operating System,
  right-click the desktop, or type `os linux` in Terminal.
- Default wallpaper per OS is set in `defaultWallpaper` in `data.js` (Windows 11 bloom, Ubuntu crown; Ubuntu jellyfish is in the list too).

## Deploy

Upload the folder as-is to any static host (Netlify drop, Vercel, GitHub Pages, Cloudflare Pages).

## Features

OS picker with per-OS boot splash · Windows: taskbar, Start menu with search, File Explorer, Notepad,
PowerShell, quick settings, Recycle Bin · Linux: top bar, Activities overview + app grid, left dock, Files,
Text Editor, GNOME headerbars, aubergine Terminal · macOS: boot screen · menu bar with working menus · live clock · Dynamic Island music player ·
draggable desktop icons with rubber-band selection (positions are remembered) · draggable,
resizable windows with close, minimize-to-Dock and zoom · Dock magnification ·
Finder (About / Services / Selected Works / Gallery) · project windows · Photos · Notes ·
Mail compose · Terminal · System Settings (light/dark mode, wallpapers) · Control Center ·
Spotlight (⌘K) · right-click menus · deep links (`#/work/<slug>`, `#/about`) ·
iOS-style home screen on phones.
