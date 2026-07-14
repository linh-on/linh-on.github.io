import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash";

export interface LlmTurn {
  role: "user" | "model";
  content: string;
}

export async function streamLlmAnswer(opts: {
  apiKey: string;
  system: string;
  question: string;
  history: LlmTurn[];
}): Promise<AsyncIterable<string>> {
  const ai = new GoogleGenAI({ apiKey: opts.apiKey });

  const contents = [
    ...opts.history.map((t) => ({ role: t.role, parts: [{ text: t.content }] })),
    { role: "user", parts: [{ text: opts.question }] },
  ];

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction: opts.system,
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  });

  return (async function* () {
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
  })();
}
