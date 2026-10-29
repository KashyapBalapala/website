"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DATA } from "@/data/resume";
import { techCategories } from "@/components/tech-stack";

export interface Post {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  text: string;
  url: string;
  isExternal: boolean;
}

// Lets any output (help rows, file names, chips) run a command when clicked
export const RunContext = createContext<(cmd: string) => void>(() => {});

export const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const B = ({ children }: { children: ReactNode }) => <span className="kterm-b">{children}</span>;

export function Cmd({ c, children }: { c: string; children?: ReactNode }) {
  const run = useContext(RunContext);
  return (
    <button type="button" className="kterm-link" onClick={() => run(c)}>
      {children ?? c}
    </button>
  );
}

export const KV = ({ rows, className = "" }: { rows: [ReactNode, ReactNode][]; className?: string }) => (
  <dl className={`kterm-kv ${className}`}>
    {rows.map(([k, v], i) => (
      <div key={i} className="contents">
        <dt>{k}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
);

export const LINKS: Record<string, string> = {
  portfolio: "/portfolio",
  blog: "/blog",
  showcase: "/showcase",
  resume: "/resume.pdf",
  github: DATA.contact.social.GitHub.url,
  linkedin: DATA.contact.social.LinkedIn.url,
};

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const currentJob = DATA.technicalExperience[0];
const cert = DATA.education[1];

export const OPEN_TO = "backend & AI engineering roles";

export function Neofetch({ reveal = false }: { reveal?: boolean }) {
  const rows: [string, ReactNode][] = [
    ["Location", DATA.location],
    ["Role", `${currentJob.title} @ ${currentJob.company}`],
    ["Prev", DATA.technicalExperience.slice(1).map((job) => job.company).join(", ")],
    ["Open to", OPEN_TO],
    ["Education", `${DATA.education[0].degree}, ${DATA.education[0].school}`],
    ["Cert", `${cert.degree.replace(/^Certification – /, "")}, ${cert.school}`],
    ["Now", "going deep on applied AI: RAG, agents, LangGraph"],
    ["Stack", "TypeScript, Python, Node.js, Angular, React"],
    // One row of links keeps the banner short enough that the name stays on screen
    [
      "Links",
      <span key="links">
        <A href={LINKS.resume}>resume</A> · <A href={`mailto:${DATA.contact.email}`}>email</A> ·{" "}
        <A href={LINKS.github}>github</A> · <A href={LINKS.linkedin}>linkedin</A>
      </span>,
    ],
  ];
  // Staggered fade-in for the boot sequence, merged with each element's own class
  const r = (i: number, className = "") =>
    reveal ? { className: `${className} kterm-reveal`.trim(), style: { animationDelay: `${i * 45}ms` } } : { className: className || undefined };
  return (
    <div>
      <div className="kterm-hello sans">
        <p {...r(0, "kterm-name")}>{DATA.name}</p>
        <p {...r(1, "kterm-tagline")}>{DATA.description}</p>
      </div>
      <dl className="kterm-kv kterm-info">
        {rows.map(([k, v], i) => (
          <div key={k} className="contents">
            <dt {...r(i + 2)}>{k}</dt>
            <dd {...r(i + 2)}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Output of a command: a rich node, plain lines (used for pipes and as the
// fallback rendering), and the chips to suggest next
export interface Out {
  node?: ReactNode;
  lines?: string[];
  next?: string[];
}

const skillRows = techCategories.flatMap((c) =>
  c.subcategories
    ? c.subcategories.map((s) => [s.name, s.items.map((i) => i.name).join(", ")] as const)
    : [[c.category, (c.items ?? []).map((i) => i.name).join(", ")] as const]
);

export const SECTIONS: Record<string, () => Out> = {
  about: () => ({
    lines: [`${DATA.name} · ${DATA.location}`, ...DATA.summary.split("\n\n")],
    node: (
      <div>
        <div><B>{DATA.name}</B> <span className="kterm-dim">· {DATA.location}</span></div>
        {DATA.summary.split("\n\n").map((p) => <p key={p} className="kterm-sub">{p}</p>)}
      </div>
    ),
  }),
  experience: () => ({
    lines: DATA.technicalExperience.flatMap((job) => [
      `${job.title} @ ${job.company} (${job.start} – ${job.end})`,
      ...job.bullets.map((b) => `  - ${b}`),
    ]),
    node: (
      <div className="space-y-3">
        {DATA.technicalExperience.map((job) => (
          <div key={job.company}>
            <div><B>{job.title}</B> <span className="kterm-dim">@ {job.company} · {job.start} – {job.end}</span></div>
            {job.bullets.map((b) => <div key={b} className="kterm-sub">{b}</div>)}
          </div>
        ))}
      </div>
    ),
  }),
  projects: () => ({
    lines: DATA.projects.flatMap((p) => [`${p.title} (${p.dates})`, `  ${p.description}`, `  ${p.technologies.join(" · ")}`]),
    node: (
      <div className="space-y-3">
        {DATA.projects.map((p) => (
          <div key={p.title}>
            <div>
              <Cmd c={`cat projects/${slugify(p.title)}.md`}><B>{p.title}</B></Cmd>{" "}
              <span className="kterm-dim">· {p.dates}</span>
              {p.href && <> · <A href={p.href}>source</A></>}
            </div>
            <div className="kterm-sub">{p.description}</div>
            <div className="kterm-sub">{p.technologies.join(" · ")}</div>
          </div>
        ))}
      </div>
    ),
  }),
  skills: () => ({
    lines: skillRows.map(([k, v]) => `${k}: ${v}`),
    node: <KV rows={skillRows.map(([k, v]) => [<B key={k}>{k}</B>, v])} />,
  }),
  education: () => ({
    lines: DATA.education.map((e) => `${e.school} — ${e.degree} (${e.start} – ${e.end})`),
    node: (
      <div>
        {DATA.education.map((e) => (
          <div key={e.school}><B>{e.school}</B> <span className="kterm-dim">— {e.degree} · {e.start} – {e.end}</span></div>
        ))}
      </div>
    ),
  }),
  contact: () => ({
    lines: [`email: ${DATA.contact.email}`, `github: ${LINKS.github}`, `linkedin: ${LINKS.linkedin}`, "resume: /resume.pdf"],
    node: (
      <div>
        <KV
          rows={[
            [<B key="e">email</B>, <A key="e" href={`mailto:${DATA.contact.email}`}>{DATA.contact.email}</A>],
            [<B key="g">github</B>, <A key="g" href={LINKS.github}>{LINKS.github.replace("https://", "")}</A>],
            [<B key="l">linkedin</B>, <A key="l" href={LINKS.linkedin}>{LINKS.linkedin.replace("https://www.", "")}</A>],
            [<B key="r">resume</B>, <A key="r" href={LINKS.resume}>resume.pdf</A>],
          ]}
        />
        <div className="kterm-sub mt-2">or type <B>msg</B> &lt;your message&gt; to send me a note from here.</div>
      </div>
    ),
  }),
  hire: () => {
    const lines = [
      `${DATA.name} — ${currentJob.title} @ ${currentJob.company}, ${DATA.location} (IST, UTC+5:30)`,
      "3+ years building distributed systems, SAP/cloud integrations and AI-powered apps.",
      "Shipped: 10K+ daily-transaction ERP pipelines, -35% latency, 95% reliability.",
      `Open to: ${OPEN_TO}.`,
      `Reach me: ${DATA.contact.email}`,
    ];
    return {
      lines,
      node: (
        <div>
          {lines.slice(0, 4).map((l, i) => <div key={l} className={i ? "kterm-sub" : ""}>{i ? l : <B>{l}</B>}</div>)}
          <div className="kterm-sub">
            next: <Cmd c="resume">resume</Cmd> · <Cmd c="copy email">copy email</Cmd> · <Cmd c="msg">msg</Cmd> · <Cmd c="projects">projects</Cmd>
          </div>
        </div>
      ),
    };
  },
};

// ---- Virtual file system ---------------------------------------------------

export type FsNode = { type: "dir"; children: Record<string, FsNode> } | { type: "file"; out: () => Out };

function projectFile(p: (typeof DATA.projects)[number]): FsNode {
  return {
    type: "file",
    out: () => ({
      lines: [`# ${p.title}`, `${p.dates}`, p.description, `stack: ${p.technologies.join(", ")}`, `source: ${p.href}`],
      node: (
        <div>
          <B># {p.title}</B> <span className="kterm-dim">· {p.dates}</span>
          <div className="kterm-sub">{p.description}</div>
          <div className="kterm-sub">stack: {p.technologies.join(", ")}</div>
          {p.href && <div className="kterm-sub">source: <A href={p.href}>{p.href.replace("https://", "")}</A></div>}
        </div>
      ),
      next: ["cd ~/projects", "github", "contact"],
    }),
  };
}

function postFile(post: Post): FsNode {
  return {
    type: "file",
    out: () => ({
      lines: [`# ${post.title}`, post.publishedAt, ...post.text.split("\n")],
      node: (
        <div>
          <B># {post.title}</B> <span className="kterm-dim">· {post.publishedAt}</span>
          {post.text.split("\n").filter(Boolean).map((l, i) => <p key={i} className="kterm-sub">{l}</p>)}
          <div className="kterm-sub">read it with formatting: <A href={post.url}>{post.url}</A></div>
        </div>
      ),
    }),
  };
}

const sectionFile = (name: string): FsNode => ({ type: "file", out: SECTIONS[name] });

export function buildFs(posts: Post[]): FsNode {
  return {
    type: "dir",
    children: {
      "about.txt": sectionFile("about"),
      "experience.txt": sectionFile("experience"),
      "education.txt": sectionFile("education"),
      "skills.txt": sectionFile("skills"),
      "contact.txt": sectionFile("contact"),
      "hire.txt": sectionFile("hire"),
      ".secrets": {
        type: "file",
        out: () => ({ lines: ["psst. you're on the right track.", "type 'secrets' to see what you've found, or 'hint' if you're stuck."], next: ["secrets", "hint"] }),
      },
      ".bash_history": {
        type: "file",
        out: () => ({
          lines: [
            'git commit -m "fix"',
            'git commit -m "fix for real"',
            'git commit -m "ok this time for real"',
            "git push --force",
            "# oops",
            "rm -rf node_modules && npm install",
            "sudo make me a sandwich",
            "vim portfolio.tsx",
            ":q",
            ":q!",
            "# how do I exit vim",
            "coffee",
          ],
        }),
      },
      "resume.pdf": {
        type: "file",
        out: () => ({ lines: ["resume.pdf: binary file. try 'open resume'."], next: ["open resume"] }),
      },
      projects: { type: "dir", children: Object.fromEntries(DATA.projects.map((p) => [`${slugify(p.title)}.md`, projectFile(p)])) },
      blog: { type: "dir", children: Object.fromEntries(posts.map((p) => [`${p.slug}.md`, postFile(p)])) },
    },
  };
}

// Paths are lists of segments under ~ (the home directory is the fs root)
export function resolvePath(cwd: string[], input: string): string[] | null {
  const absolute = input.startsWith("~") || input.startsWith("/");
  const parts = input.replace(/^~\/?|^\/home\/guest\/?|^\//, "").split("/").filter(Boolean);
  const out = absolute ? [] : [...cwd];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (!out.length) return null;
      out.pop();
    } else out.push(part);
  }
  return out;
}

export function getNode(root: FsNode, path: string[]): FsNode | null {
  let node: FsNode = root;
  for (const part of path) {
    if (node.type !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

export const displayPath = (path: string[]) => (path.length ? `~/${path.join("/")}` : "~");

export function treeLines(node: FsNode, prefix = ""): string[] {
  if (node.type !== "dir") return [];
  const names = Object.keys(node.children).filter((n) => !n.startsWith("."));
  return names.flatMap((name, i) => {
    const last = i === names.length - 1;
    const child = node.children[name];
    const label = child.type === "dir" ? `${name}/` : name;
    return [`${prefix}${last ? "└── " : "├── "}${label}`, ...treeLines(child, `${prefix}${last ? "    " : "│   "}`)];
  });
}

// ---- Help, manual, suggestions --------------------------------------------

export const HELP: [string, string][] = [
  ["about", "who I am"],
  ["experience", "where I've worked"],
  ["projects", "things I've built"],
  ["skills", "my tech stack"],
  ["education", "degrees and certifications"],
  ["hire", "the 30-second pitch"],
  ["match <job description>", "paste a job description, see how well I fit"],
  ["contact", "how to reach me"],
  ["msg <text>", "send a note straight to my inbox"],
  ["copy email", "copy my email to your clipboard"],
  ["tour", "a 30-second guided tour"],
  ["quiz", "how well do you know me? 5 questions"],
  ["typing", "how fast can you type code?"],
  ["banner <text>", "your text in giant letters"],
  ["github", "my latest repos, live"],
  ["blog", "things I've written"],
  ["time", "what time it is for me"],
  ["ls · cd · cat · tree", "walk the file system"],
  ["open <name>", "open portfolio, blog, resume, github, linkedin"],
  ["share", "copy a link that replays your last command"],
  ["name · path · whoami", "tell me who you are"],
  ["feedback · guestbook", "rate the site, or leave a note"],
  ["theme [name]", "flip the lights, or pick: dark light dracula solarized matrix"],
  ["man <cmd>", "the manual for a command"],
  ["history", "commands you've run (ctrl+r searches)"],
  ["portfolio", "go to the full visual portfolio"],
  ["clear", "wipe the screen"],
];

export const MAN: Record<string, { usage: string; desc: string; examples?: string[] }> = {
  about: { usage: "about", desc: "A short introduction. Aliases: who, whoami." },
  experience: { usage: "experience", desc: "Roles, companies and what I shipped there. Alias: work." },
  projects: { usage: "projects", desc: "Everything I've built, with links to the source. Click a title for details.", examples: ["projects | grep python"] },
  skills: { usage: "skills", desc: "My tech stack by category. Alias: stack.", examples: ["skills | grep -i ai"] },
  education: { usage: "education", desc: "Degrees and certifications. Alias: edu." },
  hire: { usage: "hire", desc: "Everything a recruiter needs in one screen." },
  contact: { usage: "contact", desc: "Email, GitHub, LinkedIn and resume." },
  msg: { usage: "msg <text>", desc: "Sends your note to my inbox. You'll be asked for an email so I can reply. Ctrl+C discards the draft.", examples: ["msg loved the RAG project, let's talk"] },
  copy: { usage: "copy email", desc: "Copies my email address to your clipboard." },
  github: { usage: "github", desc: "My most recently updated repos, fetched live from GitHub. Alias: stars." },
  blog: { usage: "blog", desc: "Lists my posts. Read one with cat.", examples: ["cat blog/<post>.md"] },
  time: { usage: "time", desc: "The current time in Hyderabad, so you know when to expect a reply." },
  ls: { usage: "ls [dir]", desc: "Lists a directory. Click a name to open it.", examples: ["ls projects"] },
  cd: { usage: "cd <dir>", desc: "Changes directory. ~ is home, .. goes up.", examples: ["cd projects", "cd .."] },
  cat: { usage: "cat <file>", desc: "Prints a file.", examples: ["cat about.txt", "cat projects/risklens.md"] },
  tree: { usage: "tree [dir]", desc: "Shows the whole file system as a tree." },
  open: { usage: "open <name>", desc: "Opens portfolio, blog, showcase, resume, github or linkedin." },
  share: { usage: "share", desc: "Copies a link that opens this terminal and replays your last command." },
  theme: { usage: "theme [name]", desc: "Without a name, toggles dark/light. Names: dark, light, dracula, solarized, matrix." },
  man: { usage: "man <command>", desc: "You're reading it." },
  history: { usage: "history", desc: "Commands you've run, kept between visits. Ctrl+R searches them." },
  grep: { usage: "<cmd> | grep [-v] <text>", desc: "Keeps lines containing text (case-insensitive). -v keeps the others.", examples: ["experience | grep latency"] },
  head: { usage: "<cmd> | head [-n N]", desc: "Keeps the first N lines (default 10)." },
  tail: { usage: "<cmd> | tail [-n N]", desc: "Keeps the last N lines (default 10)." },
  wc: { usage: "<cmd> | wc -l", desc: "Counts lines." },
  match: { usage: "match <job description>", desc: "Scores how well I fit a role: matched skills with where they show up in my work, and honest gaps.", examples: ["match Senior backend engineer: Node.js, TypeScript, Kafka, AWS"] },
  tour: { usage: "tour", desc: "Types and runs a few commands for you. Any key or click takes over." },
  quiz: { usage: "quiz", desc: "Five multiple-choice questions about me. Answer a, b or c; q quits." },
  typing: { usage: "typing", desc: "Type a line of code as fast as you can. Shows words per minute and accuracy, and keeps your best." },
  banner: { usage: "banner <text>", desc: "Prints up to 12 characters in giant block letters.", examples: ["banner hello"] },
  name: { usage: "name [you]", desc: "Sets the name used in your prompt and greetings. Kept for your next visit." },
  path: { usage: "path hiring|engineer|browsing", desc: "Tailors suggestions to why you're here." },
  whoami: { usage: "whoami", desc: "Who the terminal thinks you are." },
  feedback: { usage: "feedback <1-5> [comment]", desc: "Rates this site. It goes straight to my inbox.", examples: ["feedback 5 loved the secrets hunt"] },
  guestbook: { usage: "guestbook <message>", desc: "Leaves me a note. Entries are emailed to me." },
  secrets: { usage: "secrets [share|reset]", desc: "How many hidden commands you've found, with a hint for each. share copies your score, reset starts the hunt over." },
  hint: { usage: "hint", desc: "Reveals one more letter of a secret you haven't found yet." },
  portfolio: { usage: "portfolio", desc: "Leaves the terminal for the full visual portfolio." },
  clear: { usage: "clear", desc: "Wipes the screen. Ctrl+L does the same." },
};

// Chips offered after each command, so visitors can keep clicking
export const NEXT: Record<string, string[]> = {
  help: ["about", "projects", "hire"],
  about: ["experience", "projects", "hire"],
  experience: ["projects", "skills", "resume"],
  projects: ["cd projects", "github", "contact"],
  skills: ["projects", "github"],
  education: ["experience", "projects"],
  contact: ["copy email", "msg", "hire"],
  hire: ["resume", "copy email", "contact"],
  blog: ["cd blog", "projects"],
  github: ["projects", "contact"],
  neofetch: ["help", "about", "projects"],
  secrets: ["hint", "secrets share"],
  whoami: ["name", "path"],
};

// Hidden commands: finding them is the game. `replay` is what clicking a found one runs
export interface Secret {
  id: string;
  hint: string;
  replay: string;
}

export const SECRETS: Secret[] = [
  { id: "sudo", hint: "every admin's favourite magic word", replay: "sudo make me a sandwich" },
  { id: "exit", hint: "how you'd leave any other shell", replay: "exit" },
  { id: "vim", hint: "the editor nobody knows how to quit", replay: "vim" },
  { id: "rm", hint: "the most dangerous command ever typed (try it with -rf /)", replay: "rm -rf /" },
  { id: "coffee", hint: "what this terminal actually runs on", replay: "coffee" },
  { id: "hack", hint: "what movies think programmers do all day", replay: "hack" },
  { id: "matrix", hint: "take the red pill", replay: "matrix" },
  { id: "cowsay", hint: "a farm animal with opinions (give it something to say)", replay: "cowsay hello" },
  { id: "fortune", hint: "words of wisdom from computing legends", replay: "fortune" },
  { id: "snake", hint: "a classic Nokia game", replay: "snake" },
  { id: "2048", hint: "slide the tiles, double the numbers", replay: "2048" },
  { id: "↑↑↓↓←→←→BA", hint: "a famous cheat code. you press it, you don't type it", replay: "konami" },
  { id: "ls -a", hint: "show me everything, even the hidden stuff", replay: "ls -a" },
  { id: ".bash_history", hint: "a hidden file that remembers what I typed", replay: "cat .bash_history" },
  { id: "git blame", hint: "find out who wrote this line", replay: "git blame" },
  { id: "npm install", hint: "download half the internet", replay: "npm install" },
  { id: "ping", hint: "check whether I'm alive", replay: "ping kashyap" },
  { id: "hello", hint: "just say it", replay: "hello" },
  { id: "make coffee", hint: "like coffee, but built from source", replay: "make coffee" },
];

export const FORTUNES: [string, string][] = [
  ["Premature optimization is the root of all evil.", "Donald Knuth"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["There are only two hard things in Computer Science: cache invalidation and naming things.", "Phil Karlton"],
  ["Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["Simplicity is prerequisite for reliability.", "Edsger W. Dijkstra"],
  ["The best way to predict the future is to invent it.", "Alan Kay"],
  ["Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", "Martin Fowler"],
  ["Debugging is twice as hard as writing the code in the first place.", "Brian Kernighan"],
  ["Weeks of coding can save you hours of planning.", "Unknown"],
];

// gold is the reward for finding every secret
export const THEMES = ["dark", "light", "dracula", "solarized", "matrix", "gold"] as const;
export type ThemeName = (typeof THEMES)[number];

// Plain-English questions mapped to the command that answers them
export const INTENTS: [RegExp, string][] = [
  [/\b(hire|hiring|available|availability|open to|looking for|job|role)\b/, "hire"],
  [/\b(stack|tech|skills?|languages?|frameworks?|tools?)\b/, "skills"],
  [/\b(contact|email|reach|touch|mail|call)\b/, "contact"],
  [/\b(experience|work(ed)?|career|compan(y|ies)|employ)/, "experience"],
  [/\b(projects?|built|build|made|side)\b/, "projects"],
  [/\b(education|degree|college|universit|stud(y|ied)|cert)/, "education"],
  [/\b(resume|cv)\b/, "resume"],
  [/\b(blog|write|writing|posts?|articles?)\b/, "blog"],
  [/\b(github|repos?|code|open source)\b/, "github"],
  [/\b(time|timezone|clock|awake)\b/, "time"],
  [/\b(who|about|yourself|you)\b/, "about"],
];

export function levenshtein(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
