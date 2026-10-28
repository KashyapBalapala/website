import { DATA } from "@/data/resume";
import { techCategories } from "@/components/tech-stack";

// ---- Visitor personas --------------------------------------------------------

export type Persona = "hiring" | "engineer" | "browsing";

export const PERSONAS: Record<Persona, { label: string; intro: string; next: string[]; idle: string[] }> = {
  hiring: {
    label: "I'm hiring",
    intro: "great, here's the fast path: 'hire' is the 30-second pitch, and 'match' scores me against your job description.",
    next: ["hire", "match", "experience", "resume"],
    idle: ["hire", "match <paste a job description>", "experience", "resume"],
  },
  engineer: {
    label: "I'm an engineer",
    intro: "nice. it's a real-ish shell: ls, cd, cat, pipes, ctrl+r. start with 'tree', or 'github' for live repos.",
    next: ["tree", "projects", "github", "typing"],
    idle: ["tree", "projects | grep python", "github", "typing"],
  },
  browsing: {
    label: "just browsing",
    intro: "welcome! there are hidden commands, a quiz, a typing test and two games. 'secrets' keeps score.",
    next: ["secrets", "quiz", "snake", "tour"],
    idle: ["quiz", "secrets", "snake", "tour", "banner <your name>"],
  },
};

export const PERSONA_KEYS = Object.keys(PERSONAS) as Persona[];

// ---- Greeting ----------------------------------------------------------------

export function greeting(name: string | null) {
  const hour = new Date().getHours();
  const part = hour < 5 ? "up late" : hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : "good evening";
  const fmt = (tz?: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date());
  const yours = fmt();
  const mine = fmt("Asia/Kolkata");
  const when = yours === mine ? `it's ${mine} for both of us.` : `it's ${yours} for you, ${mine} here in Hyderabad.`;
  return `${part}${name ? `, ${name}` : ""}. ${when}`;
}

// Where the visitor came from: a ?ref= tag you put in links, or the referring site
export function arrival(ref: string | null, referrer: string): string | null {
  const tag = ref?.replace(/[^\w -]/g, "").slice(0, 24).trim();
  if (tag) return `welcome, ${tag}. glad you made it.`;
  let host = "";
  try {
    host = new URL(referrer).hostname;
  } catch {
    return null;
  }
  if (host.includes("linkedin")) return "welcome, LinkedIn friend. 'hire' is the fast path.";
  if (host.includes("github")) return "welcome from GitHub. try 'github' for my latest repos, or 'tree' to look around.";
  if (/google|bing|duckduckgo/.test(host)) return "found me through search? 'about' is a good place to start.";
  if (host && host !== window.location.hostname) return `welcome, visitor from ${host}.`;
  return null;
}

// ---- banner: big ASCII letters ---------------------------------------------------

