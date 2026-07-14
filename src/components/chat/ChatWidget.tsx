import { useCallback, useEffect, useRef, useState } from "react";
import { initAgent, answerQuestion, type AgentResponse } from "@/lib/agent";
import { ME } from "@/config";

const SUGGESTED_QUESTIONS = [
  "What's her strongest project?",
  "Has she worked with embedded systems?",
  "What's her experience with AI/ML?",
  "When does she graduate?",
];

type InitState = "idle" | "loading" | "ready" | "error";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; response: AgentResponse };

let nextMessageId = 0;

function ChatIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5"
        aria-label="Assistant is typing"
      >
        {[0, 150, 300].map((delayMs) => (
          <span
            key={delayMs}
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function SeeMoreArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function BotMessage({ response }: { response: AgentResponse }) {
  if (response.type === "fallback") {
    return (
      <div className="flex justify-start" data-bot-message>
        <div className="max-w-[90%] bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">
          {response.intro}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start" data-bot-message>
      <div className="max-w-[90%] bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
        {response.answerText ? (
          <>
            {/* v3: LLM-generated answer, with source links kept underneath */}
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {response.answerText}
            </p>
            {response.chunks.some((c) => c.link) && (
              <div className="mt-3 pt-2 border-t border-gray-200 flex flex-col gap-1">
                {response.chunks
                  .filter((c) => c.link)
                  .map((chunk) => (
                    <a
                      key={chunk.id}
                      href={chunk.link}
                      className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                      style={{ color: "#16a34a" }}
                    >
                      See more: {chunk.title}
                      <SeeMoreArrow />
                    </a>
                  ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* v1: retrieved chunks shown directly */}
            <p className="text-sm text-gray-800 leading-relaxed">
              {response.intro}
            </p>
            {response.chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="mt-3 pl-3 border-l-2"
                style={{ borderColor: "#bbf7d0" }}
              >
                <p className="text-sm font-semibold text-gray-900">{chunk.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                  {chunk.text}
                </p>
                {chunk.link && (
                  <a
                    href={chunk.link}
                    className="inline-flex items-center gap-1 text-sm font-medium mt-1 hover:underline"
                    style={{ color: "#16a34a" }}
                  >
                    See more
                    <SeeMoreArrow />
                  </a>
                )}
              </div>
            ))}
          </>
        )}
        {response.note && (
          <p className="mt-2 text-xs text-gray-400 italic">{response.note}</p>
        )}
      </div>
    </div>
  );
}

export default function ChatWidget({
  initialOpen = false,
}: {
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [initState, setInitState] = useState<InitState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  // Scroll coordination: never auto-scroll after the user scrolls manually.
  const manualScrollRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const streamScrolledRef = useRef(false);

  // Kick off the (mock) model load on first open only.
  useEffect(() => {
    if (!open || initState !== "idle") return;
    setInitState("loading");
    initAgent((percent, message) => {
      setProgress(percent);
      setProgressMessage(message);
    })
      .then(() => setInitState("ready"))
      .catch(() => setInitState("error"));
  }, [open, initState]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    if (initState === "ready") inputRef.current?.focus();
    else panelRef.current?.focus();
  }, [open, initState]);

  const scrollProgrammatically = (fn: (container: HTMLDivElement) => void) => {
    const container = messagesRef.current;
    if (!container) return;
    programmaticScrollRef.current = true;
    fn(container);
    // The resulting scroll event fires asynchronously; keep the flag up
    // briefly so it is not mistaken for a manual scroll.
    setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 50);
  };

  // Align the TOP of the newest bot answer with the top of the visible chat
  // area, so the visitor reads from the beginning. Skipped once the user has
  // scrolled manually during this answer.
  const scrollBotAnswerToTop = () => {
    if (manualScrollRef.current) return;
    scrollProgrammatically((container) => {
      const bots = container.querySelectorAll<HTMLElement>("[data-bot-message]");
      const el = bots[bots.length - 1];
      if (!el) return;
      container.scrollTop +=
        el.getBoundingClientRect().top - container.getBoundingClientRect().top - 8;
    });
  };

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role === "user") {
      // Keep the just-sent question and the typing indicator in view.
      scrollProgrammatically((c) => {
        c.scrollTop = c.scrollHeight;
      });
    } else {
      scrollBotAnswerToTop();
    }
  }, [messages]);

  // First streamed token: bring the top of the incoming answer into view once.
  useEffect(() => {
    if (streamingText !== null && !streamScrolledRef.current) {
      streamScrolledRef.current = true;
      scrollBotAnswerToTop();
    }
  }, [streamingText]);

  const close = useCallback(() => {
    setOpen(false);
    // Defer until after re-render: the launcher is display:none while the
    // panel is open, and hidden elements can't receive focus.
    setTimeout(() => buttonRef.current?.focus(), 0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isAnswering || initState !== "ready") return;
    setInput("");
    manualScrollRef.current = false;
    streamScrolledRef.current = false;
    setStreamingText(null);
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId++, role: "user", text: trimmed },
    ]);
    setIsAnswering(true);
    try {
      const response = await answerQuestion(trimmed, (partial) =>
        setStreamingText(partial),
      );
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId++, role: "bot", response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId++,
          role: "bot",
          response: {
            type: "fallback",
            intro: `Something went wrong answering that. You can always reach Linh directly at ${ME.contactInfo.email}.`,
            chunks: [],
          },
        },
      ]);
    } finally {
      setStreamingText(null);
      setIsAnswering(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Floating launcher button (hidden while the panel is open) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask AI about Linh"
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 ${
          open ? "hidden" : ""
        }`}
        style={{ background: "#16a34a" }}
      >
        <ChatIcon />
      </button>

      {/* Chat panel — full-screen on phones, floating card on larger screens */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Ask AI about Linh"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="fixed z-40 bg-white flex flex-col overflow-hidden inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[520px] sm:max-w-[calc(100vw-3rem)] sm:h-[600px] sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl focus:outline-none"
        >
          {/* Header, styled after the site navbar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#0f0f1a", borderBottom: "1px solid #1a1a2e" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="rounded-full flex-shrink-0 animate-pulse"
                style={{ background: "#22c55e", width: "10px", height: "10px" }}
              />
              <div>
                <p
                  className="text-white font-bold"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "15px",
                    letterSpacing: "2px",
                    lineHeight: 1.25,
                  }}
                >
                  ASK AI
                </p>
                <p
                  style={{
                    color: "#22c55e",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    lineHeight: 1.25,
                  }}
                >
                  about Linh
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="p-2 rounded-lg transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              style={{ color: "#888" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {initState === "error" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <p
                className="font-mono text-xs tracking-widest"
                style={{ color: "#aaa" }}
              >
                ● OFFLINE
              </p>
              <p className="text-gray-800 font-semibold">
                The AI assistant couldn't load.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                No worries — you can reach Linh directly at{" "}
                <a
                  href={`mailto:${ME.contactInfo.email}`}
                  className="font-medium hover:underline"
                  style={{ color: "#16a34a" }}
                >
                  {ME.contactInfo.email}
                </a>
              </p>
            </div>
          ) : initState !== "ready" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                Loading AI model
              </p>
              <div
                className="w-full max-w-[240px] h-2 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress}%`, background: "#22c55e" }}
                />
              </div>
              <p className="font-mono text-xs tracking-widest text-gray-400">
                {progressMessage} {progress}%
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={messagesRef}
                onScroll={() => {
                  if (!programmaticScrollRef.current) manualScrollRef.current = true;
                }}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                aria-live="polite"
              >
                {messages.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-800 leading-relaxed">
                      Hi! I’m Linh’s AI portfolio assistant. Ask me anything
                      about her projects, experience, technical skills, or
                      background, and I’ll help you find the most relevant
                      information.
                    </div>
                  </div>
                )}
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-gray-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <BotMessage key={msg.id} response={msg.response} />
                  ),
                )}
                {isAnswering && streamingText && (
                  <div className="flex justify-start" data-bot-message>
                    <div className="max-w-[90%] bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {streamingText}
                      </p>
                    </div>
                  </div>
                )}
                {isAnswering && !streamingText && <TypingIndicator />}
              </div>

              {/* Suggested questions, hidden only while a question is being answered */}
              {!isAnswering && (
                <div className="px-4 pb-2">
                  <p className="font-mono text-xs tracking-widest text-gray-400 mb-2">
                    ● TRY ASKING
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        disabled={isAnswering}
                        className="px-3 py-1.5 text-sm rounded-lg font-medium border transition-colors hover:brightness-95 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                        style={{
                          background: "#f0fdf4",
                          color: "#15803d",
                          borderColor: "#bbf7d0",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                className="flex items-center gap-2 px-4 py-3 border-t border-gray-200"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isAnswering}
                  placeholder={isAnswering ? "Thinking…" : "Ask about Linh…"}
                  aria-label="Ask a question about Linh"
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isAnswering || !input.trim()}
                  aria-label="Send question"
                  className="w-10 h-10 shrink-0 rounded-lg text-white flex items-center justify-center transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                  style={{ background: "#16a34a" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
