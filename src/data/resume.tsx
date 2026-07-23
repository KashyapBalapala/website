import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, SparklesIcon } from "lucide-react";

export const DATA = {
  name: "Kashyap Balapala",
  initials: "KB",
  url: "https://your-domain-here.com",
  location: "Hyderabad, India",
  locationLink: "https://www.google.com/maps/place/hyderabad",
  description:
    "Full-stack MEAN developer specializing in SAP integration systems.",
  summary:
    "I'm a full-stack developer who spends most days moving data between SAP systems and the web applications people actually use.\n\nThree years in, the work has centered on SAP integration — pulling work orders and notifications out of SAP and into Node.js services that Angular front-ends can build on top of. That's meant getting comfortable with the unglamorous middle layer of enterprise software: RFC/BAPI calls, data transformation, and making legacy systems talk to modern ones.\n\nRight now the focus is leveling up toward senior engineering roles — structured DSA practice, system design, and a fintech portfolio project (a trade reconciliation platform) built to show the kind of distributed-systems thinking those roles ask for.\n\nOutside of code, I'm slowly translating a Hindi edition of the Bhagavad Gita, with Shankara's commentary, into English — a discipline that turns out to have more in common with careful system design than you'd expect.",
  avatarUrl: "/me.jpeg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/showcase", icon: SparklesIcon, label: "Showcase" },
  ],
  contact: {
    email: "your.email@example.com",
    tel: "+91-76748-40191",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/KashyapBalapala",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/yourusername",
        icon: Icons.linkedin,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:your.email@example.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  technicalExperience: [
    {
      company: "Innovapptive",
      href: "https://innovapptive.com",
      badges: [],
      location: "India",
      title: "Full-Stack MEAN Developer",
      logoUrl: "",
      start: "April 2025",
      end: "Present",
      bullets: [
        "Build Node.js services that pull SAP work orders and notifications into modern web applications.",
        "Own the integration layer connecting SAP backend systems to Angular front-ends.",
      ],
    },
    {
      company: "Brane Enterprises",
      href: "",
      badges: [],
      location: "India",
      title: "Full-Stack Developer",
      logoUrl: "",
      start: "2022",
      end: "April 2025",
      bullets: [
        "Developed and maintained full-stack MEAN applications end to end.",
        "Built the foundation in Node.js, Express, MongoDB, and Angular this career now runs on.",
      ],
    },
  ],
  education: [
    {
      school: "Your University Name",
      href: "",
      degree: "B.Tech in Computer Science (dummy — replace with your real degree)",
      logoUrl: "",
      start: "2018",
      end: "2022",
    },
  ],
  projects: [
    {
      title: "Trade Reconciliation Platform",
      href: "",
      dates: "In progress",
      active: true,
      description:
        "A microservices-based trade reconciliation system, built as a fintech portfolio anchor to demonstrate senior-level distributed systems design.",
      technologies: ["NestJS", "Kafka", "Redis", "MongoDB", "Microservices"],
      links: [],
      image: "",
      video: "",
    },
    {
      title: "MedNote AI",
      href: "",
      dates: "Personal project",
      active: true,
      description:
        "A medical consultation summarizer that turns doctor-patient conversations into structured clinical notes using retrieval-augmented generation.",
      technologies: ["RAG", "GPT-4o", "LangChain", "ChromaDB"],
      links: [],
      image: "",
      video: "",
    },
    {
      title: "Enterprise RAG Knowledge System",
      href: "",
      dates: "Personal project",
      active: true,
      description:
        "A retrieval-augmented knowledge system for enterprise document search and Q&A, built as a portfolio anchor for AI-integration roles.",
      technologies: ["RAG", "LLM", "Vector Search", "Node.js"],
      links: [],
      image: "",
      video: "",
    },
  ],
  books: [
    {
      theme: "Philosophy",
      books: [
        { title: "Dummy Book Title One", author: "Author Name", number: 1 },
        { title: "Dummy Book Title Two", author: "Author Name", number: 2 },
      ],
    },
    {
      theme: "Systems & Thinking",
      books: [
        { title: "Dummy Book Title Three", author: "Author Name", number: 3 },
        { title: "Dummy Book Title Four", author: "Author Name", number: 4 },
      ],
    },
    {
      theme: "Technical",
      books: [
        { title: "Dummy Book Title Five", author: "Author Name", number: 5 },
      ],
    },
  ],
} as const;
