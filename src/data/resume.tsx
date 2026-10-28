import { Icons } from "@/components/icons";
import { HomeIcon, LayoutGridIcon, NotebookIcon, SparklesIcon } from "lucide-react";

export const DATA = {
  name: "Kashyap Balapala",
  initials: "KB",
  url: "https://kashyap-balapala.vercel.app",
  location: "Hyderabad, India",
  locationLink: "https://www.google.com/maps/place/hyderabad",
  description:
    "Software engineer building distributed systems, cloud integrations, and AI-powered applications.",
  summary:
    "Software engineer with 3+ years of experience designing distributed systems, cloud integrations, and AI-powered applications.\n\nI've built SAP ERP pipelines processing 10K+ daily transactions, reduced system latency by 35%, and maintained 95% service reliability at scale — mostly through retry orchestration, validation pipelines, and observability across microservices.\n\nCurrently deepening expertise in applied AI and ML systems, with hands-on projects in RAG, forecasting, and generative AI.",
  avatarUrl: "/me.jpeg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/portfolio", icon: LayoutGridIcon, label: "Portfolio" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/showcase", icon: SparklesIcon, label: "Showcase" },
  ],
  contact: {
    email: "kbalapala@gmail.com",
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
        url: "https://www.linkedin.com/in/kashyap-balapala-234500225/",
        icon: Icons.linkedin,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:kbalapala@gmail.com",
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
      title: "Software Engineer",
      logoUrl: "/logos/innovapptive.png",
      start: "Apr 2025",
      end: "Present",
      bullets: [
        "Designed distributed SAP ERP integrations processing 10K+ daily transactions across inbound, outbound, and delta-sync workflows.",
        "Reduced document-processing latency by 35% by architecting scalable cloud ingestion pipelines across AWS S3 and Azure Blob.",
        "Improved system reliability to 95% through retry orchestration, validation pipelines, and automated recovery safeguards.",
        "Cut debugging time by 40% by building structured observability and logging across microservices.",
        "Designed RabbitMQ-based async workflows handling 4K messages/day, reducing inter-service coupling.",
        "Reduced production environment refresh failures in SAP integration services by introducing structured migration scripts and refresh runbooks.",
      ],
    },
    {
      company: "Brane Enterprises",
      href: "https://braneenterprises.com",
      badges: [],
      location: "India",
      title: "Software Engineer",
      logoUrl: "/logos/brane.png",
      start: "Jul 2023",
      end: "Apr 2025",
      bullets: [
        "Owned design and development of a Jira-style workflow platform supporting automation, collaboration, and operational visibility.",
        "Built personalisation engine increasing user engagement by 20%.",
        "Implemented WebSocket collaboration layer enabling real-time multi-user synchronisation.",
        "Reduced API latency by 20% through MongoDB query tuning and schema optimisation.",
        "Maintained 90%+ automated test coverage, improving release stability and deployment confidence.",
      ],
    },
    {
      company: "DRDO",
      href: "https://www.drdo.gov.in",
      badges: [],
      location: "India",
      title: "AI Research Intern",
      logoUrl: "/logos/drdo.png",
      start: "Jan 2023",
      end: "May 2023",
      bullets: [
        "Improved deep learning models (ResNet, VGG) for defense-grade image classification and object detection tasks.",
        "Reduced model training runtime by 25% through optimisation of experimentation pipelines.",
      ],
    },
  ],
  education: [
    {
      school: "CVR College of Engineering",
      href: "https://cvr.ac.in",
      degree: "B.Tech in Computer Science",
      logoUrl: "/logos/cvr.png",
      start: "2019",
      end: "2023",
    },
    {
      school: "IIT Kanpur",
      href: "https://www.iitk.ac.in",
      degree: "Certification – Generative AI & Machine Learning",
      logoUrl: "/logos/iitk.png",
      start: "2024",
      end: "2025",
    },
  ],
  projects: [
    {
      title: "Medical RAG Assistant",
      href: "https://github.com/KashyapBalapala/medical-rag",
      dates: "2026",
      active: true,
      description:
        "Question answering over uploaded clinical-guideline PDFs. Chunks documents with LangChain, embeds them locally into ChromaDB, and answers through a local Ollama LLM with cited sources, confidence scores, and an evidence viewer.",
      technologies: ["Next.js", "TypeScript", "LangChain", "ChromaDB", "Ollama", "RAG"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/medical-rag", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
    {
      title: "RiskLens",
      href: "https://github.com/KashyapBalapala/financial-risk-platform",
      dates: "2026",
      active: true,
      description:
        "A financial risk platform that ingests transactions, evaluates configured risk rules, and surfaces generated alerts to authenticated investigators.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Docker"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/financial-risk-platform", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
    {
      title: "Stock Price Predictor",
      href: "https://github.com/KashyapBalapala/Stock-App",
      dates: "2025",
      active: true,
      description:
        "A Django REST backend that pulls market data with yfinance and forecasts prices with an LSTM model, paired with a React dashboard charting top stocks.",
      technologies: ["Python", "Django", "TensorFlow", "React", "Chart.js"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/Stock-App", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
    {
      title: "Location & Work Package Quantities Manager",
      href: "https://github.com/KashyapBalapala/Location-and-Work-Package-Quantities-Management-System",
      dates: "2025",
      active: true,
      description:
        "A MEAN stack app for managing locations, location types, work packages, units of measure, and quantities, with an Angular frontend and an Express/MongoDB API.",
      technologies: ["Angular", "Node.js", "Express", "MongoDB"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/Location-and-Work-Package-Quantities-Management-System", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
    {
      title: "Buddy Mart",
      href: "https://github.com/KashyapBalapala/Buddy_Mart_v1",
      dates: "2024",
      active: true,
      description:
        "A social marketplace with products, posts, friend requests, groups, and real-time chat over Socket.IO, with Google OAuth sign-in and a Dockerized Express/MongoDB backend.",
      technologies: ["Node.js", "Express", "MongoDB", "Socket.IO", "Docker"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/Buddy_Mart_v1", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
    {
      title: "Brain Tumor Analysis",
      href: "https://github.com/KashyapBalapala/Brain_Tumor_Analysis",
      dates: "2024",
      active: true,
      description:
        "MRI brain tumor detection notebooks: preprocessing with cropping, NLM denoising, and CLAHE enhancement, then classification with a custom CNN, VGG19, and ResNet50.",
      technologies: ["Python", "Deep Learning", "OpenCV", "Jupyter"],
      links: [
        { type: "Source", href: "https://github.com/KashyapBalapala/Brain_Tumor_Analysis", icon: <Icons.github className="size-3" /> },
      ],
      image: "",
      video: "",
    },
  ],
  books: [
    {
      theme: "Technical",
      books: [
        { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", number: 1 },
        { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", number: 2 },
        { title: "Database Internals", author: "Alex Petrov", number: 3 },
      ],
    },
    {
      theme: "Systems & Thinking",
      books: [
        { title: "Thinking in Systems", author: "Donella Meadows", number: 4 },
        { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", number: 5 },
        { title: "The Design of Everyday Things", author: "Don Norman", number: 6 },
      ],
    },
    {
      theme: "Philosophy",
      books: [
        { title: "Meditations", author: "Marcus Aurelius", number: 7 },
        { title: "Letters from a Stoic", author: "Seneca", number: 8 },
        { title: "Man's Search for Meaning", author: "Viktor E. Frankl", number: 9 },
      ],
    },
  ],
} as const;
