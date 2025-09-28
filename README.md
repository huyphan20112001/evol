# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules. See the original template for examples and recommended settings.

---

## Quickstart — run locally

These steps assume you have Node.js (16+), a package manager (pnpm, npm or yarn), and Git installed.

1. Install dependencies (pnpm is preferred in this repo because a lockfile is present):

```bash
pnpm install
# or with npm
# npm install
```

1. Start the dev server (Vite + React):

```bash
pnpm dev
# or with npm
# npm run dev
```

1. Open http://localhost:5173 in your browser. Vite will print the actual port if different.

### Build for production

```bash
pnpm build
# or with npm
# npm run build
```

This runs TypeScript build then runs the Vite build. The output will be in `dist/`.

---

## iOS — open and run in Xcode

This repository includes Capacitor and an `ios/` native project. To run the iOS app in Xcode follow these steps.

Prerequisites:

- Xcode (latest stable recommended)
- CocoaPods (installed on your Mac)
- Node.js and the project dependencies installed (see Quickstart above)

Steps:

1. Ensure dependencies are installed in the JS project root:

```bash
pnpm install
```

1. If you make native-related changes (new plugins, changed web assets), sync Capacitor to the native projects:

```bash
pnpm cap:sync
# this runs: npx cap sync
```

1. Install CocoaPods for the iOS workspace (from the `ios/App` folder):

```bash
cd ios/App
pod install
cd -
```

Note: If you run into permission or missing Ruby/CocoaPods issues, follow standard CocoaPods troubleshooting: ensure Ruby is properly installed (use rbenv, asdf, system Ruby, or Homebrew), then `gem install cocoapods` or `brew install cocoapods`.

1. Open the Xcode workspace (NOT the project file) and run the app on a simulator or device:

```bash
open ios/App/App.xcworkspace
```

In Xcode:

- Select a target device or simulator (e.g., iPhone 15 simulator).
- Select a signing team in the project settings if you plan to run on a physical device.
- Build and Run (Cmd+R).

### Troubleshooting tips

- If you see build errors related to CocoaPods or dependencies, run `pod install` again inside `ios/App` and re-open the workspace.
- If the native build fails because web assets are missing or stale, run `pnpm build` (or `pnpm cap:sync`) to copy the latest web assets into the native app, then rebuild in Xcode.
- For simulator runtime permission errors (e.g., location), check the `Info.plist` entries in Xcode and ensure the required usage descriptions exist.

---

## Useful scripts

From the project root you can run the scripts defined in `package.json`:

- `pnpm dev` — start the Vite dev server
- `pnpm build` — typecheck + build web assets
- `pnpm test` — run Vitest unit tests
- `pnpm cap:sync` — run `npx cap sync` to push web code and dependencies to native projects
