// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from "astro:content";

// 2. Import loader(s)
import { glob } from "astro/loaders";

// 3. Define your collection(s)
const posts = defineCollection({
  loader: glob({ pattern: ["*.md", "*.mdx"], base: "src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      author: z.string().optional(),
      publishDate: z.date(),
      updateDate: z.date().optional(),
      title: z.string(),
      relatedPosts: z.array(reference("posts")).optional(),
      tags: z.array(z.string()),
      description: z.string(),
      cover: z.object({
        src: image(),
        alt: z.string().optional(),
      }),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      tags: z.array(z.string()),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      author: z.string().optional(),
      cover: image().optional(),
      ogImage: z.string().optional(),

      // changed: no longer required
      url: z.string().optional(),

      // new fields
      github: z.string().optional(),
      demo: z.string().optional(),
      award: z.union([z.string(), z.array(z.string())]).optional(),
      status: z.string().optional(),
      role: z.string().optional(),
      timeline: z.string().optional(),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { projects, posts };
