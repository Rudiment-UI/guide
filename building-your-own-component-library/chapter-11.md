---
title: 'Testing accessible components'
description: This chapter covers the testing tools and what to test for each component type.
order: 11
---

Tests give you confidence to change things. In a component library, that confidence matters more than usual, because a regression in one component affects every consumer of the library. This chapter covers the testing tools and what to test for each component type.

## Install dependencies

This installs the packages required for the test files introduced in Chapter 4. The Stack tests created there can now be run.

`vitest` was already installed in Chapter 10 as part of the Storybook setup. Install only the remaining dependencies:

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom vitest-axe
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect'
```

This extends Vitest's `expect` with DOM matchers (`toBeInTheDocument`, `toHaveClass`, `toHaveAttribute`) and axe-core matchers (`toHaveNoViolations`).

## The two categories of tests

Layout primitive tests verify that the React component correctly applies the CSS classes and custom properties that the CSS depends on. They don't test the visual layout itself (that's the browser's job).

UI component tests verify behavior: keyboard interaction, ARIA attributes, focus management, and the absence of axe-core violations. They test that the component is usable by keyboard and screen reader users, not just mouse users.

## Testing layout primitives

Layout primitive tests confirm:

1. The component renders its children.
2. The component applies the correct CSS class.
3. The component merges a custom `className`.
4. Props set inline custom properties.
5. Omitted props don't set inline styles; the CSS token fallback applies instead.
6. The `as` prop changes the rendered element.
7. Boolean props apply modifier classes.

The Stack tests from Chapter 4 demonstrate this pattern. Every layout primitive uses the same test structure with primitive-specific additions (Sidebar checks for exactly two children, Switcher checks `limit`).

## Testing UI components

UI component tests have more to verify. Here's the standard checklist, followed by an example:

**Rendering:** The component is findable by role and accessible name.

**Keyboard activation:** The component responds to the correct keys (Enter, Space, Arrow keys, Escape).

**Disabled state:** The component has `aria-disabled="true"` and does not respond to interaction.

**Error state:** The component has `aria-invalid="true"` and the error message is linked via `aria-describedby`.

**Focus behavior:** Focus moves to the expected element on interaction (for example, into the dialog on open, back to the trigger on close).

**Loading state:** The component sets `aria-busy="true"`, does not respond to interaction, and renders a visible loading indicator.

**Ref forwarding:** The ref reaches the underlying DOM element so consumers can control focus programmatically.

**axe-core audit:** No automated accessibility violations.

```typescript
// src/components/Input/Input.test.tsx
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with its label as the accessible name', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('accepts text input', async () => {
    const onChange = vi.fn();
    render(<Input label="Email" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenLastCalledWith('hello');
  });

  it('shows the description and links it via aria-describedby', () => {
    render(<Input label="Email" description="Your work email" />);
    const input = screen.getByRole('textbox');
    const description = screen.getByText('Your work email');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(description.id));
  });

  it('shows the error message and sets aria-invalid', () => {
    render(<Input label="Email" errorMessage="Required field" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('hides the description when an error message is present', () => {
    render(<Input label="Email" description="Your work email" errorMessage="Required" />);
    expect(screen.queryByText('Your work email')).not.toBeInTheDocument();
  });

  it('marks the input as required', () => {
    render(<Input label="Email" isRequired />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('disables the input', () => {
    render(<Input label="Email" isDisabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('forwards ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Input label="Email" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in error state', async () => {
    const { container } = render(<Input label="Email" errorMessage="Required" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

The Button loading state tests follow the same pattern. They verify the ARIA contract and the absence of interaction side effects:

```typescript
// src/components/Button/Button.test.tsx (loading state tests)
it('sets aria-busy when loading', () => {
  render(<Button isLoading>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
});

it('does not call onPress while loading', async () => {
  const onPress = vi.fn();
  render(<Button isLoading onPress={onPress}>Save</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(onPress).not.toHaveBeenCalled();
});

it('renders a visible loading indicator', () => {
  render(<Button isLoading>Save</Button>);
  expect(screen.getByRole('button')).toContainElement(screen.getByRole('img', { hidden: true }));
});

it('has no accessibility violations while loading', async () => {
  const { container } = render(<Button isLoading>Save</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

Notice the testing approach: every assertion uses accessible queries (`getByRole`, `getByText`) or ARIA attributes (`aria-invalid`, `aria-describedby`, `aria-required`). No test queries by CSS class name or internal DOM structure. This is deliberate. If you refactor the component's markup, the tests still pass as long as you preserve the behavior and accessibility contract. Testing implementation details couples your tests to your markup and makes refactoring painful.

## Running tests

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

```bash
npm test                    # Run all tests once
npm run test:watch          # Re-run on file changes
npx vitest Input            # Run tests for a specific component
npm run test:coverage       # Generate a coverage report
```

## Coverage targets

::OverflowX
| Category | Target |
| ----------------- | ----------------------------------------------------------- |
| Layout primitives | 100% of props, class application, custom property injection |
| UI components | Every keyboard path, every ARIA attribute, every state |
| axe-core | Every component passes with zero violations |
| Visual regression | Deferred to a future release |
::

Full coverage of accessible behavior is more valuable than full line coverage. A test suite that verifies every keyboard path and ARIA attribute catches the regressions that matter most to component library consumers.

The test examples in chapters 4–8 omit axe-core assertions for brevity. The axe-core coverage target applies to every component, not just the Button and Input shown above. Apply the `toHaveNoViolations()` check from the Input and Button examples to each component's test file.
