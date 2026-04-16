import { defineCollection, z } from 'astro:content';
import { mdcGlob } from './loaders/mdc-glob.ts';

const guide = defineCollection({
  loader: mdcGlob({
    pattern: /\.md$/,
    base: './building-your-own-component-library',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { guide };
