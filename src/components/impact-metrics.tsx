"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Metric {
  label: string;
  before: string;
  after: string;
  improvement: string;
  icon: string;
}

const METRICS: Metric[] = [
  {
    label: "Document Processing Latency",
    before: "Baseline",
    after: "35% faster",
    improvement: "-35%",
    icon: "⚡",
  },
  {
    label: "System Reliability",
    before: "< 90%",
    after: "95%+",
    improvement: "+95%",
    icon: "🛡️",
  },
  {
    label: "Debugging Time",
    before: "Baseline",
    after: "40% reduction",
    improvement: "-40%",
    icon: "🔍",
  },
  {
    label: "Daily Transactions",
    before: "—",
    after: "10K+",
    improvement: "10K+",
    icon: "📊",
  },
  {
    label: "Async Messages/Day",
    before: "—",
    after: "4K",
    improvement: "4K",
    icon: "📨",
  },
  {
    label: "User Engagement",
    before: "Baseline",
    after: "+20%",
    improvement: "+20%",
    icon: "📈",
  },
];

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export function ImpactMetrics() {
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
        <h2 className="text-2xl font-bold">Impact.</h2>
        <p className="text-muted-foreground md:text-lg/relaxed max-w-md mx-auto">
          Measurable outcomes from production systems.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METRICS.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card p-4 text-center space-y-2 group hover:scale-[1.02] transition-transform"
          >
            <div className="text-2xl">{metric.icon}</div>
            <div className="text-2xl font-bold text-primary">
              {metric.improvement}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {metric.label}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60">
              <span>{metric.before}</span>
              <span>→</span>
              <span className="text-primary/80">{metric.after}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
