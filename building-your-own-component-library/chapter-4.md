---
title: 'Your first layout primitive: Stack'
description: The Stack is the most frequently used layout primitive you'll build.
order: 4
---

The Stack is the most frequently used layout primitive you'll build. It solves a problem so fundamental that most developers don't realize they're working around it every day: how to apply consistent vertical spacing between elements without creating orphaned margins.

## The problem

Consider a typical approach to vertical spacing:

```css
p {
  margin-bottom: 1.5rem;
}
```

This creates a margin below every paragraph. When a paragraph is followed by another element, the spacing looks right. But the last paragraph in a container gets a margin that combines with the container's padding, producing double the intended space at the bottom. The margin exists regardless of context, because the style belongs to the element rather than to the relationship between elements.

You end up writing `:last-child` overrides, or using a utility class to remove the bottom margin, or wrapping elements in containers that cancel out the extra space. These are all workarounds for the same root problem: styling elements individually when spacing is a property of adjacency.

## The solution

The Stack primitive styles the _context_ rather than the individual elements. It applies margin only between adjacent siblings, using a pattern known as the owl selector:

```css
.rudiment-stack > * + * {
  margin-block-start: var(--stack-space);
}
```

The `* + *` selector targets any element that is immediately preceded by another element. The `>` child combinator scopes it to direct children only. The result: spacing appears between elements, but never before the first child or after the last child. No `:last-child` overrides needed.

## Building the component

Create `src/layouts/Stack/Stack.tsx`:

```tsx
import { Children, cloneElement, forwardRef, isValidElement } from 'react'
import { cn } from '@/utils/cn'

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** CSS spacing value. Defaults to --token-layout-stack-space-default token. */
  space?: string
  /** Apply spacing recursively to all nested elements, not just direct children. */
  recursive?: boolean
  /** 1-based index of the child after which to insert an auto margin, splitting the stack. */
  splitAfter?: number
  /** HTML element to render. */
  as?: React.ElementType
  children?: React.ReactNode
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    space,
    recursive = false,
    splitAfter,
    as: Element = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const customProperties: Record<string, string> = {}
  if (space) customProperties['--stack-space'] = space

  // Apply margin-block-end: auto to the splitAfter child via React.
  // CSS :nth-child() does not accept custom properties, so this must
  // be handled in the component rather than in the stylesheet.
  // Children.toArray filters null/false values so conditional children
  // do not shift the numeric index.
  const childArray = Children.toArray(children)
  const styledChildren = splitAfter
    ? childArray.map((child, index) => {
        if (index === splitAfter - 1 && isValidElement(child)) {
          return cloneElement(
            child as React.ReactElement<{ style?: React.CSSProperties }>,
            {
              style: {
                ...(child.props as { style?: React.CSSProperties }).style,
                marginBlockEnd: 'auto',
              },
            },
          )
        }
        return child
      })
    : children

  return (
    <Element
      ref={ref}
      className={cn(
        'rudiment-stack',
        recursive && 'rudiment-stack--recursive',
        splitAfter && 'rudiment-stack--split',
        className,
      )}
      style={{ ...customProperties, ...style } as React.CSSProperties}
      {...props}
    >
      {styledChildren}
    </Element>
  )
})
```

Three implementation details are worth understanding:

The component doesn't import or use React Aria. Layout primitives have no interactive behavior, so they don't need accessibility hooks. They're pure CSS layout wrapped in a React component for composability and token integration.

The `space` prop is optional. When omitted, no inline `--stack-space` property is set. The CSS class sets `--stack-space` to `var(--token-layout-stack-space-default, 1.5rem)`, so the token provides the value. When provided, the inline property overrides the class-level value. This pattern gives you token-driven defaults with per-instance overrides, and the CSS does all the work.

The `as` prop lets the consumer render a semantic element. `<Stack as="ul">` renders a `<ul>` instead of a `<div>`, which matters for accessibility when the Stack's children are list items.

The component is wrapped with `forwardRef`, exposing the underlying DOM node to consumers via a `ref`. This is necessary when the Stack is used as a measurement target: scroll containers, `IntersectionObserver` roots, or elements that need programmatic focus. The ref is typed as `HTMLElement` rather than a more specific type because the `as` prop can render any element. This is a deliberate trade-off: stricter typing (where the ref type matches the rendered element) requires a polymorphic ref pattern that TypeScript doesn't support natively without a manual generic wrapper function. For most use cases, `HTMLElement` is sufficient. If your project requires the fully typed polymorphic ref, the pattern is documented in the companion repository.

