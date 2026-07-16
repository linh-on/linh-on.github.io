# Linh On's Portfolio

This repo is the source for my personal portfolio. It includes my projects, blog posts, and work experience. If you want to ask for any details about me, I have also included an **"Ask AI about me"** chat widget that can answer questions about my background.

**Live site: [linhon-portfolio.vercel.app](https://linhon-portfolio.vercel.app/)**

## Hi, I'm Linh

I'm a Master of Computer Science student at UC Irvine (graduating December 2026). I work across three areas, and my projects usually sit where they meet:

- **Embedded systems.** Firmware in C and C++ for ESP32, Arduino, Tiva C, Raspberry Pi, and Jetson Nano, with device communication over BLE and WebSocket. Sensor and motor circuitry, and hardware bring-up and debugging.
- **Full-stack web.** React, TypeScript, and Astro on the front end, with Node.js, Express, Flask, FastAPI, PostgreSQL, and Supabase behind them. WordPress and PHP theme and plugin work at Live Good.
- **Applied machine learning.** Fine-tuned MobileBERT for notification classification in Pawse, built a content-based recommender using TF-IDF cosine similarity for DramaTracker, and implemented client-side RAG with sentence-transformer embeddings for this site.

## Featured projects

**[Pawse](https://linhon-portfolio.vercel.app/projects/pawse)** is a phone lockbox that physically locks your phone during focus sessions, paired with a React Native app over BLE. A MobileBERT classifier filters incoming notifications so only the ones that matter reach you. Built on ESP32, React Native, and Supabase. I co-developed it as CTO, leading the hardware and firmware work. Reached the semifinals of two UCI competitions, including the Stella Zhang New Venture Competition and Beall and Butterworth Competition

**[Ableware](https://linhon-portfolio.vercel.app/projects/ableware)** is a voice-controlled assistive lift for users with limited mobility. A Raspberry Pi listens for wake words and sends commands over WebSocket to coordinate the hardware and a simulation, built with Python, Arduino, FastAPI, and TypeScript. Awarded 2nd place at the 2026 UCI MCS ICS Expo.

More project write-ups and blog posts are available on the [live site](https://linhon-portfolio.vercel.app/), where you can also ask the chat widget about my experience directly.

## What's on the site

- A responsive portfolio with home, projects, blog, and contact pages
- Project write-ups and blog posts written in MDX
- An interactive "project breadboard" and a timeline-based experience section
- The "Ask AI about me" chat widget described below
- My resume, available at `public/resume.pdf` and linked from the site

---

## How the portfolio is built

The sections below cover how the site is built and how the chat widget works.

### Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) for static pages, with React islands for interactivity |
| Styling | Tailwind CSS with shadcn-style UI components |
| Content | MDX collections for projects and blog posts |
| Syntax highlighting | Shiki (`plastic` theme) |
| AI (retrieval) | [transformers.js](https://github.com/huggingface/transformers.js) for in-browser embeddings |
| AI (generation) | Google Gemini via a Vercel serverless function |
| Hosting | Vercel |

The site is static-first: every page is prerendered, and the only thing that runs on a server is the chat's answer endpoint. That keeps it fast and cheap to host while still allowing a real generative feature.

### The "Ask AI about me" widget

This is the part I'm most proud of. A floating chat button lets a visitor ask about my projects, experience, and skills, and it answers in two stages.

**1. Retrieval, in the browser.** On first open, the widget loads a small embedding model (`Xenova/all-MiniLM-L6-v2`) and fetches precomputed vectors from `public/embeddings.json`. Each question is embedded locally and matched against my knowledge base in `src/data/profile.json` by cosine similarity. Nothing leaves the browser in this step.

**2. Generation, serverless.** When retrieval finds relevant chunks, they go to `/api/chat`, which asks Google Gemini to write a short answer grounded only in those chunks, streamed back to the widget.

Some design choices worth noting:

- Questions scoring below the relevance threshold skip the LLM entirely and get an honest fallback.
- If the LLM is unavailable, the widget shows the retrieved profile notes instead of erroring.
- Questions beyond what the knowledge base covers point to my email rather than inventing an answer.

---

## Running it locally

Requires Node.js 18+.

```bash
npm install
```

Create a `.env.local` file in the repo root with a Google Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

Start the dev server at http://localhost:4321:

```bash
npm run dev
```

Without a key the site still runs, and the chat widget would show the profile notes instead of generated answers.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build for production (regenerates embeddings, runs `astro check`, then builds) |
| `npm run build:embeddings` | Regenerate `public/embeddings.json` from `src/data/profile.json` |
| `npm run preview` | Preview the production build locally |

## Project structure

```
public/            Static assets (resume.pdf, embeddings.json, favicon)
src/
  components/      Astro + React UI components (chat widget lives in chat/)
  content/
    projects/      Project write-ups (.mdx)
    posts/         Blog posts (.mdx)
  data/            Structured content (jobs, education, skills, menu)
  layouts/         Shared page layout
  lib/             agent.ts, llm-provider.ts, utilities
  pages/           Routes, including the /api/chat serverless endpoint
  config.ts        Site metadata and personal info
scripts/           Build-time embeddings generation
```

## Customizing content

| To change... | Edit |
| --- | --- |
| Name, role, bio, contact, socials | `src/config.ts` |
| Work experience | `src/data/Jobs.ts` |
| Education | `src/data/education.ts` |
| Skills and languages | `src/data/hardSkills.ts`, `src/data/softSkills.ts`, `src/data/languages.ts` |
| Navigation menu | `src/data/menu.ts` |
| Projects | `src/content/projects/*.mdx` |
| Blog posts | `src/content/posts/*.mdx` |
| Resume file | `public/resume.pdf` |
| What the chat AI knows | `src/data/profile.json` (then run `npm run build:embeddings`) |

**When you edit `src/data/profile.json`, rerun `npm run build:embeddings`** so the vectors match the text. A full `npm run build` does this automatically.

## Deployment

The site deploys to Vercel, and the Astro Vercel adapter is already configured in `astro.config.mjs`.

1. Import the repo at https://vercel.com/new. Keep the default build settings.
2. In Settings → Environment Variables, add `GEMINI_API_KEY` for the Production, Preview, and Development environments.
3. Vercel builds on every push to `main`.
