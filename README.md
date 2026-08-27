# SPARQL Browser Extension

A browser extension for running and storing SPARQL queries in multiple collections, against remote endpoints.

## Stack

- WXT
- React 19
- TypeScript
- Tailwind CSS 4
- Dexie (IndexedDB)
- TanStack Table v9

## Getting Started

```bash
bun install
bun run dev
```

This starts a dev server and opens the browser with the extension loaded.

## Scripts

| Command                  | Description                       |
| ------------------------ | --------------------------------- |
| `bun run dev`            | Dev server (Chrome)               |
| `bun run dev:firefox`    | Dev server (Firefox)              |
| `bun run build`          | Production build (Chrome)         |
| `bun run build:firefox`  | Production build (Firefox)        |
| `bun run zip`            | Zip for store publishing          |
| `bun run compile`        | Typecheck (`tsc --noEmit`)        |