## The CSS

Create `src/styles/layouts.css` (or add to it if it already exists):

```css
/* Stack */
.rudiment-stack {
  --stack-space: var(--token-layout-stack-space-default, 1.5rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.rudiment-stack > * {
  margin-block: 0;
}

.rudiment-stack > * + * {
  margin-block-start: var(--stack-space);
}

/* Recursive: apply spacing at any nesting depth */
.rudiment-stack--recursive * + * {
  margin-block-start: var(--stack-space);
}

/* Split: push elements after the nth child to the bottom */
.rudiment-stack--split {
  min-block-size: 100%;
}
```

Note: the `splitAfter` behavior is applied via React, not pure CSS. CSS `:nth-child()` accepts selector math, not custom properties, so `:nth-child(var(--n))` is invalid. Instead, the Stack component applies an inline `margin-block-end: auto` style to the correct child element.

Import this file in `src/app.css`:

```css
@import 'tailwindcss';
@import '../tokens/build/tokens.css';
@import './styles/layouts.css';

@theme inline {
  /* ... your existing @theme block ... */
}
```

The first rule resets vertical margins on all direct children to zero, preventing any inherited margin from interfering. The second rule applies the stack spacing only between adjacent siblings. The reset-then-apply pattern is what eliminates the orphaned margin problem.

The `--stack-space` custom property has a double fallback: it first checks for a value set inline by the `space` prop, then falls back to the `--token-layout-stack-space-default` token, then to `1.5rem` as a hardcoded safety net. In practice, the token value always exists (Style Dictionary generates it), so the hardcoded fallback is just insurance.

With the component and CSS in place, here's the base Stack rendered from the companion repository's Storybook. The `Default` story shown below is the same one you'll define later in this chapter.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/layouts-stack--default" title="Stacks in Storybook"}
::

## The recursive prop

By default, Stack only spaces its direct children. The `>` combinator ensures nested elements aren't affected. But sometimes you want uniform spacing at every nesting level, for example when rendering Markdown content where you don't control the nesting structure.

The `recursive` variant removes the child combinator:

```css
.rudiment-stack--recursive * + * {
  margin-block-start: var(--stack-space);
}
```

Use this sparingly. Recursive spacing affects every nested element, which means list items, nested divs, and other structures will all receive the same margin. For most layouts, nesting non-recursive Stacks with different spacing values gives you more precise control.

## The splitAfter prop

Making the Stack a flexbox column context gives it one more capability: splitting. By applying `margin-block-end: auto` to a specific child, you push everything after that child to the bottom of the available space.

This is useful for card-like layouts where you want some content at the top and a button pinned to the bottom:

```tsx
<Stack splitAfter={2} style={{ minHeight: '300px' }}>
  <h3 className="text-lg">Card title</h3>
  <p>Card description that might vary in length.</p>
  <Button>Action</Button> {/* Pushed to the bottom */}
</Stack>
```

The `splitAfter` prop tells the Stack component which child to apply `margin-block-end: auto` to via `Children.toArray` and `cloneElement`. The Stack needs a defined height (or `min-height`) for the split to produce a visible gap. Without a height constraint, the flexbox column collapses to its content height and the auto margin has no space to distribute.

## The barrel export

Create `src/layouts/Stack/index.ts`:

```typescript
export { Stack } from './Stack'
export type { StackProps } from './Stack'
```

Add it to the main entry point in `src/index.ts`:

```typescript
export { cn } from './utils/cn'
export { Stack } from './layouts/Stack'
export type { StackProps } from './layouts/Stack'
```

## Writing the stories

Create `src/layouts/Stack/Stack.stories.tsx`:

::Callout
`@storybook/react-vite` is not installed until Chapter 10. This story file is included here so you can see the full component API, but it won't run until you complete the Storybook setup in that chapter.
::

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from './Stack'

const meta = {
  title: 'Layouts/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    space: { control: 'text' },
    recursive: { control: 'boolean' },
    splitAfter: { control: 'number' },
  },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

function Placeholder({ label }: { label: string }) {
  return (
    <div className="border border-border-default rounded-md p-4 bg-surface-raised">
      {label}
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Placeholder label="First child" />
      <Placeholder label="Second child" />
      <Placeholder label="Third child" />
    </Stack>
  ),
}

