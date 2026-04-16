---
title: 'The rest of the layout system'
description: You have the pattern down from the Stack chapter. This chapter applies that same pattern seven more times.

order: 5
---

You have the pattern down from the Stack chapter: a React component that renders a semantic element with a CSS class and optional inline custom property overrides. The CSS does the layout work, tokens provide the defaults, and props allow per-instance control. This chapter applies that same pattern seven more times.

Each section covers the primitive's CSS, TypeScript interface, and a brief explanation of the layout technique. Stories and tests follow the same conventions established for Stack. The full story and test files are in the [companion repository](https://github.com/Rudiment-UI/rudiment-ui). This chapter focuses on the CSS techniques that make each primitive work.

## Box

The Box is the simplest layout primitive. It applies consistent padding and an optional border. You might wonder why this needs a component at all, since you could apply `p-4` and `border` as Tailwind classes directly. The answer is consistency: a Box component guarantees that padding comes from the token system, and when the design team decides to change the default container padding from `1rem` to `1.25rem`, every Box in the application updates.

```css
.rudiment-box {
  --box-padding: var(--token-layout-box-padding, 1rem);
  padding: var(--box-padding);
}

.rudiment-box--bordered {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.rudiment-box--invert {
  background-color: var(--color-bg-surface-inverted, var(--color-neutral-900));
  color: var(--color-text-on-inverted, var(--color-neutral-0));
}
```

> **Note:** `--color-bg-surface-inverted` and `--color-text-on-inverted` are not yet defined in `tokens/semantic.json` or the `@theme inline` block from Chapter 3. The CSS falls back to `--color-neutral-900` and `--color-neutral-0` via the comma fallback syntax. To make the primary token references functional (for example, so that a dark theme override can target them), add the following to `tokens/semantic.json` under the `color` namespace and wire them into your `@theme inline` block:
>
> ```json
> "bg-surface-inverted": { "$value": "{color.neutral.900}" },
> "text-on-inverted": { "$value": "{color.neutral.0}" }
> ```

```tsx
// src/layouts/Box/Box.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  padding?: string
  bordered?: boolean
  invert?: boolean
  as?: React.ElementType
  children?: React.ReactNode
}

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    padding,
    bordered = false,
    invert = false,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (padding) customProperties['--box-padding'] = padding

  return (
    <Element
      ref={ref}
      className={cn(
        'rudiment-box',
        bordered && 'rudiment-box--bordered',
        invert && 'rudiment-box--invert',
        className,
      )}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-box--bordered" title="Box in Storybook"}
::

Every primitive in this chapter follows the same `forwardRef` pattern. The ref is typed as `HTMLElement` in all cases for the same reason discussed in Chapter 4: the `as` prop accepts any element type, so a more specific ref type (for example, `HTMLDivElement`) would be incorrect when the consumer passes `as="section"`. `HTMLElement` is the accurate common base. If your project needs the fully typed polymorphic ref, the pattern is documented in the [companion repository](https://github.com/Rudiment-UI/rudiment-ui).

## Center

The Center constrains content to a maximum width and horizontally centers it. It's the primitive you wrap around page-level content to prevent text lines from stretching to the full viewport width (which makes them difficult to read past about 70 characters per line).

```css
.rudiment-center {
  --center-max-width: var(--token-layout-center-max-width, 60rem);
  --center-gutters: var(--token-layout-center-gutters, 1rem);
  box-sizing: content-box;
  max-inline-size: var(--center-max-width);
  margin-inline: auto;
  padding-inline: var(--center-gutters);
}

