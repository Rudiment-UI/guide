---
title: 'What comes next'
description: This chapter covers the next steps for scaling the system.
order: 13
---

You have a working component library: 25 components (14 UI, 8 layout, 3 typography), a token system, Storybook documentation, and tests. This chapter covers the next steps for scaling the system.

## Dark theme

A dark theme doesn't require new components. It requires a second set of semantic token values. The same components render correctly in both themes because they reference semantic tokens, not global values:

```css
.dark {
  --color-text-default: var(--color-neutral-50);
  --color-text-subtle: var(--color-neutral-400);
  --color-surface: var(--color-neutral-900);
  --color-surface-raised: var(--color-neutral-800);
  --color-border-default: var(--color-neutral-700);
  --color-brand-primary: var(--color-blue-400);
}
```

Add the `.dark` class to the root element, and every component that references `--color-text-default` or `--color-background-surface` switches automatically. No component code changes.

This same pattern supports high-contrast modes, reduced motion preferences, and white-label branding.

## Figma alignment

Design-code drift is one of the most common friction points in design system adoption. Reducing it requires shared naming and shared structure between Figma and code.

Figma Variables (introduced in 2023 and expanded since) map directly to your token architecture. Create Figma variable collections that mirror your token tiers: a "Global" collection with color palette values, a "Semantic" collection with alias variables, and optionally a "Component" collection with per-component overrides. Name the variables the same way you name the tokens.

Tokens Studio for Figma (formerly Figma Tokens) is a free third-party Figma plugin. Install it from the Figma Community at figma.com/community. Once installed, it can read your `tokens.json` file directly and sync token values into Figma, eliminating manual duplication. The sync can run in both directions: design-to-code or code-to-design. Code should be the source of truth. With that setup, code-to-design sync keeps Figma aligned without manual updates.

Figma Code Connect (if you adopt it) maps Figma component properties to code props, so developers see the actual import statement and prop values when they inspect a component in Figma. This reduces friction for teams with both designers and developers.

## Expanding the component set

The initial 14 UI components cover the essentials. Your buyer feedback and customer engagements will show which components to add next. Common requests:

- **Toast/notification:** Timed, non-blocking feedback messages. Uses React Aria's `useToast`.
- **Dropdown menu:** A button that opens a menu of actions. Uses `useMenuTrigger` + `useMenu`.
- **Popover:** A floating panel triggered by a button. Uses `useOverlayTrigger` for the trigger (the same hook used in chapter 7's Select) and `usePopover` for the panel.
- **Accordion:** Collapsible content sections. Uses the `Disclosure` and `DisclosureGroup` components from `react-aria-components` (React Aria does not expose a `useAccordion` hook).
- **Data table:** Sortable, filterable tabular data. This is the most complex component in any library and is a strong candidate for a separate add-on product.

Add components based on demand, not speculation. Every new component increases the maintenance surface and the documentation requirement.

## When a library becomes a design system

A component library is code. A design system is code plus governance: contribution guidelines, decision-making processes, release cadence, support channels, adoption metrics, and a team that owns the system's evolution.

The library you've built in this guide is a component library. It becomes a design system when an organization adopts it as the standard for building interfaces and invests in the operating model that keeps it useful over time. That transition is an organizational change, not a technical one. The code foundation you've built here supports it, but the code alone doesn't make it happen.

If you're interested in that transition, the article ["Design Systems Are Easy Until You Ship One"](https://joshuabriley.com/blog/design-systems-are-easy-until-you-ship-one/) covers the governance, adoption, and support challenges in detail.

## What you have now

A complete component library: a three-tier design token system, 25 accessible components (14 UI, 8 layout, 3 typography), Storybook documentation with a dark mode toggle, a full test suite with axe-core coverage, a dark theme, and a packaged, publishable library. The guide is complete.

## Where to go from here

You have a foundation. It's accessible, token-driven, documented, tested, and composable. The specific components and token values will change as you or your buyers use it. That's the point. The architecture absorbs change without requiring you to rethink the fundamentals.

If building this from scratch isn't the right investment for your team, [Rudiment UI](https://joshuabriley.com/services/starter/) is a pre-built version of this exact architecture, ready to customize and extend.
