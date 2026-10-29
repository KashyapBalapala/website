"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ValuesProps {
  delay?: number;
}

export const Values = ({ delay = 0 }: ValuesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-content-md"
    >
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-2xl font-bold text-center">How I Work.</h2>
        <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert leading-relaxed">
          I start by understanding the problem before reaching for a
          solution. Most bad code I&apos;ve written came from building the
          thing I assumed was wanted rather than asking one more question
          first. So I ask the question — even when it makes me look slower
          in the first hour.
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          {isExpanded ? "Hide" : "Read more"}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-content-sm pt-2">
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert leading-relaxed">
                I prefer the smallest change that actually solves the problem.
                Clever abstractions written for a future that never arrives cost
                more than they save, and the person maintaining them is usually
                me, six months later, with no memory of why. Boring code that
                reads clearly beats elegant code that needs a tour guide.
              </p>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert leading-relaxed">
                When something breaks, I want the honest version first — what
                failed, what I missed, what the fix is. Hiding a problem buys a
                few comfortable hours and costs everyone a week. I&apos;d rather
                work with people who tell me I&apos;m wrong early, and I try to be
                that person for them.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
