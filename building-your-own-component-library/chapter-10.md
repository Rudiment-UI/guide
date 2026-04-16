---
title: 'Storybook as your documentation layer'
description: 'This chapter configures Storybook 10 and establishes the story conventions that make the documentation useful.'
order: 10
---

A component library without documentation is a collection of files. Storybook turns your components into a browsable, interactive catalog that serves as both the development environment and the buyer-facing documentation. This chapter configures Storybook 10 and establishes the story conventions that make the documentation useful.

## Installation

```bash
npm create storybook@latest
```

This guide uses Storybook 10. `@latest` installs whatever version is current at the time you follow the guide — if the current version is not Storybook 10, the configuration format may differ from the examples below.

The CLI detects your Vite + React setup and asks a few questions. When prompted for configuration, choose **Recommended** — this installs the a11y, docs, and Vitest addons along with their dependencies, including Playwright. When the CLI asks whether to install Playwright with Chromium, choose **Yes**.

The recommended configuration installs these devDependencies:

- `storybook`, `@storybook/react-vite`
- `@chromatic-com/storybook`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`
- `vitest`, `playwright`, `@vitest/browser-playwright`, `@vitest/coverage-v8`

It generates `.storybook/main.ts`, `.storybook/preview.ts`, and `.storybook/vitest.setup.ts`, and updates `vite.config.ts`. Use the generated files as a starting point, then modify `main.ts` and `preview.ts` as shown below.

## Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
}

export default config
```

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react'
import '../src/app.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {},
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light'
      return (
        <div className={theme === 'dark' ? 'dark' : ''}>
          <div className="bg-surface text-text-default p-8 min-h-screen">
            <Story />
          </div>
        </div>
      )
    },
  ],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
}

export default preview

```

The `preview.ts` configuration does three things.

It imports `app.css`, which loads your token values and Tailwind styles into Storybook's rendering iframe. Without this import, your components render without any styling.

The decorator wraps every story in a themed container. The `theme` global type adds a toggle to Storybook's toolbar, and the decorator reads the current theme selection and applies the `.dark` class to the wrapper. When you add dark theme token overrides (see Chapter 12), the toggle switches between them.

> **Note:** The dark mode toggle is present in Storybook now, but switching to dark mode won't produce any visible change until Chapter 12 adds the `.dark` CSS overrides. If you deploy Storybook after this chapter, the toggle will exist but have no effect.

The a11y addon configuration runs axe-core on every story automatically. Each story page shows an "Accessibility" panel listing violations, passes, and incomplete checks. Buyers see the accessibility status of every component without running any tests.

## Story organization

Storybook's sidebar organizes stories into three sections:

::OverflowX
| Section | Title prefix | Contents |
| ---------- | ------------------------------------------------ | -------------------------------------------- |
| Layouts | `Layouts/Stack`, `Layouts/Sidebar`, etc. | One entry per layout primitive |
| Components | `Components/Button`, `Components/Input`, etc. | One entry per UI component |
| Examples | `Examples/Dashboard`, `Examples/LoginPage`, etc. | Composed pages demonstrating the full system |
::

The `title` field in each story's meta object controls this organization. Storybook groups stories alphabetically within each section.

## What every story file includes

For layout primitives:

1. **Default**: The primitive with token defaults and placeholder children.
2. **Custom props**: The primitive with explicit prop values demonstrating customization.
3. **Composed**: The primitive nested inside or containing other primitives.

For UI components:

1. **Default**: The component in its default state.
2. **Variants**: One story per visual variant.
3. **States**: Stories for disabled, loading, error, and any other states.
4. **Composed**: The component inside a layout primitive, demonstrating a realistic arrangement (for example, form fields in a Stack, buttons in a Cluster).

Every meta object includes `tags: ['autodocs']`. This generates a documentation page automatically from the story metadata and TypeScript prop types. The auto-generated docs page shows the props table, the default story, and all named stories with their controls.

## The kitchen sink page

The kitchen sink is a single story that composes the entire system into a realistic page. It lives at `src/examples/Dashboard.stories.tsx` with the title `Examples/Dashboard`.

This story serves two purposes: it's the final integration test (if the dashboard renders correctly, the system works), and it's the centerpiece of your sales page. Deploy Storybook publicly, and the kitchen sink page is what buyers see when they click "View demo."

Build the kitchen sink after all components are complete. Use as many layout primitives and UI components as possible in a layout a real product would use: a header with navigation, a sidebar, a main content area with cards and a data grid, a form, and tabbed content.

## Deploying Storybook

Add the build script to `package.json` so the command has a named, consistent form:

```json
{
  "scripts": {
    "build:storybook": "storybook build -o storybook-static"
  }
}
```

Then build the static Storybook site:

```bash
npm run build:storybook
```

The `storybook-static` directory is a static site you can deploy to any hosting provider. Vercel and Netlify both deploy static sites from a Git repository with zero configuration. Point the build command to `npm run build:storybook` and the output directory to `storybook-static`.

The deployed URL becomes the public demo linked from your sales page and README.

## What you have now

You now have a fully configured Storybook instance with accessibility audits, a dark mode toggle, organized sidebar navigation, and a kitchen sink demo page. Every component and layout primitive has stories that document its API and demonstrate its behavior. The deployed Storybook is your living documentation and your public demo.
