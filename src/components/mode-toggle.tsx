"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useState } from "react";

// forwardRef so the dock's Tooltip can attach to the button
export const ModeToggle = forwardRef<HTMLButtonElement, ButtonProps>(function ModeToggle(props, ref) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      {...props}
      ref={ref}
      variant="ghost"
      type="button"
      size="icon"
      className="px-2"
      aria-label="Change theme"
      onClick={(e) => {
        props.onClick?.(e);
        cycleTheme();
      }}
    >
      {mounted && theme === "dark" ? (
        <MoonIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:text-neutral-200" />
      ) : mounted && theme === "system" ? (
        <Monitor className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:text-neutral-200" />
      ) : (
        <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:text-neutral-200" />
      )}
    </Button>
  );
});