.rudiment-center--intrinsic {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

The `box-sizing: content-box` declaration is deliberate. It means the `max-inline-size` applies to the content only, and the `padding-inline` (gutters) is added outside that. The total width is `max-width + gutters`. Without this, the gutters eat into the content width, and your max-width is effectively narrower than specified.

The `intrinsic` variant uses flexbox centering to size the Center based on its content width rather than filling the max-width. This is useful for centering a button or a narrow form that shouldn't stretch to 60rem.

```tsx
// src/layouts/Center/Center.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface CenterProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: string
  gutters?: string
  intrinsic?: boolean
  as?: React.ElementType
  children?: React.ReactNode
}

export const Center = forwardRef<HTMLElement, CenterProps>(function Center(
  {
    maxWidth,
    gutters,
    intrinsic = false,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (maxWidth) customProperties['--center-max-width'] = maxWidth
  if (gutters) customProperties['--center-gutters'] = gutters

  return (
    <Element
      ref={ref}
      className={cn(
        'rudiment-center',
        intrinsic && 'rudiment-center--intrinsic',
        className,
      )}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-center--default" title="Centered in Storybook"}
::

## Cluster

The Cluster arranges inline-like children (tags, buttons, badges, navigation links) in a horizontal row with consistent spacing. When the children don't fit in one row, they wrap to the next line. The `gap` property handles both horizontal and vertical spacing between wrapped rows.

```css
.rudiment-cluster {
  --cluster-space: var(--token-layout-cluster-space, 1rem);
  --cluster-justify: flex-start;
  --cluster-align: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-space);
  justify-content: var(--cluster-justify);
  align-items: var(--cluster-align);
}
```

```tsx
// src/layouts/Cluster/Cluster.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ClusterProps extends React.HTMLAttributes<HTMLElement> {
  space?: string
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  as?: React.ElementType
  children?: React.ReactNode
}

