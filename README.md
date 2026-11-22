# JSON Compare

A client-side JSON comparison app built with React, Vite, JavaScript, and Material UI.

## Run locally

1. Install Node.js 18+.
2. In this directory run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

## Build for production

Run `npm run build`. The production output is written to `dist/`.

## Project structure

- `src/components/` — reusable editor and diff result UI
- `src/utils/` — JSON parsing/formatting and deep comparison logic
- `src/styles/` — global responsive styles
- `src/theme.js` — Material UI theme
- `src/App.jsx` — application composition and state

## Comparison behavior

- Object key order does not matter.
- Array order matters.
- Reports added, removed, changed, and type-changed values.
- Paths use JSON Pointer-style escaping for object keys.
- JSON content is processed in the browser; there is no API or upload endpoint.

## Notes

Material UI is a React component library, so this project uses React with JavaScript rather than plain DOM scripting. The UI and comparison logic are separated to keep the code maintainable.