const FONT: Record<string, string[]> = {
  A: [" ### ", "#   #", "#####", "#   #", "#   #"], B: ["#### ", "#   #", "#### ", "#   #", "#### "],
  C: [" ####", "#    ", "#    ", "#    ", " ####"], D: ["#### ", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "#### ", "#    ", "#####"], F: ["#####", "#    ", "#### ", "#    ", "#    "],
  G: [" ####", "#    ", "#  ##", "#   #", " ### "], H: ["#   #", "#   #", "#####", "#   #", "#   #"],
  I: ["#####", "  #  ", "  #  ", "  #  ", "#####"], J: ["#####", "   # ", "   # ", "#  # ", " ##  "],
  K: ["#   #", "#  # ", "###  ", "#  # ", "#   #"], L: ["#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "#   #", "#   #"], N: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", " ### "], P: ["#### ", "#   #", "#### ", "#    ", "#    "],
  Q: [" ### ", "#   #", "# # #", "#  # ", " ## #"], R: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
  S: [" ####", "#    ", " ### ", "    #", "#### "], T: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", " ### "], V: ["#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "# # #", "## ##", "#   #"], X: ["#   #", " # # ", "  #  ", " # # ", "#   #"],
  Y: ["#   #", " # # ", "  #  ", "  #  ", "  #  "], Z: ["#####", "   # ", "  #  ", " #   ", "#####"],
  "0": [" ### ", "#  ##", "# # #", "##  #", " ### "], "1": ["  #  ", " ##  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "  ## ", " #   ", "#####"], "3": ["#### ", "    #", " ### ", "    #", "#### "],
  "4": ["#   #", "#   #", "#####", "    #", "    #"], "5": ["#####", "#    ", "#### ", "    #", "#### "],
  "6": [" ### ", "#    ", "#### ", "#   #", " ### "], "7": ["#####", "    #", "   # ", "  #  ", "  #  "],
  "8": [" ### ", "#   #", " ### ", "#   #", " ### "], "9": [" ### ", "#   #", " ####", "    #", " ### "],
  " ": ["   ", "   ", "   ", "   ", "   "], "!": ["#", "#", "#", " ", "#"], "?": [" ### ", "#   #", "  ## ", "     ", "  #  "],
  "-": ["    ", "    ", "####", "    ", "    "], ".": [" ", " ", " ", " ", "#"],
};

export function banner(text: string) {
  const chars = Array.from(text.toUpperCase().slice(0, 12)).filter((c) => FONT[c]);
  return [0, 1, 2, 3, 4].map((row) => chars.map((c) => FONT[c][row]).join(" ").replace(/#/g, "█"));
}

// ---- quiz ------------------------------------------------------------------------

export interface Question {
  q: string;
  options: string[];
  answer: string;
  why: string;
}

export const QUIZ: Question[] = [
  { q: "Where does Kashyap work right now?", options: ["Innovapptive", "Google", "DRDO"], answer: "Innovapptive", why: "Software Engineer at Innovapptive since Apr 2025." },
  { q: "Which message broker powers his async workflows at work?", options: ["RabbitMQ", "ActiveMQ", "NATS"], answer: "RabbitMQ", why: "RabbitMQ-based workflows handling 4K messages a day." },
  { q: "By how much did he cut document-processing latency?", options: ["35%", "10%", "70%"], answer: "35%", why: "Scalable ingestion pipelines across AWS S3 and Azure Blob." },
  { q: "Where did he do his AI research internship?", options: ["DRDO", "ISRO", "IIT Kanpur"], answer: "DRDO", why: "Improved ResNet/VGG models for image classification at DRDO." },
  { q: "Which vector database does his Medical RAG Assistant use?", options: ["ChromaDB", "Pinecone", "Weaviate"], answer: "ChromaDB", why: "Local embeddings stored in ChromaDB, answers from a local Ollama LLM." },
];

export const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

// ---- typing test -------------------------------------------------------------------

export const SNIPPETS = [
  "const answer = await retrieve(query).then(rerank);",
  "SELECT title FROM projects WHERE stack LIKE '%python%';",
  'git commit -m "ship it" && git push origin main',
  "for (const job of queue) await process(job);",
  "docker compose up -d && npm run db:migrate",
];

export function typingScore(target: string, typed: string, ms: number) {
  const correct = Array.from(typed).filter((ch, i) => ch === target[i]).length;
  const accuracy = Math.round((correct / Math.max(target.length, typed.length)) * 100);
  const wpm = Math.round(correct / 5 / Math.max(ms / 60_000, 1 / 60));
  return { wpm, accuracy };
}

// ---- match: score a job description against the portfolio ---------------------------

// Terms worth spotting in a job description, with the patterns that mean them
const TECH: [string, RegExp][] = [
  ["TypeScript", /\btypescript\b|\bts\b/], ["JavaScript", /\bjavascript\b|(?<![.\w])js\b|\becmascript\b/], ["Python", /\bpython\b/],
  ["Java", /\bjava\b(?!script)/], ["Go", /\bgolang\b|\bgo\s*(lang|developer|engineer|services?)\b/], ["Rust", /\brust\b/], ["C++", /c\+\+/], ["C#", /c#|\.net\b/],
  ["Node.js", /\bnode(\.?js)?\b/], ["Express", /\bexpress(\.js)?\b/], ["NestJS", /\bnest(\.?js)?\b/], ["Django", /\bdjango\b/],
  ["FastAPI", /\bfastapi\b/], ["Flask", /\bflask\b/], ["Spring", /\bspring( boot)?\b/],
  ["React", /\breact(\.js)?\b/], ["Angular", /\bangular\b/], ["Vue", /\bvue(\.js)?\b/], ["Next.js", /\bnext\.?js\b/],
  ["HTML", /\bhtml5?\b/], ["CSS", /\bcss3?\b|\btailwind\b/],
  ["SQL", /\bsql\b/], ["PostgreSQL", /\bpostgres(ql)?\b/], ["MySQL", /\bmysql\b/], ["MongoDB", /\bmongo(db)?\b/],
  ["Redis", /\bredis\b/], ["Elasticsearch", /\belastic(search)?\b/], ["DynamoDB", /\bdynamo(db)?\b/],
  ["Kafka", /\bkafka\b/], ["RabbitMQ", /\brabbitmq\b/], ["GraphQL", /\bgraphql\b/], ["REST", /\brestful\b|\brest ?apis?\b|\brest services?\b/], ["WebSocket", /\bwebsockets?\b|\bsocket\.io\b/],
  ["Docker", /\bdocker\b|\bcontainers?\b/], ["Kubernetes", /\bkubernetes\b|\bk8s\b/], ["Terraform", /\bterraform\b/], ["CI/CD", /\bci\/?cd\b|\bjenkins\b|\bgithub actions\b/],
  ["AWS", /\baws\b|\bamazon web services\b|\bs3\b|\blambda\b/], ["Azure", /\bazure\b/], ["GCP", /\bgcp\b|\bgoogle cloud\b/],
  ["Microservices", /\bmicro-?services?\b/], ["Distributed systems", /\bdistributed( systems?)?\b/], ["System design", /\bsystem design\b|\barchitect/],
  ["Event-driven", /\bevent[- ]driven\b|\bmessage queues?\b|\bpub\/?sub\b/],
  ["LLMs", /\bllms?\b|\blarge language models?\b|\bgenai\b|\bgenerative ai\b/], ["RAG", /\brag\b|\bretrieval[- ]augmented\b/],
  ["LangChain", /\blangchain\b/], ["AI agents", /\blanggraph\b|\bai agents?\b|\bagentic\b/], ["Vector databases", /\bvector (db|database|search|store)s?\b|\bembeddings?\b/],
  ["Machine learning", /\bmachine learning\b|\bml\b/], ["PyTorch", /\bpytorch\b/], ["TensorFlow", /\btensorflow\b/], ["Scikit-learn", /\bscikit|\bsklearn\b/],
  ["OpenAI API", /\bopenai\b/], ["SAP", /\bsap\b/], ["Git", /\bgit\b/],
];

// Skills listed on the resume PDF but not in the site's tech stack
const RESUME_ONLY = ["Java", "Django", "MySQL", "AWS", "Azure", "TensorFlow", "PyTorch", "OpenAI API", "Microservices", "System design", "Event-driven", "Distributed systems"];

// Extra wording that counts as evidence for a term
const EVIDENCE_ALIASES: Record<string, string[]> = {
  "Vector databases": ["chromadb", "vector search", "embeddings"], LLMs: ["llm", "ollama", "openai"], "AI agents": ["langgraph"],
  "Machine learning": ["xgboost", "lstm", "cnn", "deep learning", "scikit"], "Distributed systems": ["distributed"], "Event-driven": ["rabbitmq", "async workflows"],
  REST: ["rest"], WebSocket: ["websocket", "socket.io"], AWS: ["aws"], SQL: ["sql", "postgresql", "mysql"],
};

function evidenceFor(term: string): string | null {
  // Whole-word matches only, so "go" doesn't hit "MongoDB" and "rag" doesn't hit "coverage"
  const needles = [term, ...(EVIDENCE_ALIASES[term] ?? [])].map(
    (n) => new RegExp(`(^|[^a-z0-9])${n.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`, "i")
  );
  const has = (text: string) => needles.some((re) => re.test(text));
  for (const job of DATA.technicalExperience) if (job.bullets.some(has)) return `experience at ${job.company}`;
  for (const p of DATA.projects) if (p.technologies.some(has) || has(p.description)) return `project: ${p.title}`;
  for (const c of techCategories) {
    const items = c.subcategories ? c.subcategories.flatMap((s) => s.items) : c.items ?? [];
    if (items.some((i) => has(i.name))) return "tech stack";
  }
  if (RESUME_ONLY.includes(term)) return "resume skills";
  return null;
}

export function matchJob(description: string) {
  const text = ` ${description.toLowerCase()} `;
  const wanted = TECH.filter(([, re]) => re.test(text)).map(([term]) => term);
  const matched = wanted.map((term) => ({ term, where: evidenceFor(term) })).filter((m): m is { term: string; where: string } => !!m.where);
  const missing = wanted.filter((term) => !matched.some((m) => m.term === term));
  const score = wanted.length ? Math.round((matched.length / wanted.length) * 100) : 0;
  return { wanted, matched, missing, score };
}
