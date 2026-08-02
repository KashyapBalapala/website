import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, SparklesIcon } from "lucide-react";

export const DATA = {
  name: "Kashyap Balapala",
  initials: "KB",
  url: "https://your-domain-here.com",
  location: "Hyderabad, India",
  locationLink: "https://www.google.com/maps/place/hyderabad",
  description:
    "Software engineer building distributed systems, cloud integrations, and AI-powered applications.",
  summary:
    "Software engineer with 3+ years of experience designing distributed systems, cloud integrations, and AI-powered applications.\n\nI've built SAP ERP pipelines processing 10K+ daily transactions, reduced system latency by 35%, and maintained 95% service reliability at scale — mostly through retry orchestration, validation pipelines, and observability across microservices.\n\nCurrently deepening expertise in applied AI and ML systems, with hands-on projects in RAG, forecasting, and generative AI.",
  avatarUrl: "/me.jpeg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
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
      title: "RAG Knowledge Assistant",
      href: "",
      dates: "Personal project",
      active: true,
      description:
        "A retrieval-augmented generation system using embeddings and semantic search for enterprise knowledge retrieval, with chunking and retrieval pipelines tuned for answer relevance.",
      technologies: ["Python", "Vector Search", "LLMs", "RAG"],
      links: [],
      image: "",
      video: "",
    },
    {
      title: "Demand Forecasting Platform",
      href: "",
      dates: "Personal project",
      active: true,
      description:
        "An end-to-end ML forecasting platform for multi-location demand prediction, benchmarking Regression, Random Forest, and XGBoost for optimal accuracy.",
      technologies: ["Python", "XGBoost", "Scikit-learn", "ML"],
      links: [],
      image: "",
      video: "",
    },
    {
      title: "Generative Design Copilot",
      href: "",
      dates: "Personal project",
      active: true,
      description:
        "A prompt-driven generative assistant with low-latency inference workflows and an intuitive UI built on the OpenAI API.",
      technologies: ["OpenAI API", "Gradio", "Python"],
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
