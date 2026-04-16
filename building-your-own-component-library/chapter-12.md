---
title: 'Packaging and distribution'
description: 'Your library works in Storybook. Your tests pass. Now you need to package it so other projects can install and use it.'
order: 12
---

## Configure Vite library mode

Vite's library mode produces a clean build output with ECMAScript module (ESM) exports and TypeScript declarations. `vite-plugin-dts` generates `.d.ts` TypeScript declaration files alongside the compiled output so consumers get full type information without needing access to the library source. Install it:

```bash
npm install -D vite-plugin-dts
```

Update `vite.config.ts` to add library build configuration:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'] })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
```

The `external` array tells Vite not to bundle React into the library output. The consuming project provides its own React. This prevents duplicate React instances, which cause hook errors.

## Configure `package.json` exports

Configure `package.json` for ESM consumption:

```json
{
  "name": "rudiment-ui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "vite build",
    "build:tokens": "style-dictionary build --config tokens/style-dictionary.config.js",
    "build:storybook": "storybook build -o storybook-static",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/style.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "sideEffects": ["**/*.css"]
}
```

The `exports` field defines the public API. Consumers import components from the main entry (`import { Button } from 'rudiment-ui'`) and styles from the CSS entry (`import 'rudiment-ui/styles'`). The `sideEffects` field tells bundlers not to tree-shake the CSS import.

The `build:storybook` script here is the named form of the `npm run build:storybook` command introduced in Chapter 10. Using the same script name in both places keeps the commands consistent across the project.

## Build and verify

```bash
npm run build
```

Vite generates `dist/index.js` (the library code), `dist/index.d.ts` (TypeScript declarations), and `dist/style.css` (the compiled CSS). Verify the output by checking that the exports resolve correctly:

```bash
node -e "import('file://' + process.cwd() + '/dist/index.js').then(m => console.log(Object.keys(m)))"
```

This prints the names of every exported component and utility.

## Publish your library

If you're distributing the library as a template repository (source code that the consumer clones, owns, and modifies), you're not publishing to npm. The consumer works with the source directly. The Vite build configuration is there for when they want to package their customized library for internal distribution within their own organization.

If you're publishing to npm for external consumers who install the library as a dependency, the process is:

```bash
npm login
npm publish
```

Prefix the package name with your npm scope if needed: `@your-scope/rudiment-ui`.

## Apply semantic versioning

For a component library, the versioning rules are:

**Major (1.0.0 -> 2.0.0):** A component's prop interface changes in a way that breaks existing usage. A prop is removed or renamed. The rendered HTML structure changes in a way that breaks consumer CSS selectors. A token name changes.

**Minor (1.0.0 -> 1.1.0):** A new component is added. A new prop is added to an existing component with a default value that preserves existing behavior. A new token is added.

**Patch (1.0.0 -> 1.0.1):** A bug is fixed without changing the API. A dependency is updated. A documentation error is corrected.

Write a `CHANGELOG.md` that describes each release in human-readable terms. Consuming teams use the changelog to decide whether to upgrade and what to test after upgrading.

## What you have now

A publishable library package with ESM output, TypeScript declarations, a configured `package.json` exports map, and a versioned release workflow. The library is ready to be distributed as a template repository or published to npm. Chapter 13 covers the final layer: dark mode token overrides, expanding the component set, and aligning the token system with Figma.
