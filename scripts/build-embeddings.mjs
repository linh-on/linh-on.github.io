/*
 * Build step for the "Ask AI about me" chat widget.
 *
 * Reads the knowledge base chunks from src/data/profile.json, embeds each
 * chunk's title + text with the same model the browser uses at runtime
 * (Xenova/all-MiniLM-L6-v2), and writes the vectors to public/embeddings.json
 * as [{ id, vector }].
 *
 * The "source" field on each chunk is documentation only and is ignored here.
 *
 * Run via: npm run build:embeddings (runs automatically before `npm run build`)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pipeline } from "@huggingface/transformers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chunksPath = path.join(root, "src", "data", "profile.json");
const outPath = path.join(root, "public", "embeddings.json");

const chunks = JSON.parse(await readFile(chunksPath, "utf8"));

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

const embeddings = [];
for (const chunk of chunks) {
    const input = `${chunk.title}. ${chunk.text}`;
    const output = await extractor(input, { pooling: "mean", normalize: true });
    // Round to 6 decimals to keep the JSON small; cosine scores are unaffected at the precision we threshold on.
    const vector = Array.from(output.data).map((v) => Number(v.toFixed(6)));
    embeddings.push({ id: chunk.id, vector });
}

await writeFile(outPath, JSON.stringify(embeddings));
