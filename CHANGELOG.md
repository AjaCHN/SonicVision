# Changelog

All notable changes to the **Aura Vision** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0] - Robustness and Alignment

### Added
*   **Audio Fingerprinting Overhaul:** Reworked `core/services/fingerprintService.ts` to accurately capture FFT data using a `ScriptProcessorNode` within an `OfflineAudioContext`, significantly improving local song matching.
*   **Changelog Update:** Documented all major changes for `v1.0.0` to provide a clear and concise history of project evolution.
*   **SEO & Analytics Restoration:** Re-added Google Search Console verification meta tag and Google Analytics (gtag.js) tracking code to `index.html` for better discoverability and traffic analysis.

### Changed
*   **Build System Alignment:** Removed `importmap` and CDN scripts from `index.html` to fully align with Vite's build process, ensuring compliance with OpenSpec.
*   **Web Worker Reliability:** Fixed `NebulaRenderer` in `core/workers/visualizer.worker.ts` to correctly use `OffscreenCanvas` in the worker context, preventing crashes in scenarios where `document` is unavailable.
*   **AI Policy Refinement:** Improved system instructions and response schemas in `core/services/geminiService.ts` for clearer linguistic adaptation (original script with parenthetical translations) and consistent branding ("Aura Vision AI Synesthesia Engine").
*   **Version Consistency:** Synchronized `APP_VERSION` in `core/constants/index.ts` and `README.md` to `1.0.0` to match `package.json`.
*   **Type System Cleanup:** Removed redundant `vite-env.d.ts` as `tsconfig.json` now correctly imports Vite client types, streamlining the TypeScript configuration.
*   **UX/UI Improvement:** Enhanced `SettingsToggle` component in `components/controls/ControlWidgets.tsx` to ensure consistent `w-full` application for header elements across variants.

## [v0.8.0] - Neural Pulse

### Added
*   **🚀 Offscreen Architecture:** Migrated all 2D visualization engines (Plasma, Particles, etc.) to a dedicated **Web Worker** using `OffscreenCanvas`. This decouples rendering from the main UI thread, ensuring consistent frame rates even during heavy UI interaction.
*   **🥁 True Beat Detection:** Implemented a **Spectral Flux** algorithm in the worker thread to accurately detect musical onsets (beats) instead of simple volume thresholds.
*   **🌏 Deep Localization:** AI recognition now returns mood descriptions and song metadata optimized for the user's selected language (e.g., Chinese mood tags for Chinese users).
*   **🛡️ Provider Robustness:** Added fail-safe handling for alternative AI providers (Grok, DeepSeek) in the backend service to prevent crashes.

### Changed
*   **🔧 Performance:** Optimized particle systems to use typed arrays and object pooling within the worker context.
*   **🐛 Bug Fix:** Fixed a potential race condition in `AudioContext` resuming on mobile devices.

## [v0.7.5] - AI Synesthesia Engine

### Added
*   **🌍 Global Localization:** Complete overhaul of internationalization dictionaries. Added professional translations for Japanese (ja), Spanish (es), Korean (ko), German (de), French (fr), Russian (ru), and Arabic (ar).
*   **🎨 Branding:** Formal establishment of the **AI Synesthesia Engine** branding identity across the UI and OpenSpec documentation.
*   **📋 OpenSpec:** Updated full specification suite (Architecture, Audio, Rendering, AI) to match v0.7.5 standards.

### Changed
*   **🛡️ Robustness:** Enhanced the main loop to strictly handle `undefined` values in color arrays during theme transitions, preventing potential render crashes.

## [v0.7.3] - Error Recovery Update

### Fixed
*   **🐛 Type Safety:** Fixed TypeScript compilation issues in `ErrorBoundary.tsx` by explicitly defining `state` and `props` types for the React class component.
*   **🔄 Auto-Recovery:** Added a "Factory Reset" mechanism to the global Error Boundary, allowing users to wipe corrupted LocalStorage settings if the app crashes on boot.

## [v0.7.2] - WebGL Context Stability

