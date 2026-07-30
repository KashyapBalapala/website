"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-card p-10 md:p-16 flex flex-col items-center text-center space-y-6 w-full max-w-md"
      >
        <p className="text-8xl md:text-9xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Go home
        </Link>
      </motion.div>
    </main>
  );
}
