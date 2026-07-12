import profile from "@/data/profile.json";

export interface AnswerChunk {
  id: string;
  title: string;
  text: string;
  link?: string;
}

export interface AgentResponse {
  type: "answer" | "fallback";
  intro: string;
  chunks: AnswerChunk[];
}

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const SCORE_THRESHOLD = 0.35;
const TOP_K = 2;

type Embedder = (
  text: string,
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array }>;

let embedder: Embedder | null = null;
let vectors: Array<{ id: string; vector: number[] }> | null = null;
let initPromise: Promise<void> | null = null;

const chunksById = new Map<string, AnswerChunk>(
  profile.map((c) => [
    c.id,
    { id: c.id, title: c.title, text: c.text, ...(c.link ? { link: c.link } : {}) },
  ]),
);

function contactEmail(): string | null {
  const contact = chunksById.get("contact");
  const match = contact?.text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return match ? match[0] : null;
}

async function doInit(
  onProgress: (percent: number, message: string) => void,
): Promise<void> {
  onProgress(0, "Preparing…");

  const res = await fetch("/embeddings.json");
  if (!res.ok) {
    throw new Error(`Failed to fetch /embeddings.json (HTTP ${res.status})`);
  }
  vectors = await res.json();

  const { pipeline } = await import("@huggingface/transformers");

  const fileProgress = new Map<string, { loaded: number; total: number }>();
  let reported = 0;
  const report = (percent: number, message: string) => {
    reported = Math.max(reported, Math.min(99, Math.round(percent)));
    onProgress(reported, message);
  };

  embedder = (await pipeline("feature-extraction", MODEL_ID, {
    progress_callback: (p: {
      status: string;
      file?: string;
      loaded?: number;
      total?: number;
    }) => {
      if (
        p.status === "progress" &&
        p.file &&
        typeof p.loaded === "number" &&
        typeof p.total === "number"
      ) {
        fileProgress.set(p.file, { loaded: p.loaded, total: p.total });
        let loaded = 0;
        let total = 0;
        for (const f of fileProgress.values()) {
          loaded += f.loaded;
          total += f.total;
        }
        if (total > 0) report((loaded / total) * 100, "Downloading AI model…");
      } else if (p.status === "ready") {
        report(99, "Almost ready…");
      }
    },
  })) as unknown as Embedder;

  onProgress(100, "Ready");
}

export function initAgent(
  onProgress: (percent: number, message: string) => void,
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The AI agent can only run in the browser."));
  }
  if (!initPromise) {
    initPromise = doInit(onProgress).catch((err) => {
      initPromise = null; // a later open can retry
      throw err;
    });
  }
  return initPromise;
}

export async function answerQuestion(question: string): Promise<AgentResponse> {
  if (!embedder || !vectors) {
    throw new Error("Agent not initialized. Call initAgent first.");
  }

  const output = await embedder(question, { pooling: "mean", normalize: true });
  const q = output.data;

  const scored = vectors
    .map(({ id, vector }) => {
      let dot = 0;
      for (let i = 0; i < vector.length; i++) dot += vector[i] * q[i];
      return { id, score: dot };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < SCORE_THRESHOLD) {
    const email = contactEmail();
    return {
      type: "fallback",
      intro: email
        ? `Hmm, I don't have a good answer for that. I can only talk about Linh's projects, experience, and skills. For anything else, you can email her at ${email}.`
        : "Hmm, I don't have a good answer for that. I can only talk about Linh's projects, experience, and skills.",
      chunks: [],
    };
  }

  const top = scored
    .slice(0, TOP_K)
    .map((s) => chunksById.get(s.id))
    .filter((c): c is AnswerChunk => Boolean(c));

  return {
    type: "answer",
    intro: "Good question! Here is what I know:",
    chunks: top,
  };
}