### Changed
*   **🖼️ GPU Handling:** Implemented `webglcontextlost` and `webglcontextrestored` event listeners in `ThreeVisualizer` to gracefully handle GPU resets (common on mobile devices when switching apps).
*   **🔊 Audio State:** Added visibility change listeners to automatically `resume()` the `AudioContext` when the tab returns to focus, fixing "silent" resume issues on iOS.

## [v0.7.1] - Mobile Performance Patch

### Fixed
*   **🔧 Asset Reliability:** Removed dependency on external HDR environment presets in "Liquid Sphere" mode. This fixes intermittent loading failures and out-of-memory crashes on low-end Android devices.

### Changed
*   **💡 Lighting System:** Replaced heavy IBL (Image Based Lighting) with a performance-optimized, multi-source local point light rig.

## [v0.7.0] - The "Aura" Rebirth

### Added
*   **✨ UI Overhaul:** Introduced the new 3-column "Control Center" layout (Visual / Audio / System).
*   **🧠 Gemini Integration:** First stable release featuring Google Gemini 3.0 Flash for real-time song identification and lyric fetching.
*   **🌊 WebGL Engines:** Added `SilkWaves`, `LiquidSphere`, and `LowPolyTerrain` 3D modes using `@react-three/fiber`.
*   **🎤 Audio Engine:** Rewrote the FFT analysis engine with customizable smoothing and sensitivity.

## [v0.6.0] - Interaction & Accessibility

### Added
*   **⌨️ Shortcuts:** Implemented global keyboard shortcut manager (`Space`, `F`, `H`, `R`, `L`).
*   **❓ Help System:** Added the "Help & Info" modal with usage guides and keyboard maps.
*   **💡 Tooltips:** Added floating tooltips for all UI controls to explain functionality.
*   **📱 Mobile:** Added `useIdleTimer` to auto-hide UI controls on touch devices for a cleaner view.

### Changed
*   **🎨 UI:** Refactored control panel widgets (`Slider`, `Toggle`) into reusable components.

## [v0.5.0] - The 3D Experiment

### Added
*   **🧊 Three.js:** Initial integration of `Three.js` and `@react-three/fiber` for experimental 3D rendering.
*   **🌀 Modes:** Added `Tunnel` and `Rings` 2D canvas modes.
*   **📊 Performance:** Added `FPSCounter` component for performance monitoring.

### Fixed
*   **🍎 Safari:** Fixed `AudioContext` suspension issues requiring user gesture activation.

## [v0.4.0] - Persistence & Identity

### Added
*   **💾 Persistence:** Implemented `useLocalStorage` hook to save user settings (Sensitivity, Mode, Theme) between sessions.
*   **✍️ Custom Text:** Added `CustomTextOverlay` allowing streamers to add their own branding on top of visuals.
*   **🌐 i18n:** Added dual-language support foundation (English / Simplified Chinese).

## [v0.3.0] - Core Audio Engine

### Added
*   **🎛️ Audio Controls:** Added UI controls for `FFT Size` (Resolution) and `Smoothing` (Damping).
*   **🎨 Color Themes:** Introduced the first set of 6 selectable color palettes.
*   **🖥️ Fullscreen:** Added Fullscreen toggle functionality.

### Changed
*   **⚡ Build:** Migrated from `create-react-app` to `Vite` for faster development and build performance.

## [v0.2.0] - Visual Expansion

### Added
*   **✨ New Modes:** Added `Plasma` (gradients) and `Particles` (starfield) rendering strategies.
*   **🌟 Effects:** Added basic "Glow" effect using Canvas `shadowBlur` (CPU intensive but pretty).
*   **📉 Optimization:** Improved `Canvas` rendering loop using `requestAnimationFrame` best practices.

## [v0.1.0] - Genesis

### Added
*   **🎤 Audio Input:** Basic microphone input handling via Web Audio API `createMediaStreamSource`.
*   **📊 Analyzer:** Basic `AnalyserNode` setup for extracting frequency data.
*   **📈 Visualizer:** Initial `Bars` frequency visualizer implementation using Canvas 2D API.
*   **⚛️ Setup:** Initial project scaffolding with React and TypeScript.