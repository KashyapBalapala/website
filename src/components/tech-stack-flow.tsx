"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { RAG_LOGO } from "@/components/tech-stack";

interface FlowTech {
  name: string;
  logo: string;
}

interface FlowLayer {
  label: string;
  color: string;
  items: FlowTech[];
}

const FLOW_LAYERS: FlowLayer[] = [
  {
    label: "Frontend",
    color: "from-blue-500/20 to-cyan-500/20",
    items: [
      { name: "Angular", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
      { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "HTML5", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS3", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    ],
  },
  {
    label: "Backend",
    color: "from-green-500/20 to-emerald-500/20",
    items: [
      { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain.svg" },
      { name: "NestJS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
      { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
      { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "FastAPI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
    ],
  },
  {
    label: "Database & Messaging",
    color: "from-amber-500/20 to-orange-500/20",
    items: [
      { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
      { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
      { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
      { name: "RabbitMQ", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg" },
      { name: "SQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg" },
    ],
  },
  {
    label: "Integration & AI",
    color: "from-purple-500/20 to-pink-500/20",
    items: [
      { name: "SAP", logo: "https://cdn.simpleicons.org/sap" },
      { name: "LangChain", logo: "https://cdn.simpleicons.org/langchain" },
      { name: "LangGraph", logo: "https://cdn.simpleicons.org/langgraph" },
      { name: "RAG", logo: RAG_LOGO },
      { name: "PyTorch", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
      { name: "Scikit-learn", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
      { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    ],
  },
];

function FlowArrow({ index }: { index: number }) {
  return (
    <motion.div
      className="flex justify-center py-2"
      initial={{ opacity: 0, scaleY: 0 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-6 bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/20" />
        <svg width="12" height="8" viewBox="0 0 12 8" className="text-muted-foreground/40">
          <path d="M6 8L0 0h12z" fill="currentColor" />
        </svg>
      </div>
    </motion.div>
  );
}

export function TechStackFlow() {
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
        <h2 className="text-2xl font-bold">How It All Connects.</h2>
        <p className="text-muted-foreground md:text-lg/relaxed max-w-md mx-auto">
          From the browser to the SAP layer — a top-down view.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {FLOW_LAYERS.map((layer, layerIndex) => (
          <div key={layer.label}>
            {layerIndex > 0 && <FlowArrow index={layerIndex} />}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: layerIndex * 0.15, duration: 0.5 }}
              className={`glass-card bg-gradient-to-r ${layer.color} p-4 sm:p-5`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {layer.label}
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                {layer.items.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: layerIndex * 0.15 + techIndex * 0.05,
                      duration: 0.3,
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-200 group-hover:scale-110">
                      <Image
                        src={tech.logo}
                        alt={tech.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {tech.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
