"use client";

import { useEffect, useState } from "react";
import BlurFade from "./magicui/blur-fade";

interface ContributionDay {
  date: string;
  contributionCount: number;
  level: number;
}

interface GitHubContributionsProps {
  username: string;
  delay?: number;
}

// Unified teal color function (matching brand color #8eb1c2)
const getTealColor = (count: number, level?: number): string => {
  const intensity = level ?? (count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4);
  if (intensity <= 0) return "#f3f4f6";
  if (intensity === 1) return "#d4e5eb";
  if (intensity === 2) return "#a7c8d4";
  if (intensity === 3) return "#8eb1c2";
  return "#6a9aad";
};

export const GitHubContributions = ({ username, delay = 0 }: GitHubContributionsProps) => {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchContributions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Public scrape API — no GitHub token required (CORS enabled)
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
        );

        if (!response.ok) {
          throw new Error(`Failed to load contributions (${response.status})`);
        }

        const data = await response.json();
        const days: ContributionDay[] = (data.contributions ?? []).map(
          (day: { date: string; count: number; level: number }) => ({
            date: day.date,
            contributionCount: day.count,
            level: day.level,
          })
        );

        // Keep only the last 100 days (aligned to week start for the grid)
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - 99);

        const recent = days.filter((day) => {
          const d = new Date(day.date + "T00:00:00");
          return d >= cutoff;
        });

        if (!cancelled) {
          setContributions(recent);
        }
      } catch (err) {
        console.error("Error fetching GitHub contributions:", err);
        if (!cancelled) {
          setContributions([]);
          setError(err instanceof Error ? err.message : "Failed to load contributions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContributions();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <BlurFade delay={delay}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </BlurFade>
    );
  }

  const renderContributionGraph = () => {
    if (contributions.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-6">
          {error
            ? `Couldn’t load GitHub activity for @${username}.`
            : `No public contribution data found for @${username}.`}
        </p>
      );
    }

    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
      weeks.push(contributions.slice(i, i + 7));
    }

    return (
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className="w-3 h-3 rounded-sm transition-transform hover:scale-125"
                style={{
                  backgroundColor: getTealColor(day.contributionCount, day.level),
                }}
                title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const tealSwatches = ["#d4e5eb", "#a7c8d4", "#8eb1c2", "#6a9aad"];

  return (
    <BlurFade delay={delay}>
      <div className="space-y-6 w-full py-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">My GitHub Activity.</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Here&apos;s my contribution graph showing my coding activity over the past 100 days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <span className="text-sm text-muted-foreground">Less</span>
          </div>
          <div className="flex items-center gap-1">
            {tealSwatches.map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">More</span>
        </div>

        <div className="w-full overflow-x-auto pb-2">
          <div className="flex justify-center min-w-max px-4">{renderContributionGraph()}</div>
        </div>
      </div>
    </BlurFade>
  );
};
