"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "pending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: accessKey, ...data }),
      });
      const json = await res.json();

      if (json.success) {
        setStatus("success");
        setMessage("Message sent! I'll get back to you soon.");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setMessage("Something went wrong. Try emailing me directly.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try emailing me directly.");
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/20 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Get in touch.</h2>
        <p className="text-muted-foreground">
          Have a project in mind or just want to say hi?
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium">Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="What's on your mind?"
            className={`${inputClass} resize-none`}
          />
        </div>

        {status !== "idle" && status !== "pending" && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
              status === "success"
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "pending"}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {status === "pending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
