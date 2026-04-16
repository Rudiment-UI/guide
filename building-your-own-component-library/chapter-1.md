---
title: 'The architecture before the code'
description: This chapter covers the decisions you need to make before you write a single line of code.
order: 1
---

Don't open your terminal yet. The most expensive mistakes in a component library are architectural, and they compound. A bad token structure means renaming hundreds of references later. A wrong CSS strategy means rewriting every component's styles. A missing accessibility layer means adding it retroactively, which always costs more than building it in.

## Choosing your primitives layer

The accessibility primitives layer handles keyboard navigation, focus management, ARIA attributes, and screen reader behavior for interactive components like buttons, modals, selects, and tabs.

You have three options:

**Build it yourself.** This means implementing WAI-ARIA patterns from scratch for every interactive component. A correct modal implementation alone requires focus trapping, scroll locking, Escape key handling, focus restoration on close, and `aria-modal` management. Multiply that by every interactive component in your library. Unless accessibility engineering is your core skill, this path produces components that work for mouse users and break for everyone else.

**Use Radix primitives.** Radix provides unstyled, accessible components that you style yourself. It's the layer underneath shadcn/ui, and it has the largest mindshare in the React ecosystem. Radix was originally built by Modulz and is now maintained by WorkOS. It's a mature, production-proven library. This guide uses React Aria instead of Radix, not because Radix is a bad choice, but because React Aria offers deeper accessibility coverage out of the box, particularly for mobile screen readers and internationalization. That translates directly to less custom work per component.

**Use React Aria.** React Aria is maintained by Adobe's design system team, the same team behind the Spectrum design system. HeroUI (formerly NextUI) has built on React Aria since v2. Untitled UI React, launched in 2026, also chose React Aria. React Aria handles mobile screen reader interactions, press event normalization across pointer types, and internationalization of ARIA labels.

This guide uses React Aria because it gives you the most accessibility coverage with the least custom work, backed by a maintenance commitment tied to Adobe's own production needs.

## Choosing your styling approach

The styling layer determines how your token values reach the rendered components and how buyers customize the visual output.

This guide recommends **Tailwind CSS 4**. Version 4 introduced CSS-first configuration through the `@theme` directive, which means your design tokens (stored as CSS custom properties) map directly to Tailwind utility classes without a JavaScript config file. The buyer changes a token value, and every Tailwind utility that references it updates automatically.

The alternative approaches (CSS Modules, Sass, styled-components) all work, but they add a layer of indirection between your tokens and your styles. Tailwind's `@theme` collapses that layer. The token _is_ the style.

## The three-tier token architecture

If you've worked with design tokens before, you've probably seen systems that define a color palette and reference those colors directly in components. That works until you need a dark theme, a rebrand, or a second product that shares components but looks different.

A three-tier architecture avoids this by separating _what values exist_ from _what values mean_ from _what values a specific component uses_.

**Tier 1 (global tokens)** defines the raw palette. `color.blue.500` is `#3B82F6`. It has no opinion about what that color is for. It just exists as a named value in the system.

**Tier 2 (semantic tokens)** assigns meaning. `color.brand.primary` references `color.blue.500`. Now `color.blue.500` is aliased as the primary brand color. When the brand changes to teal, you update one alias. Every component that uses `color.brand.primary` changes with it.

**Tier 3 (component tokens, optional)** scopes values to individual components. `button.background.default` references `color.brand.primary`. This tier is useful in large systems where you need to change one component's behavior without affecting others. For a starter library, it's a reference implementation you can skip until you need it.

This guide implements all three tiers so you understand how they work. The token schema uses the [Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) format, the leading interchange format for design tokens. The DTCG specification reached its first stable release (2025.10) in October 2025, with support from more than 10 tools including Figma, Style Dictionary, Tokens Studio, and Penpot. It is a W3C Community Group specification, not a W3C Recommendation, but it is production-ready and widely adopted. Style Dictionary v4 ships with first-class DTCG support.

## Layout as a first-class concern

Most component libraries stop at UI components: buttons, inputs, modals, cards. They leave layout to the consumer, who either writes custom CSS for every page or copies page templates and strips out what they don't need.

This guide treats layout as part of the component library. You'll build eight layout primitives (`Stack`, `Box`, `Center`, `Cluster`, `Sidebar`, `Switcher`, `Grid`, `Cover`) that follow the intrinsic design principles described by Heydon Pickering and Andy Bell in [Every Layout](https://every-layout.dev/). These primitives respond to their container's available space rather than the viewport width, which means they work in any context without media query breakpoints.

The layout primitives are driven by the same token system as the UI components. Changing `layout.sidebar.width` from `20rem` to `24rem` propagates to every Sidebar instance in the application. Changing `layout.stack.space.default` from `1.5rem` to `2rem` adjusts vertical rhythm globally.

## Decisions summary

Before you proceed, here's what you're committing to:

::OverflowX

| Decision                 | Choice                                                                              | Why                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                | React 19 + TypeScript                                                               | Largest ecosystem; TypeScript makes component APIs self-documenting                                                                                                        |
| Accessibility primitives | React Aria                                                                          | Adobe-maintained; deepest a11y coverage; used by HeroUI and Untitled UI React                                                                                              |
| Styling                  | Tailwind CSS 4                                                                      | CSS-first @theme directive; tokens map directly to utilities; no JS config                                                                                                 |
| Token format             | DTCG JSON + Style Dictionary v4                                                     | Leading interchange format; platform-agnostic source; automated CSS custom property output. Style Dictionary v5 exists with a compatible config format; this guide uses v4 |
| Documentation            | Storybook 10 (installed via `@latest` — pin the version if reproducibility matters) | Industry standard; built-in a11y addon; ESM-only maintenance release that reduced install size by 29%                                                                      |
| Testing                  | Vitest + Testing Library                                                            | Fast; behavior-focused; accessible query selectors                                                                                                                         |
| Build tool               | Vite                                                                                | Fast dev server; clean library build output                                                                                                                                |
| Layout approach          | Intrinsic primitives (Every Layout-inspired)                                        | Context-independent; no media queries; token-driven                                                                                                                        |

::

If any of these choices don't fit your situation, substitute freely. The architecture still holds. The specific tools are less important than the separation of concerns: tokens define values, components consume tokens, layout primitives handle spatial arrangement, and tests verify behavior.
