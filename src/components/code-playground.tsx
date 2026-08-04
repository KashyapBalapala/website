"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Copy, Check, RotateCcw } from "lucide-react";

interface CodeDemo {
  title: string;
  description: string;
  language: string;
  code: string;
  runnable?: boolean;
}

const DEMOS: CodeDemo[] = [
  {
    title: "Retry with Exponential Backoff",
    description: "Production retry pattern used in SAP integration pipelines.",
    language: "javascript",
    runnable: true,
    code: `async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** i, 10000);
      console.log(\`Retry \${i + 1}/\${maxRetries} in \${delay}ms\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Demo: simulate flaky API
let attempts = 0;
const flakyApi = () => {
  attempts++;
  if (attempts < 3) throw new Error("Connection timeout");
  return { status: "ok", data: "Transaction processed" };
};

retryWithBackoff(flakyApi).then(r => console.log("Success:", r));`,
  },
  {
    title: "Chunked Vector Search",
    description: "Semantic search with cosine similarity from the RAG project.",
    language: "javascript",
    runnable: true,
    code: `function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Demo: find most similar document
const query = [0.8, 0.1, 0.9, 0.3];
const docs = [
  { id: "setup-guide", vec: [0.7, 0.2, 0.85, 0.4] },
  { id: "api-reference", vec: [0.1, 0.9, 0.2, 0.8] },
  { id: "troubleshoot", vec: [0.75, 0.15, 0.88, 0.35] },
];

const ranked = docs
  .map(d => ({ ...d, score: cosineSimilarity(query, d.vec) }))
  .sort((a, b) => b.score - a.score);

ranked.forEach(d =>
  console.log(\`\${d.id}: \${(d.score * 100).toFixed(1)}% match\`)
);`,
  },
  {
    title: "Message Queue Consumer",
    description: "Async message processing pattern from RabbitMQ workflows.",
    language: "javascript",
    runnable: true,
    code: `class MessageQueue {
  constructor() { this.queue = []; this.handlers = []; }

  publish(msg) {
    this.queue.push({ ...msg, timestamp: Date.now() });
    this.process();
  }

  subscribe(handler) { this.handlers.push(handler); }

  async process() {
    while (this.queue.length > 0) {
      const msg = this.queue.shift();
      for (const handler of this.handlers) {
        await handler(msg);
      }
    }
  }
}

// Demo
const queue = new MessageQueue();
queue.subscribe(msg => console.log("Handler A:", msg.type, msg.payload));
queue.subscribe(msg => console.log("Handler B: processed", msg.type));

queue.publish({ type: "ORDER_CREATED", payload: { id: 1001 } });
queue.publish({ type: "INVENTORY_UPDATE", payload: { sku: "X42" } });`,
  },
];

function CodeBlock({ demo }: { demo: CodeDemo }) {
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);

  const runCode = () => {
    setRunning(true);
    setOutput([]);
    const logs: string[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    };
    try {
      const fn = new Function("console", demo.code);
      const result = fn(fakeConsole);
      if (result && typeof result.then === "function") {
        result.then(() => {
          setOutput([...logs]);
          setRunning(false);
        });
        setTimeout(() => {
          setOutput([...logs]);
          setRunning(false);
        }, 4000);
      } else {
        setOutput(logs);
        setRunning(false);
      }
    } catch (e: any) {
      setOutput([...logs, `Error: ${e.message}`]);
      setRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(demo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => setOutput([]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-white/5">
        <div>
          <h4 className="text-sm font-semibold">{demo.title}</h4>
          <p className="text-xs text-muted-foreground">{demo.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyCode}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground" />
            )}
          </button>
          {demo.runnable && (
            <>
              {output.length > 0 && (
                <button
                  onClick={reset}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="size-3.5 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={runCode}
                disabled={running}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Play className="size-3" />
                {running ? "Running..." : "Run"}
              </button>
            </>
          )}
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-foreground/80 max-h-[280px]">
        <code>{demo.code}</code>
      </pre>
      {output.length > 0 && (
        <div className="border-t border-white/10 dark:border-white/5 bg-black/5 dark:bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
            Output
          </div>
          <pre className="text-xs font-mono text-green-600 dark:text-green-400 whitespace-pre-wrap">
            {output.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

export function CodePlayground() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
      className="space-y-content-md"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Live Code.</h2>
        <p className="text-muted-foreground md:text-lg/relaxed max-w-md mx-auto">
          Patterns from production — run them right here.
        </p>
      </div>

      <div className="space-y-4">
        {DEMOS.map((demo, i) => (
          <motion.div
            key={demo.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <CodeBlock demo={demo} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
