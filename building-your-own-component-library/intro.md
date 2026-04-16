---
title: 'Introduction: Build your own component library'
description: A step-by-step guide to building an accessible, token-driven React component library from an empty directory to a deployed Storybook.
order: 0
---

## About this guide

This guide walks you through building a React component library from scratch. By the end, you'll have a working system with design tokens, accessible UI components, intrinsic layout primitives, Storybook documentation, and tests.

The guide is opinionated. It makes specific technology choices and explains why. Where reasonable alternatives exist, they are noted, but the guide doesn't try to cover every possible approach. Covering every approach is how guides become unusable.

The architecture follows the same patterns used by libraries like HeroUI and Untitled UI React.

## Who this guide is for

This guide assumes you're comfortable with:

- **React** — You understand components, props, hooks, and the component lifecycle. You've built at least one project in React and aren't relying on this guide to learn React fundamentals.
- **TypeScript** — You can read and write typed interfaces, generics, and function signatures. You don't need deep expertise, but you shouldn't be encountering TypeScript for the first time.
- **CSS** — You understand the box model, flexbox, and responsive design. Familiarity with CSS custom properties is helpful but not required.
- **The terminal** — You're comfortable running commands, navigating directories, and managing packages with npm or a similar tool.
- **Node.js** — You have Node 18 or later installed. If you're unsure, run `node -v` in your terminal.

You don't need prior experience with Tailwind CSS, Storybook, design tokens, or accessibility tooling. The guide introduces each of these as they come up.

## How to get the most from this guide

**Work through chapters in order.** Chapters 1 through 3 establish the foundation — the architecture decisions and project setup that everything else builds on. Chapters 4 and later are more modular, but they reference the token system and file structure from the earlier chapters.

**Type the code, don't copy it.** Pasting code lets you get to the end faster, but typing it forces you to read each line. The goal is understanding the system, not just having a working repo.

**Read the "why" sections.** This guide explains the reasoning behind each choice. Those explanations are where the transferable knowledge lives. If you skip them, you'll have a library but not the judgment to extend it.

**Don't skip Chapter 1.** It contains no code. It's also the most important chapter. The decisions made there shape every chapter that follows.

**Expect things to break.** Build tools and package ecosystems change. If something doesn't work, check the version numbers first, then search for the error message. Each chapter specifies the versions it was written against.

**Use the companion repository as a reference.** A complete implementation of the library built in this guide is available at [GitHub](https://github.com/Rudiment-UI/rudiment-ui). If you get stuck or want to compare your output against a known-good state, the companion repository is the reference. It mirrors the final state of the guide exactly.

## Series overview

::OverflowX
| Chapter | Title | What you'll build |
| ------- | ------------------------------------- | ---------------------------------------------------------- |
| 1 | The architecture before the code | Nothing (decisions only) |
| 2 | Project setup | Empty repo with Vite, React 19, TypeScript, Tailwind CSS 4 |
| 3 | Design tokens from scratch | Three-tier token system with Style Dictionary and @theme |
| 4 | Your first layout primitive: Stack | Stack component with token-driven spacing |
| 5 | The rest of the layout system | Box, Center, Cluster, Sidebar, Switcher, Grid, Cover |
| 6 | Typography: Heading, Text, and Prose | Three typography components with long-form content rhythm |
| 7 | Accessible components with React Aria | Button and Input with full keyboard and ARIA support |
| 8 | Form components | Select, Checkbox, RadioGroup, Switch |
| 9 | Overlays and feedback | Dialog, Tooltip, Alert, Badge, Card, Tabs |
| 10 | Storybook as your documentation layer | Configuration, story conventions, the kitchen sink page |
| 11 | Testing accessible components | Vitest, Testing Library, axe-core patterns |
| 12 | Packaging and distribution | Vite library mode, npm publishing, versioning |
| 13 | What comes next | Theming, Figma alignment, scaling the system |
::
