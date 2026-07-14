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
  /** v3: LLM-generated answer grounded in the chunks. Absent = show chunks (v1). */
  answerText?: string;
  /** Small status note, e.g. when the LLM is unavailable and we degraded to v1. */
  note?: string;
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

function fallbackIntro(): string {
  const email = contactEmail();
  return email
    ? `Hmm, I don't have a good answer for that. I can only talk about Linh's projects, experience, and skills. For anything else, you can email her at ${email}.`
    : "Hmm, I don't have a good answer for that. I can only talk about Linh's projects, experience, and skills.";
}

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

/*
 * Conversation history, kept client-side so follow-up questions like
 * "tell me more about that" carry context. Only the most recent turns are
 * sent to /api/chat (the endpoint also enforces its own cap).
 */
interface HistoryTurn {
  role: "user" | "model";
  content: string;
}
const history: HistoryTurn[] = [];
const HISTORY_SEND = 6;
const HISTORY_KEEP = 12;

/*
 * Chunks from the last answered question. Vague follow-ups ("tell me more
 * about that") embed poorly against any specific chunk, so retrieval alone
 * would bounce them to the fallback. When a below-threshold question looks
 * like a continuation of the conversation, we reuse these chunks and let the
 * LLM plus history handle it. Questions without continuation words (e.g.
 * "what's the weather") still fall back without an LLM call.
 */
let lastChunks: AnswerChunk[] = [];
const CONTINUATION_WORDS =
  /\b(more|that|this|it|those|these|them|why|how|else|again|elaborate|details?)\b/i;

function remember(role: HistoryTurn["role"], content: string) {
  history.push({ role, content });
  if (history.length > HISTORY_KEEP) history.splice(0, history.length - HISTORY_KEEP);
}

/**
 * v3 generation step: ask /api/chat (a serverless function) to write a
 * conversational answer grounded in the retrieved chunks, streaming the
 * text as it arrives. Throws on any failure; the caller degrades to v1.
 */
async function generateAnswer(
  question: string,
  top: AnswerChunk[],
  priorHistory: HistoryTurn[],
  onToken?: (partialText: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      chunks: top.map(({ title, text }) => ({ title, text })),
      history: priorHistory,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`/api/chat failed (HTTP ${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    if (text.trim()) onToken?.(text);
  }
  text = (text + decoder.decode()).trim();
  if (!text) throw new Error("Empty LLM response");
  return text;
}

export async function answerQuestion(
  question: string,
  onToken?: (partialText: string) => void,
): Promise<AgentResponse> {
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
  const belowThreshold = !best || best.score < SCORE_THRESHOLD;
  const isFollowUp =
    belowThreshold &&
    lastChunks.length > 0 &&
    history.length > 0 &&
    // Genuine anaphoric follow-ups are short; their content lives in the
    // history. Longer questions carry their own topic and must earn real
    // retrieval instead of inheriting stale chunks.
    question.trim().split(/\s+/).length <= 4 &&
    CONTINUATION_WORDS.test(question);

  if (belowThreshold && !isFollowUp) {
    // Honest fallback, and no LLM call (saves quota).
    const intro = fallbackIntro();
    remember("user", question);
    remember("model", intro);
    return { type: "fallback", intro, chunks: [] };
  }

  const top = belowThreshold
    ? lastChunks // continuation of the previous topic
    : scored
        .slice(0, TOP_K)
        .map((s) => chunksById.get(s.id))
        .filter((c): c is AnswerChunk => Boolean(c));

  const priorHistory = history.slice(-HISTORY_SEND);
  remember("user", question);

  try {
    const answerText = await generateAnswer(question, top, priorHistory, onToken);
    remember("model", answerText);
    lastChunks = top;
    return { type: "answer", intro: "", answerText, chunks: top };
  } catch {
    if (isFollowUp) {
      // Heuristic-routed question: the reused chunks were never retrieved
      // for THIS question, so they must not be shown as its answer. Honest
      // fallback instead of the v1 chunk display.
      const intro = fallbackIntro();
      remember("model", intro);
      return { type: "fallback", intro, chunks: [] };
    }
    // Retrieval-routed question with the LLM unavailable (offline, quota,
    // static host with no API routes): degrade to v1 chunk display.
    const intro = "Good question! Here is what I know:";
    remember("model", top.map((c) => `${c.title}: ${c.text}`).join("\n"));
    lastChunks = top;
    return {
      type: "answer",
      intro,
      chunks: top,
      note: "The full AI answer mode is unavailable right now, so here are the most relevant notes from Linh's profile instead.",
    };
  }
}
