// @ts-check
import {defineConfig} from 'astro/config';
import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
    site: 'https://linhon-portfolio.vercel.app/',
    // Pages stay fully prerendered (static). The adapter exists so routes marked `prerender = false` (the /api/chat endpoint) run as Vercel serverless functions.
    adapter: vercel(),
    integrations: [mdx(), react(), tailwind({
        applyBaseStyles: false,
    }), icon(), sitemap()],
    markdown: {
        shikiConfig: {
            theme: 'plastic',
            wrap: true,
        },
    },
    experimental: {
        svg: true,
    }});