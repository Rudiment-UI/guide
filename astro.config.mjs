// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';

import { remarkMdcDirectives } from './src/plugins/remark-mdc-directives.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://rudiment-guide.netlify.app',
  trailingSlash: 'ignore',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],

  markdown: {
    remarkPlugins: [remarkDirective, remarkMdcDirectives],
  },
});
