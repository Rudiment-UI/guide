---
title: 'Typography: Heading, Text, and Prose'
description: This chapter adds three components that enforce typographic consistency through the same token system that drives the rest of the library.
order: 6
---

Layout primitives handle where things go. Typography components handle how text looks and how it flows. Most component libraries skip this layer entirely, leaving every heading size, text variant, and content spacing decision to the consumer. The result is inconsistency: five developers make five different choices about how large an `h2` should be.

## Typography tokens

Add a typography namespace to `tokens/semantic.json`:

```json
{
  "typography": {
    "heading": {
      "1": {
        "size": { "$value": "{font.size.2xl}" },
        "weight": { "$value": "{font.weight.bold}" },
        "lineHeight": { "$value": "{font.lineHeight.tight}" },
        "tracking": { "$value": "-0.025em" }
      },
      "2": {
        "size": { "$value": "{font.size.xl}" },
        "weight": { "$value": "{font.weight.semibold}" },
        "lineHeight": { "$value": "{font.lineHeight.tight}" },
        "tracking": { "$value": "-0.025em" }
      },
      "3": {
        "size": { "$value": "{font.size.lg}" },
        "weight": { "$value": "{font.weight.semibold}" },
        "lineHeight": { "$value": "{font.lineHeight.tight}" },
        "tracking": { "$value": "0" }
      }
    },
    "body": {
      "size": { "$value": "{font.size.base}" },
      "weight": { "$value": "{font.weight.regular}" },
      "lineHeight": { "$value": "{font.lineHeight.normal}" }
    },
    "body-sm": {
      "size": { "$value": "{font.size.sm}" },
      "weight": { "$value": "{font.weight.regular}" },
      "lineHeight": { "$value": "{font.lineHeight.normal}" }
    },
    "caption": {
      "size": { "$value": "{font.size.sm}" },
      "weight": { "$value": "{font.weight.regular}" },
      "lineHeight": { "$value": "{font.lineHeight.normal}" },
      "color": { "$value": "{color.text.subtle}" }
    },
    "overline": {
      "size": { "$value": "{font.size.xs}" },
      "weight": { "$value": "{font.weight.semibold}" },
      "lineHeight": { "$value": "{font.lineHeight.normal}" },
      "tracking": { "$value": "0.1em" }
    },
    "prose": {
      "space": { "$value": "1.5em" },
      "heading-before": { "$value": "2em" },
      "heading-after": { "$value": "0.75em" }
    }
  }
}
```

Run `npm run build:tokens` to regenerate the CSS custom properties.

## Heading

The Heading component renders the correct semantic HTML element (`<h1>` through `<h6>`) based on a `level` prop. It also accepts a `size` prop for cases where the visual size needs to differ from the semantic level.

This distinction matters for accessibility. Screen reader users navigate by heading level to understand page structure. If every visually large heading is an `<h1>`, the document structure is flat and unhelpful. The `level` prop enforces correct document structure. The `size` prop lets you render an `<h2>` that looks like an `<h1>` when the design calls for it.

```tsx
// src/typography/Heading/Heading.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  size?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading({ level, size, className, children, ...props }, ref) {
    const Element = `h${level}` as const
    const visualSize = size ?? level

    return (
      <Element
        ref={ref}
        className={cn(
          `rudiment-heading rudiment-heading--${visualSize}`,
          className,
        )}
        {...props}
      >
        {children}
      </Element>
    )
  },
)
```

The CSS applies typography tokens per heading size:

```css
.rudiment-heading--1 {
  font-size: var(--token-typography-heading-1-size);
  font-weight: var(--token-typography-heading-1-weight);
  line-height: var(--token-typography-heading-1-line-height);
  letter-spacing: var(--token-typography-heading-1-tracking);
  color: var(--color-text-default);
}

.rudiment-heading--2 {
  font-size: var(--token-typography-heading-2-size);
  font-weight: var(--token-typography-heading-2-weight);
  line-height: var(--token-typography-heading-2-line-height);
  letter-spacing: var(--token-typography-heading-2-tracking);
  color: var(--color-text-default);
}

/* ...and so on for levels 3-6 */
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/typography-heading--all-levels" title="Heading Levels" height="450px"}
::

## Text

The Text component covers non-heading text: body paragraphs, small text, captions, overlines, and inline code. The `variant` prop selects the typographic style, and the `as` prop controls the rendered element.

```tsx
// src/typography/Text/Text.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'body' | 'body-sm' | 'caption' | 'overline' | 'code'
  as?: React.ElementType
  children: React.ReactNode
  className?: string
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = 'body', as: Element = 'p', className, children, ...props },
  ref,
) {
  return (
    <Element
      ref={ref}
      className={cn(`rudiment-text rudiment-text--${variant}`, className)}
      {...props}
    >
      {children}
    </Element>
  )
})
```

```css
.rudiment-text--body {
  font-size: var(--token-typography-body-size);
  font-weight: var(--token-typography-body-weight);
  line-height: var(--token-typography-body-line-height);
  color: var(--color-text-default);
}