export const Dense: Story = {
  args: { space: '0.5rem' },
  render: (args) => (
    <Stack {...args}>
      <Placeholder label="First" />
      <Placeholder label="Second" />
      <Placeholder label="Third" />
    </Stack>
  ),
}

export const Loose: Story = {
  args: { space: '3rem' },
  render: (args) => (
    <Stack {...args}>
      <Placeholder label="First" />
      <Placeholder label="Second" />
      <Placeholder label="Third" />
    </Stack>
  ),
}

export const SplitAfterSecond: Story = {
  args: { splitAfter: 2 },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', border: '1px dashed #ccc' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Stack {...args} style={{ height: '100%' }}>
      <Placeholder label="Top item 1" />
      <Placeholder label="Top item 2" />
      <Placeholder label="Pushed to bottom" />
    </Stack>
  ),
}

export const AsUnorderedList: Story = {
  render: () => (
    <Stack as="ul" space="0.75rem" role="list">
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </Stack>
  ),
}
```

Each story demonstrates a specific feature. `Default` shows the token-driven spacing. `Dense` and `Loose` show prop overrides. `SplitAfterSecond` shows the split behavior with a height-constrained container. `AsUnorderedList` demonstrates the `as` prop with semantic HTML.

## Writing the tests

Create `src/layouts/Stack/Stack.test.tsx`:

::Callout
`@testing-library/react` is not installed until Chapter 11. (`vitest` is installed earlier, as part of the Storybook setup in Chapter 10.) These tests are included here alongside the component so you can see what behavior is being verified, but they won't run until you complete the testing setup in Chapter 11.
::

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Stack } from './Stack'

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <p>First</p>
        <p>Second</p>
      </Stack>,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('applies the default class', () => {
    const { container } = render(
      <Stack>
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild).toHaveClass('rudiment-stack')
  })

  it('merges a custom className', () => {
    const { container } = render(
      <Stack className="mt-4">
        <p>Child</p>
      </Stack>,
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rudiment-stack')
    expect(el).toHaveClass('mt-4')
  })

  it('sets --stack-space when the space prop is passed', () => {
    const { container } = render(
      <Stack space="2rem">
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild).toHaveStyle('--stack-space: 2rem')
  })

  it('does not set inline --stack-space when space prop is omitted', () => {
    const { container } = render(
      <Stack>
        <p>Child</p>
      </Stack>,
    )
    const style = (container.firstChild as HTMLElement).getAttribute('style')
    expect(style).toBeNull()
  })

  it('applies the recursive class when recursive is true', () => {
    const { container } = render(
      <Stack recursive>
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild).toHaveClass('rudiment-stack--recursive')
  })

  it('does not apply the recursive class by default', () => {
    const { container } = render(
      <Stack>
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild).not.toHaveClass('rudiment-stack--recursive')
  })

  it('applies the split class when splitAfter is passed', () => {
    const { container } = render(
      <Stack splitAfter={2}>
        <p>A</p>
        <p>B</p>
        <p>C</p>
      </Stack>,
    )
    expect(container.firstChild).toHaveClass('rudiment-stack--split')
  })

  it('applies margin-block-end: auto to the splitAfter child', () => {
    const { container } = render(
      <Stack splitAfter={2}>
        <p>A</p>
        <p>B</p>
        <p>C</p>
      </Stack>,
    )
    const secondChild = container.firstChild?.childNodes[1] as HTMLElement
    expect(secondChild.style.marginBlockEnd).toBe('auto')
  })

  it('renders the correct element via the as prop', () => {
    const { container } = render(
      <Stack as="section">
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild?.nodeName).toBe('SECTION')
  })

  it('renders a div by default', () => {
    const { container } = render(
      <Stack>
        <p>Child</p>
      </Stack>,
    )
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('forwards additional HTML attributes', () => {
    const { container } = render(
      <Stack data-testid="my-stack" id="stack-1">
        <p>Child</p>
      </Stack>,
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('data-testid', 'my-stack')
    expect(el).toHaveAttribute('id', 'stack-1')
  })
})
```

These tests verify every prop and behavior without testing CSS rendering (which is the browser's job, not the test's). They confirm that the component sets up the correct classes and custom properties that the CSS depends on.

## What you have now

One working layout primitive, fully documented and tested. The pattern you used here (token-driven CSS custom properties, prop-based overrides, the `as` prop, class-based modifiers, `cn()` merging) applies to every layout primitive and every UI component you build from here. The next chapter builds the remaining seven layout primitives using the same pattern.