export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster(
  {
    space,
    justify,
    align,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (space) customProperties['--cluster-space'] = space
  if (justify) customProperties['--cluster-justify'] = justify
  if (align) customProperties['--cluster-align'] = align

  return (
    <Element
      ref={ref}
      className={cn('rudiment-cluster', className)}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-cluster--default" title="Cluster in Storybook"}
::

A common use case is a header with a logo on the left and navigation links on the right.

```tsx
<Cluster justify="space-between" align="center">
  <Logo />
  <Cluster space="0.5rem">
    <NavLink>About</NavLink>
    <NavLink>Blog</NavLink>
    <NavLink>Contact</NavLink>
  </Cluster>
</Cluster>
```

## Sidebar

The Sidebar is the most complex layout primitive. It creates a two-panel layout where one panel (the sidebar) has a fixed width and the other (the content) fills the remaining space. When the content panel would be squeezed below a minimum width, both panels stack vertically. No media queries. The layout responds to its own container, not the viewport.

The technique uses flexbox with asymmetric `flex-grow` values:

```css
.rudiment-sidebar {
  --sidebar-width: var(--token-layout-sidebar-width, 20rem);
  --sidebar-content-min: var(--token-layout-sidebar-content-min, 50%);
  --sidebar-space: var(--token-layout-stack-space-default, 1.5rem);
  display: flex;
  flex-wrap: wrap;
  gap: var(--sidebar-space);
}

.rudiment-sidebar > :first-child {
  flex-basis: var(--sidebar-width);
  flex-grow: 1;
}

.rudiment-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: var(--sidebar-content-min);
}

.rudiment-sidebar--right > :first-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: var(--sidebar-content-min);
}

.rudiment-sidebar--right > :last-child {
  flex-basis: var(--sidebar-width);
  flex-grow: 1;
}

.rudiment-sidebar--no-stretch {
  align-items: flex-start;
}
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-sidebar--default" title="Sidebar in Storybook"}
::

The key insight is `flex-grow: 999` on the content panel. Because this value is so much larger than the sidebar's `flex-grow: 1`, the content panel consumes all available space beyond the sidebar's `flex-basis`. The `min-inline-size: 50%` on the content panel forces wrapping: when the content would be narrower than 50% of the container, it wraps below the sidebar and both panels take full width.

This is an intrinsic layout. The same Sidebar component works in a 1200px container (side by side) and a 400px container (stacked) without any changes to the component or its props. The container's width is the only input.

```tsx
// src/layouts/Sidebar/Sidebar.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  side?: 'left' | 'right'
  sideWidth?: string
  contentMin?: string
  space?: string
  noStretch?: boolean
  as?: React.ElementType
  children?: React.ReactNode
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    side = 'left',
    sideWidth,
    contentMin,
    space,
    noStretch = false,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (sideWidth) customProperties['--sidebar-width'] = sideWidth
  if (contentMin) customProperties['--sidebar-content-min'] = contentMin
  if (space) customProperties['--sidebar-space'] = space

  return (
    <Element
      ref={ref}
      className={cn(
        'rudiment-sidebar',
        side === 'right' && 'rudiment-sidebar--right',
        noStretch && 'rudiment-sidebar--no-stretch',
        className,
      )}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

The Sidebar expects exactly two children. The first child is the sidebar panel (when `side="left"`), and the second is the content panel. When `side="right"`, the roles reverse. The component doesn't enforce this at runtime, but the [companion repository's](https://github.com/Rudiment-UI/rudiment-ui) documentation and stories clarify the expectation.

## Switcher

The Switcher creates an N-column layout that collapses to a single column when the container is narrower than a threshold. Unlike the Sidebar (which has one fixed-width panel), the Switcher divides space equally among all its children.

The technique uses a `flex-basis` calculation that evaluates to either a very large positive number (forcing wrapping) or zero (allowing horizontal layout):

```css
.rudiment-switcher {
  --switcher-threshold: var(--token-layout-switcher-threshold, 30rem);
  --switcher-space: var(--token-layout-stack-space-default, 1.5rem);
  display: flex;
  flex-wrap: wrap;
  gap: var(--switcher-space);
}

.rudiment-switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--switcher-threshold) - 100%) * 999);
}
```

The `calc()` expression is the heart of the trick. When the container is wider than the threshold, `(threshold - 100%)` is negative, and multiplying by 999 produces a very large negative number. Since `flex-basis` can't be negative, the browser clamps it to zero, and the children share the space equally in a row. When the container is narrower than the threshold, the result is positive, and each child's `flex-basis` exceeds the container width, forcing every child to wrap onto its own line.

```tsx
// src/layouts/Switcher/Switcher.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SwitcherProps extends React.HTMLAttributes<HTMLElement> {
  threshold?: string
  space?: string
  limit?: number
  as?: React.ElementType
  children?: React.ReactNode
}

export const Switcher = forwardRef<HTMLElement, SwitcherProps>(
  function Switcher(
    {
      threshold,
      space,
      limit,
      as: Element = 'div',
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const customProperties: Record<string, string> = {}
    if (threshold) customProperties['--switcher-threshold'] = threshold
    if (space) customProperties['--switcher-space'] = space

    return (
      <Element
        ref={ref}
        className={cn('rudiment-switcher', className)}
        style={{ ...customProperties, ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </Element>
    )
  },
)
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-switcher--default" title="Switcher in Storybook"}
::

The `limit` prop is an enhancement for cases where you want at most N children per row. It applies `flex-basis: 100%` to children beyond the limit via a CSS rule like `.rudiment-switcher > :nth-child(n+4)`. You can handle this with an inline `<style>` tag scoped to the component instance. The core switching behavior works without it.

## Grid

The Grid creates a responsive grid without media queries. You specify a minimum cell width, and the browser determines how many columns fit. When the container narrows, columns drop off naturally.

```css
.rudiment-grid {
  --grid-min-cell: var(--token-layout-grid-min-cell, 15rem);
  --grid-space: var(--token-layout-stack-space-default, 1.5rem);
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(var(--grid-min-cell), 100%), 1fr)
  );
  gap: var(--grid-space);
}
```

The `min(var(--grid-min-cell), 100%)` inside the `minmax()` is critical. Without it, cells wider than their container overflow. The `min()` function ensures cells never exceed 100% of the container width, so on a very narrow screen, you get a single column of full-width cells without any overflow.

```tsx
// src/layouts/Grid/Grid.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  minCellWidth?: string
  space?: string
  as?: React.ElementType
  children?: React.ReactNode
}

export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    minCellWidth,
    space,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (minCellWidth) customProperties['--grid-min-cell'] = minCellWidth
  if (space) customProperties['--grid-space'] = space

  return (
    <Element
      ref={ref}
      className={cn('rudiment-grid', className)}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-grid--default" title="Grid in Storybook"}
::

## Cover

The Cover vertically centers a principal child element within a minimum-height container. It's the primitive for hero sections, login pages, and any full-viewport layout where the main content should be vertically centered with optional header and footer elements pinned to the top and bottom.

```css
.rudiment-cover {
  --cover-min-height: var(--token-layout-cover-min-height, 100vh);
  --cover-space: var(--token-layout-stack-space-default, 1.5rem);
  display: flex;
  flex-direction: column;
  min-block-size: var(--cover-min-height);
}

.rudiment-cover > * {
  margin-block: var(--cover-space);
}

.rudiment-cover > :first-child:not(.rudiment-cover__centered) {
  margin-block-start: 0;
}

.rudiment-cover > :last-child:not(.rudiment-cover__centered) {
  margin-block-end: 0;
}

.rudiment-cover > .rudiment-cover__centered {
  margin-block: auto;
}
```

The `margin-block: auto` on the centered child is the vertical centering mechanism. In a flex column context, `auto` margin absorbs available space, pushing the element to the center. The first and last child overrides prevent extra spacing at the edges, so a header sits flush at the top and a footer sits flush at the bottom.

```tsx
// src/layouts/Cover/Cover.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface CoverProps extends React.HTMLAttributes<HTMLElement> {
  minHeight?: string
  space?: string
  as?: React.ElementType
  children?: React.ReactNode
}

export const Cover = forwardRef<HTMLElement, CoverProps>(function Cover(
  {
    minHeight,
    space,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (minHeight) customProperties['--cover-min-height'] = minHeight
  if (space) customProperties['--cover-space'] = space

  return (
    <Element
      ref={ref}
      className={cn('rudiment-cover', className)}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Element>
  )
})
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-cover--default" title="Cover in Storybook"}
::

The consumer marks the centered child with the `rudiment-cover__centered` class:

```tsx
<Cover>
  <header>Site header</header>
  <main className="rudiment-cover__centered">
    <h1>Welcome</h1>
    <p>This content is vertically centered.</p>
  </main>
  <footer>Site footer</footer>
</Cover>
```

An alternative approach is to export a `CoverCentered` wrapper component that applies the class automatically. Either approach works. The class-based approach is simpler and avoids an extra component.

## Composing primitives

These primitives become most useful when nested. A complete page layout requires no bespoke CSS, just composition:

```tsx
<Stack space="0">
  <Box as="header" padding="1rem" bordered>
    <Center maxWidth="72rem">
      {/* Placeholder components like Logo and NavLink represent your own app's navigation. */}
      <Cluster justify="space-between" align="center">
        <strong>App Name</strong>
        <Cluster space="0.5rem">
          <a href="/docs">Docs</a>
          <a href="/settings">Settings</a>
        </Cluster>
      </Cluster>
    </Center>
  </Box>

  <Center maxWidth="72rem" gutters="1.5rem">
    <Sidebar sideWidth="14rem" contentMin="60%" space="2rem">
      <Stack as="nav" space="0.25rem">
        <a href="/dashboard">Dashboard</a>
        <a href="/projects">Projects</a>
        <a href="/team">Team</a>
      </Stack>

      <Stack as="main" space="2rem">
        <h1>Dashboard</h1>
        <Switcher threshold="20rem" space="1rem">
          <Box bordered padding="1.5rem">
            Metric A
          </Box>
          <Box bordered padding="1.5rem">
            Metric B
          </Box>
          <Box bordered padding="1.5rem">
            Metric C
          </Box>
        </Switcher>
        <Grid minCellWidth="16rem" space="1rem">
          <Box bordered padding="1rem">
            Card 1
          </Box>
          <Box bordered padding="1rem">
            Card 2
          </Box>
          <Box bordered padding="1rem">
            Card 3
          </Box>
          <Box bordered padding="1rem">
            Card 4
          </Box>
        </Grid>
      </Stack>
    </Sidebar>
  </Center>
</Stack>
```

This layout handles narrow viewports automatically. The Sidebar stacks when the content panel would be too narrow. The Switcher collapses the metric cards to a single column. The Grid drops columns as space decreases. No breakpoints, no media queries, no viewport-specific code.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/docs/examples-settings-page--docs" title="Layout composition in Storybook"}
::

## Attribution

The layout primitives in this guide are inspired by the intrinsic layout patterns described in [Every Layout](https://every-layout.dev/) by Heydon Pickering and Andy Bell. Their work on algorithmic, context-independent CSS layout is recommended reading for anyone building layout systems.

## What you have now

Eight layout primitives, all following the same pattern: token-driven CSS, React component wrapper, `as` prop for semantic HTML, `className` merging, prop-based overrides via inline custom properties. The layout system is usable independently of the UI components.

Before moving to interactive components, the next chapter adds the typography layer: Heading, Text, and Prose components that handle your UI's text content (Chapter 6).