.rudiment-text--body-sm {
  font-size: var(--token-typography-body-sm-size);
  font-weight: var(--token-typography-body-sm-weight);
  line-height: var(--token-typography-body-sm-line-height);
  color: var(--color-text-default);
}

.rudiment-text--caption {
  font-size: var(--token-typography-caption-size);
  font-weight: var(--token-typography-caption-weight);
  line-height: var(--token-typography-caption-line-height);
  color: var(--color-text-subtle);
}

.rudiment-text--overline {
  font-size: var(--token-typography-overline-size);
  font-weight: var(--token-typography-overline-weight);
  line-height: var(--token-typography-overline-line-height);
  letter-spacing: var(--token-typography-overline-tracking);
  text-transform: uppercase;
}

.rudiment-text--code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--color-surface-raised);
  padding: 0.125em 0.25em;
  border-radius: var(--radius-sm);
}
```

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/typography-text--all-variants" title="Text Levels" height="450px"}
::

## Prose

The Prose component solves the problem that Stack and Heading alone cannot: context-aware vertical rhythm in long-form content.

Stack applies uniform spacing between its children. But long-form content needs variable spacing. The gap above a heading should be larger because it signals a new section. The gap below a heading should be smaller because the heading belongs to what follows. Paragraphs need consistent but moderate spacing. Code blocks need extra breathing room.

Prose handles all of this with CSS selectors that target element-type relationships:

```tsx
// src/typography/Prose/Prose.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ProseProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'base' | 'lg'
  as?: React.ElementType
  children: React.ReactNode
  className?: string
}

export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { size = 'base', as: Element = 'div', className, children, ...props },
  ref,
) {
  return (
    <Element
      ref={ref}
      className={cn(
        'rudiment-prose',
        size !== 'base' && `rudiment-prose--${size}`,
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  )
})
```

```css
.rudiment-prose {
  --prose-space: var(--token-typography-prose-space, 1.5em);
  --prose-heading-before: var(--token-typography-prose-heading-before, 2em);
  --prose-heading-after: var(--token-typography-prose-heading-after, 0.75em);
}

/* Base spacing between all adjacent elements */
.rudiment-prose > * + * {
  margin-block-start: var(--prose-space);
}

/* More space before headings (they signal new sections) */
.rudiment-prose > :is(h1, h2, h3, h4, h5, h6) {
  margin-block-start: var(--prose-heading-before);
}

/* Less space after headings (they belong to what follows) */
.rudiment-prose > :is(h1, h2, h3, h4, h5, h6) + * {
  margin-block-start: var(--prose-heading-after);
}

/* Extra breathing room around code blocks */
.rudiment-prose > pre {
  margin-block-start: 2em;
}

.rudiment-prose > pre + * {
  margin-block-start: 2em;
}

/* No top margin on the first child */
.rudiment-prose > :first-child {
  margin-block-start: 0;
}

/* Size variants scale the base font size; em-based spacing adjusts proportionally */
.rudiment-prose--sm {
  font-size: var(--font-size-sm);
}
.rudiment-prose--lg {
  font-size: var(--font-size-lg);
}
```

The spacing values use `em`, not `rem`. This is the key detail. An `em` value scales with the element's own font size. When you render `<Prose size="sm">` inside a sidebar, the spacing contracts proportionally with the smaller text. When you render `<Prose size="lg">` for a blog post, the spacing expands. The rhythm stays correct regardless of size.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/typography-prose--all-sizes" title="Prose Levels" height="600px"}
::

## Usage

```tsx
<Prose as="article" size="base">
  <Heading level={1}>Building accessible component libraries</Heading>
  <Text>
    Component libraries are only as useful as their accessibility coverage. This
    article explores what that means in practice.
  </Text>

  <Heading level={2}>The problem with retrofitting</Heading>
  <Text>
    Adding accessibility after the fact costs more than building it in from the
    start. The reason is structural: accessible behavior affects component APIs,
    keyboard handling, and focus management.
  </Text>

  <Text>
    Consider a modal dialog. An accessible implementation requires focus
    trapping, Escape to close, scroll locking, and aria-modal. These behaviors
    are not cosmetic. They change how the component works.
  </Text>

  <pre>
    <code>{`const { dialogProps } = useDialog({}, ref);`}</code>
  </pre>

  <Text>
    React Aria provides these behaviors as hooks. The hook returns props that
    you spread onto your elements.
  </Text>
</Prose>
```

The headings get more space above (new section) and less space below (connected to the following paragraph). Consecutive paragraphs get standard spacing. The code block gets extra room. You don't need manual spacing classes.

## What's next

You now have three typography components (Heading, Text, Prose) alongside eight layout primitives, all driven by the same token system. The library handles spatial arrangement, typographic consistency, and long-form content rhythm. The next chapter adds interactive components with React Aria.
