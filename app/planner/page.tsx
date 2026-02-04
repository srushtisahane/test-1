"use client";

import { useMemo, useState } from "react";
import type { Idea } from "../../lib/types";

// Simple in-memory mock; in a real app this would come from a backend or local storage.
const mockIdeas: Idea[] = [];

type PlannerSlot = {
  date: string;
  ideas: Idea[];
};

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(startOfTodayISO());
  const [slots, setSlots] = useState<Record<string, PlannerSlot>>({});

  const sortedDates = useMemo(
    () => Object.keys(slots).sort((a, b) => a.localeCompare(b)),
    [slots],
  );

  function addIdeaToDate(date: string, idea: Idea) {
    setSlots((prev) => {
      const existing = prev[date] ?? { date, ideas: [] };
      if (existing.ideas.find((i) => i.id === idea.id)) return prev;
      return {
        ...prev,
        [date]: { ...existing, ideas: [...existing.ideas, idea] },
      };
    });
  }

  function removeIdeaFromDate(date: string, ideaId: string) {
    setSlots((prev) => {
      const existing = prev[date];
      if (!existing) return prev;
      const nextIdeas = existing.ideas.filter((i) => i.id !== ideaId);
      if (!nextIdeas.length) {
        const { [date]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: { ...existing, ideas: nextIdeas } };
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Planner
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400 md:text-base">
              Light-weight planning surface to map your content ideas onto
              dates. This v1 uses mock data and in-memory state.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
                Calendar
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span>Date</span>
                <input
                  type="date"
                  className="h-8 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="mt-2 space-y-2">
                {sortedDates.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                    No content has been assigned yet. In a full version, saved
                    ideas from the dashboard would appear here so you can drag
                    and drop them onto dates.
                  </p>
                ) : (
                  sortedDates.map((date) => (
                    <div
                      key={date}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-xs"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="font-medium text-zinc-100">{date}</p>
                        <span className="text-[11px] text-zinc-500">
                          {slots[date]?.ideas.length || 0} items
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {slots[date]?.ideas.map((idea) => (
                          <li
                            key={idea.id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
                          >
                            <div>
                              <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                {idea.platform.toUpperCase()}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-50">
                                {idea.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeIdeaFromDate(date, idea.id)}
                              className="mt-1 text-[11px] text-zinc-500 hover:text-zinc-200"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
                Ideas pool (mock)
              </h2>
              <span className="text-xs text-zinc-500">
                {mockIdeas.length} available
              </span>
            </div>

            <p className="mb-3 text-xs text-zinc-500">
              This is a placeholder. Once persistence is added, saved ideas from
              the dashboard will appear here so you can schedule them onto your
              calendar.
            </p>

            {mockIdeas.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                Generate and save ideas on the main dashboard first. Then we can
                connect them here so you can assign them to dates.
              </p>
            ) : (
              <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1 text-sm">
                {mockIdeas.map((idea) => (
                  <li
                    key={idea.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                          {idea.platform.toUpperCase()}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-zinc-50">
                          {idea.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addIdeaToDate(selectedDate, idea)}
                        className="rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-950 transition hover:bg-white"
                      >
                        Add to {selectedDate}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

