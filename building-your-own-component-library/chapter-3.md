---
title: 'Design tokens from scratch'
description: This chapter builds the token system that every component and layout primitive will reference.
order: 3
---

This chapter builds the token system that every component and layout primitive will reference. By the end, you'll have a `tokens.json` source file, a Style Dictionary pipeline that generates CSS custom properties, and a Tailwind `@theme` block that maps those properties to utility classes.

## Install Style Dictionary

```bash
npm install -D style-dictionary@4
```

This guide uses Style Dictionary v4. Version 5 exists and uses a compatible configuration format, but the examples here use v4.

## Create the token source file

Create `tokens/tokens.json`. This is the single source of truth for every visual and layout value in the system.

The file uses the [DTCG format](https://design-tokens.github.io/community-group/format/). Each token has a `$value` (the actual value) and a `$type` (the kind of value). Tokens can reference other tokens using curly braces: `{color.blue.500}`. The DTCG format is the community standard for design token interchange. Style Dictionary v4 includes first-class support for it.

Start with the global tokens (tier 1):

```json
{
  "color": {
    "blue": {
      "50": { "$value": "#EFF6FF", "$type": "color" },
      "100": { "$value": "#DBEAFE", "$type": "color" },
      "200": { "$value": "#BFDBFE", "$type": "color" },
      "300": { "$value": "#93C5FD", "$type": "color" },
      "400": { "$value": "#60A5FA", "$type": "color" },
      "500": { "$value": "#3B82F6", "$type": "color" },
      "600": { "$value": "#2563EB", "$type": "color" },
      "700": { "$value": "#1D4ED8", "$type": "color" },
      "800": { "$value": "#1E40AF", "$type": "color" },
      "900": { "$value": "#1E3A8A", "$type": "color" }
    },
    "neutral": {
      "0": { "$value": "#FFFFFF", "$type": "color" },
      "50": { "$value": "#FAFAFA", "$type": "color" },
      "100": { "$value": "#F5F5F5", "$type": "color" },
      "200": { "$value": "#E5E5E5", "$type": "color" },
      "300": { "$value": "#D4D4D4", "$type": "color" },
      "400": { "$value": "#A3A3A3", "$type": "color" },
      "500": { "$value": "#737373", "$type": "color" },
      "600": { "$value": "#525252", "$type": "color" },
      "700": { "$value": "#404040", "$type": "color" },
      "800": { "$value": "#262626", "$type": "color" },
      "900": { "$value": "#171717", "$type": "color" }
    },
    "red": {
      "500": { "$value": "#EF4444", "$type": "color" },
      "600": { "$value": "#DC2626", "$type": "color" }
    },
    "green": {
      "500": { "$value": "#22C55E", "$type": "color" },
      "600": { "$value": "#16A34A", "$type": "color" }
    },
    "amber": {
      "500": { "$value": "#F59E0B", "$type": "color" }
    }
  },
  "spacing": {
    "0": { "$value": "0", "$type": "dimension" },
    "1": { "$value": "0.25rem", "$type": "dimension" },
    "2": { "$value": "0.5rem", "$type": "dimension" },
    "3": { "$value": "0.75rem", "$type": "dimension" },
    "4": { "$value": "1rem", "$type": "dimension" },
    "6": { "$value": "1.5rem", "$type": "dimension" },
    "8": { "$value": "2rem", "$type": "dimension" },
    "12": { "$value": "3rem", "$type": "dimension" }
  },
  "radius": {
    "none": { "$value": "0", "$type": "dimension" },
    "sm": { "$value": "0.125rem", "$type": "dimension" },
    "md": { "$value": "0.375rem", "$type": "dimension" },
    "lg": { "$value": "0.5rem", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  },
  "font": {
    "family": {
      "sans": {
        "$value": "Inter, system-ui, sans-serif",
        "$type": "fontFamily"
      },
      "mono": { "$value": "JetBrains Mono, monospace", "$type": "fontFamily" }
    },
    "size": {
      "xs": { "$value": "0.75rem", "$type": "dimension" },
      "sm": { "$value": "0.875rem", "$type": "dimension" },
      "base": { "$value": "1rem", "$type": "dimension" },
      "lg": { "$value": "1.125rem", "$type": "dimension" },
      "xl": { "$value": "1.25rem", "$type": "dimension" },
      "2xl": { "$value": "1.5rem", "$type": "dimension" },
      "3xl": { "$value": "1.875rem", "$type": "dimension" },
      "4xl": { "$value": "2.25rem", "$type": "dimension" }
    },
    "weight": {
      "regular": { "$value": "400", "$type": "fontWeight" },
      "medium": { "$value": "500", "$type": "fontWeight" },
      "semibold": { "$value": "600", "$type": "fontWeight" },
      "bold": { "$value": "700", "$type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "$value": "1.25", "$type": "number" },
      "normal": { "$value": "1.5", "$type": "number" },
      "relaxed": { "$value": "1.75", "$type": "number" }
    }
  }
}
```

These are placeholder values. The structure matters more than the specific hex codes at this stage. Whoever adopts the library swaps these values to match their brand; the structure stays the same.

## Add semantic tokens

Create a separate file for the semantic tokens at `tokens/semantic.json`. Style Dictionary merges all files listed in its `source` array, so keeping global and semantic tokens in separate files avoids an invalid JSON structure (two root objects in one file won't parse). The semantic tokens reference the global tokens by path:

```json
{
  "color": {
    "brand": {
      "primary": { "$value": "{color.blue.500}" },
      "primary-hover": { "$value": "{color.blue.600}" },
      "primary-active": { "$value": "{color.blue.700}" }
    },
    "text": {
      "default": { "$value": "{color.neutral.900}" },
      "subtle": { "$value": "{color.neutral.600}" },
      "disabled": { "$value": "{color.neutral.400}" },
      "on-brand": { "$value": "{color.neutral.0}" }
    },
    "background": {
      "surface": { "$value": "{color.neutral.0}" },
      "surface-raised": { "$value": "{color.neutral.50}" },
      "disabled": { "$value": "{color.neutral.100}" },
      "overlay": { "$value": "rgb(0 0 0 / 0.5)" }
    },
    "border": {
      "default": { "$value": "{color.neutral.200}" },
      "focus": { "$value": "{color.blue.500}" },
      "error": { "$value": "{color.red.500}" }
    },
    "feedback": {
      "error": { "$value": "{color.red.500}" },
      "success": { "$value": "{color.green.500}" },
      "warning": { "$value": "{color.amber.500}" }
    }
  },
  "layout": {
    "stack": {
      "space": {
        "default": { "$value": "{spacing.6}" },
        "dense": { "$value": "{spacing.3}" },
        "loose": { "$value": "{spacing.12}" }
      }
    },
    "sidebar": {
      "width": { "$value": "20rem" },
      "content-min": { "$value": "50%" }
    },
    "grid": {
      "min-cell": { "$value": "15rem" }
    },
    "center": {
      "max-width": { "$value": "60rem" },
      "gutters": { "$value": "{spacing.4}" }
    },
    "cover": {
      "min-height": { "$value": "100vh" }
    },
    "switcher": {
      "threshold": { "$value": "30rem" }
    },
    "cluster": {
      "space": { "$value": "{spacing.4}" }
    },
    "box": {
      "padding": { "$value": "{spacing.4}" }
    }
  }
}
```

The layout tokens appear alongside the color tokens, not as a separate concern. Layout is a peer of color, spacing, and typography in the token hierarchy.

## Configure Style Dictionary

Create `tokens/style-dictionary.config.js`:

```javascript
export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'token',
      buildPath: 'tokens/build/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}
```

The `source` glob picks up both `tokens.json` and `semantic.json` (and any additional token files you add later). The `prefix: 'token'` option adds a `--token-` prefix to all generated CSS custom properties, which prevents name collisions when you map them into Tailwind's `@theme` directive in the next step.

The `outputReferences: true` option preserves the alias relationships in the CSS output. Instead of resolving `color.brand.primary` to its final hex value, the output is:

```css
--token-color-brand-primary: var(--token-color-blue-500);
```

This matters for debugging. When you inspect an element in browser dev tools, you can trace the value back through its aliases to understand why it resolves to a specific color.

Add a build script to `package.json`, and verify that `type: "module"` is set at the root level to enable ES module syntax in the config file:

```json
{
  "type": "module",
  "scripts": {
    "build:tokens": "style-dictionary build --config tokens/style-dictionary.config.js"
  }
}
```

Run it:

```bash
npm run build:tokens
```

This generates `tokens/build/tokens.css`, a file containing all your tokens as CSS custom properties.

## Wire tokens into Tailwind

Update `src/app.css` to import the generated tokens and map them into Tailwind's @theme. The `@theme inline` directive tells Tailwind that these variables reference other CSS custom properties rather than defining literal values:

```css
@import 'tailwindcss';
@import '../tokens/build/tokens.css';

@theme inline {
  /* Semantic colors */
  --color-brand-primary: var(--token-color-brand-primary);
  --color-brand-primary-hover: var(--token-color-brand-primary-hover);
  --color-brand-primary-active: var(--token-color-brand-primary-active);
  --color-text-default: var(--token-color-text-default);
  --color-text-subtle: var(--token-color-text-subtle);
  --color-text-disabled: var(--token-color-text-disabled);
  --color-text-on-brand: var(--token-color-text-on-brand);
  --color-surface: var(--token-color-background-surface);
  --color-surface-raised: var(--token-color-background-surface-raised);
  --color-surface-disabled: var(--token-color-background-disabled);
  --color-overlay: var(--token-color-background-overlay);
  --color-border-default: var(--token-color-border-default);
  --color-border-focus: var(--token-color-border-focus);
  --color-border-error: var(--token-color-border-error);
  --color-feedback-error: var(--token-color-feedback-error);
  --color-feedback-success: var(--token-color-feedback-success);
  --color-feedback-warning: var(--token-color-feedback-warning);

  /* Neutral scale */
  --color-neutral-0: var(--token-color-neutral-0);
  --color-neutral-50: var(--token-color-neutral-50);
  --color-neutral-100: var(--token-color-neutral-100);
  --color-neutral-200: var(--token-color-neutral-200);
  --color-neutral-300: var(--token-color-neutral-300);
  --color-neutral-400: var(--token-color-neutral-400);
  --color-neutral-500: var(--token-color-neutral-500);
  --color-neutral-600: var(--token-color-neutral-600);
  --color-neutral-700: var(--token-color-neutral-700);
  --color-neutral-800: var(--token-color-neutral-800);
  --color-neutral-900: var(--token-color-neutral-900);

  /* Typography */
  --font-sans: var(--token-font-family-sans);
  --font-mono: var(--token-font-family-mono);
  --font-size-xs: var(--token-font-size-xs);
  --font-size-sm: var(--token-font-size-sm);
  --font-size-base: var(--token-font-size-base);
  --font-size-lg: var(--token-font-size-lg);
  --font-size-xl: var(--token-font-size-xl);
  --font-size-2xl: var(--token-font-size-2xl);
  --font-size-3xl: var(--token-font-size-3xl);
  --font-size-4xl: var(--token-font-size-4xl);
  --font-weight-regular: var(--token-font-weight-regular);
  --font-weight-medium: var(--token-font-weight-medium);
  --font-weight-semibold: var(--token-font-weight-semibold);
  --font-weight-bold: var(--token-font-weight-bold);
  --leading-tight: var(--token-font-line-height-tight);
  --leading-normal: var(--token-font-line-height-normal);
  --leading-relaxed: var(--token-font-line-height-relaxed);

  /* Radius */
  --radius-sm: var(--token-radius-sm);
  --radius-md: var(--token-radius-md);
  --radius-lg: var(--token-radius-lg);
  --radius-full: var(--token-radius-full);
}
```

The `--token-` prefix on the Style Dictionary output is what makes this work. The generated variables (for example, `--token-color-brand-primary`) and the Tailwind theme variables (for example, `--color-brand-primary`) have different names, so there's no self-reference. Tailwind reads the theme variable, which resolves to the token variable, which resolves to the final value.

The background tokens use `surface` rather than `bg-surface` as the suffix. Tailwind generates the `bg-` utility prefix from the `--color-*` variable name itself, so `--color-bg-surface` would produce the class `bg-bg-surface`. Dropping the redundant prefix gives you `bg-surface`, `bg-surface-raised`, and `bg-overlay`.

The neutral scale, font sizes, font weights, and line heights are all mapped here even though no component in this chapter uses them directly. Components built in later chapters reference these values in CSS as `var(--font-size-sm)`, `var(--font-weight-medium)`, and `var(--color-neutral-900)`. Those references expect the variables to exist via `@theme`, so the mappings need to be in place before those components are added.

Layout tokens don't need to be mapped through `@theme`. They're not used as Tailwind utility classes. Layout primitives reference them directly using the `--token-` prefix in their CSS. For example, the Stack component uses `var(--token-layout-stack-space-default)` in its CSS rather than mapping through `@theme`. Layout tokens control component behavior, not utility class generation.

## Verify the pipeline

At this point you can confirm the pipeline works end to end:

1. Change a value in `tokens/tokens.json` (for example, change `color.blue.500` to a different hex value).
2. Run `npm run build:tokens`.
3. Check that `tokens/build/tokens.css` reflects the new value.
4. Confirm that any Tailwind class referencing that token (via @theme) would pick up the change.

The full cycle: edit `tokens.json`, run `build:tokens`, and every CSS custom property and Tailwind utility that references that token updates automatically. One source of truth, automated all the way through.

## What you have now

- Token files: `tokens/tokens.json` (global values) and `tokens/semantic.json` (semantic aliases and layout tokens)
- A Style Dictionary config that merges both files and generates CSS custom properties with a `--token-` prefix
- A Tailwind `@theme inline` block that maps token properties to utility classes without circular variable references
- A pipeline you can verify by changing a token value and watching it propagate

The next chapter uses these tokens to build your first layout primitive.
