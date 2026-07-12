// MOCK ENGINE
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

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * MOCK: fakes a model download by ticking progress from 0 to 100 over ~2s.
 * The real version will download and initialize an embedding model here.
 */
export async function initAgent(
  onProgress: (percent: number, message: string) => void,
): Promise<void> {
  const totalSteps = 20;
  for (let step = 0; step <= totalSteps; step++) {
    const percent = Math.round((step / totalSteps) * 100);
    let message = "Downloading model…";
    if (percent >= 90) message = "Almost ready…";
    else if (percent >= 60) message = "Warming up the model…";
    onProgress(percent, message);
    if (step < totalSteps) await delay(100);
  }
}

// Canned responses keyed by rough topic so the suggested questions demo well.
const SAMPLE_RESPONSES: Array<{ match: RegExp; response: AgentResponse }> = [
  {
    match: /strongest|best|favorite|top.*project/i,
    response: {
      type: "answer",
      intro: "Linh's strongest project is probably Pawse. Here's why:",
      chunks: [
        {
          id: "pawse-1",
          title: "Pawse: AI-powered phone lockbox",
          text: "A phone lockbox that physically locks your phone during focus sessions, with AI-powered notification filtering via MobileBERT running on-device. It spans hardware (ESP32, BLE), mobile (React Native), and ML.",
          link: "/projects/pawse",
        },
        {
          id: "pawse-2",
          title: "Competition results",
          text: "Pawse was co-developed as a hardware startup project and reached the semifinals of two UCI competitions.",
        },
      ],
    },
  },
  {
    match: /embedded|hardware|microcontroller|arduino|esp32|raspberry/i,
    response: {
      type: "answer",
      intro: "Yes, embedded systems are one of Linh's core strengths:",
      chunks: [
        {
          id: "embedded-1",
          title: "Ableware: voice-controlled assistive lift",
          text: "A Raspberry Pi listens for wake words and sends commands over WebSocket to coordinate hardware and simulation, built with Python, Arduino, and FastAPI.",
          link: "/projects/ableware",
        },
        {
          id: "embedded-2",
          title: "Obstacle avoidance vehicle",
          text: "An autonomous vehicle built on embedded hardware that detects and steers around obstacles in real time.",
          link: "/projects/obstacle-avoidance-vehicle",
        },
        {
          id: "embedded-3",
          title: "Tooling",
          text: "Hands-on with ESP32, Raspberry Pi, Arduino, Tiva C, and Jetson Nano, plus Verilog and VHDL coursework.",
        },
      ],
    },
  },
  {
    match: /ai|ml|machine.?learning|model|neural/i,
    response: {
      type: "answer",
      intro: "Linh has applied AI/ML across several projects:",
      chunks: [
        {
          id: "ml-1",
          title: "Pawse: MobileBERT notification filtering",
          text: "Used MobileBERT to classify incoming notifications on-device and decide which ones matter enough to interrupt a focus session.",
          link: "/projects/pawse",
        },
        {
          id: "ml-2",
          title: "Deep Diabetes Risk",
          text: "A deep-learning model that predicts diabetes risk from health indicators, built with Python and scikit-learn.",
          link: "/projects/deep-diabetes-risk",
        },
        {
          id: "ml-3",
          title: "DramaTracker: recommendation engine",
          text: "Content-based filtering recommendation engine using TF-IDF cosine similarity.",
          link: "/projects/drama-tracker",
        },
      ],
    },
  },
  {
    match: /graduat|finish.*school|degree|when.*done/i,
    response: {
      type: "answer",
      intro: "Here's Linh's graduation timeline:",
      chunks: [
        {
          id: "grad-1",
          title: "MS in Computer Science, UC Irvine",
          text: "Graduating in December 2026. She already holds a BS in Computer Science and Engineering, graduated Cum Laude.",
        },
      ],
    },
  },
];

const DEFAULT_RESPONSE: AgentResponse = {
  type: "answer",
  intro: "Here's what I know that seems most relevant:",
  chunks: [
    {
      id: "default-1",
      title: "About Linh",
      text: "Linh On is a Software Engineer & Embedded Systems Engineer and an MS CS student at UC Irvine, graduating December 2026. She builds across the stack: full-stack web apps, embedded systems, and robotics.",
    },
    {
      id: "default-2",
      title: "Featured work",
      text: "Her featured projects include Pawse, Ableware, and DramaTracker.",
      link: "/projects",
    },
  ],
};

/**
 * MOCK: waits ~500ms and returns hardcoded sample data.
 * Questions mentioning "weather" return the "fallback" type so that path
 * can be exercised in the UI.
 */
export async function answerQuestion(question: string): Promise<AgentResponse> {
  await delay(500);

  if (/weather/i.test(question)) {
    return {
      type: "fallback",
      intro:
        "Hmm, that doesn't seem to be about Linh. I can only answer questions about her projects, experience, and skills. Try one of the suggestions!",
      chunks: [],
    };
  }

  const matched = SAMPLE_RESPONSES.find(({ match }) => match.test(question));
  return matched ? matched.response : DEFAULT_RESPONSE;
}
