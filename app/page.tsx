"use client";

import { useState } from "react";
import type { Idea, Outline, Platform } from "../lib/types";

type FormState = {
  topic: string;
  audience: string;
  platform: Platform | "";
  contentType: string;
  tone: string;
  creativity: number;
  count: number;
};

const defaultForm: FormState = {
  topic: "",
  audience: "",
  platform: "",
  contentType: "",
  tone: "friendly",
  creativity: 0.7,
  count: 10,
};

export default function Home() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) ?? null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: form.topic,
          audience: form.audience,
          platform: form.platform || "generic",
          contentType: form.contentType,
          tone: form.tone,
          creativity: form.creativity,
          count: form.count,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate ideas");
      }

      const data = (await res.json()) as { ideas: Idea[] };
      setIdeas(data.ideas);
      setSelectedId(data.ideas[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating ideas.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  async function handleGenerateOutline() {
    if (!selectedIdea) return;

    setOutlineLoading(true);
    setOutlineError(null);

    try {
      const res = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: selectedIdea.id,
          ideaTitle: selectedIdea.title,
          ideaDescription: selectedIdea.description,
          platform: selectedIdea.platform,
          audience: form.audience,
          tone: form.tone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate outline");
      }

      const data = (await res.json()) as { outline: Outline };
      setOutline(data.outline);
    } catch (err) {
      setOutlineError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating outline.",
      );
    } finally {
      setOutlineLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              AI Content Ideas Studio
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400 md:text-base">
              Describe your niche and platforms, and let AI generate structured,
              ready-to-use content ideas you can refine and plan.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
            Powered by your LLM API key
          </span>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm md:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
                Brief
              </h2>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-200">
                  Topic or niche
                </label>
                <input
                  className="h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none ring-0 ring-offset-0 transition focus:border-zinc-400"
                  placeholder="e.g. Personal finance tips for beginners"
                  value={form.topic}
                  onChange={(e) => handleFormChange("topic", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-200">
                  Audience
                </label>
                <input
                  className="h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none ring-0 ring-offset-0 transition focus:border-zinc-400"
                  placeholder="e.g. Working professionals in their 20s"
                  value={form.audience}
                  onChange={(e) => handleFormChange("audience", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-200">
                    Platform
                  </label>
                  <select
                    className="h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none ring-0 ring-offset-0 transition focus:border-zinc-400"
                    value={form.platform}
                    onChange={(e) =>
                      handleFormChange("platform", e.target.value as Platform)
                    }
                  >
                    <option value="">Multi-platform / generic</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="blog">Blog / SEO</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter / X</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-200">
                    Content type
                  </label>
                  <input
                    className="h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none ring-0 ring-offset-0 transition focus:border-zinc-400"
                    placeholder="e.g. Shorts, carousels, long-form video"
                    value={form.contentType}
                    onChange={(e) =>
                      handleFormChange("contentType", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr,1fr]">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-200">
                    Tone
                  </label>
                  <input
                    className="h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none ring-0 ring-offset-0 transition focus:border-zinc-400"
                    placeholder="e.g. Friendly, expert, playful, bold"
                    value={form.tone}
                    onChange={(e) => handleFormChange("tone", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="flex items-center justify-between text-xs font-medium text-zinc-200">
                    Creativity
                    <span className="text-[11px] text-zinc-400">
                      {form.creativity.toFixed(2)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={form.creativity}
                    onChange={(e) =>
                      handleFormChange("creativity", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Ideas to generate</span>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    className="h-7 w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-50 outline-none focus:border-zinc-400"
                    value={form.count}
                    onChange={(e) =>
                      handleFormChange("count", Number(e.target.value) || 1)
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !form.topic}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-50 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-100"
                >
                  {loading ? "Generating..." : "Generate ideas"}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400">
                  {error} – check your API route or API key.
                </p>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Ideas
                </h2>
                <span className="text-xs text-zinc-500">
                  {ideas.length ? `${ideas.length} generated` : "No ideas yet"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {ideas.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                    Run your first generation to see a stack of AI-generated
                    content ideas here. You can then select one to view details
                    and copy it.
                  </p>
                ) : (
                  <ul className="flex max-h-[360px] flex-col gap-1 overflow-y-auto pr-1 text-sm">
                    {ideas.map((idea) => (
                      <li
                        key={idea.id}
                        className={`cursor-pointer rounded-lg border px-3 py-2 transition ${
                          selectedId === idea.id
                            ? "border-zinc-200 bg-zinc-50 text-zinc-900"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-50 hover:border-zinc-500"
                        }`}
                        onClick={() => setSelectedId(idea.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.16em]">
                            {idea.platform.toUpperCase()}
                          </span>
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                            {idea.status}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm font-medium">
                          {idea.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                          {idea.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Details & outline
                </h2>
                {selectedIdea && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${selectedIdea.title}\n\n${selectedIdea.description}`,
                        )
                      }
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Copy idea
                    </button>
                    <button
                      type="button"
                      disabled={outlineLoading}
                      onClick={handleGenerateOutline}
                      className="rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-100"
                    >
                      {outlineLoading ? "Generating…" : "Generate outline"}
                    </button>
                  </div>
                )}
              </div>

              {selectedIdea ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Title
                    </p>
                    <p className="mt-1 font-medium text-zinc-50">
                      {selectedIdea.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Description
                    </p>
                    <p className="mt-1 text-zinc-200">
                      {selectedIdea.description}
                    </p>
                  </div>
                  {selectedIdea.tags?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        Tags
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {selectedIdea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-px w-full bg-zinc-800" />

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        Outline
                      </p>
                      {outline && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              outline.sections
                                .map(
                                  (s) =>
                                    `${s.heading}\n- ${s.bullets.join("\n- ")}`,
                                )
                                .join("\n\n"),
                            )
                          }
                          className="text-[11px] text-zinc-400 hover:text-zinc-200"
                        >
                          Copy outline
                        </button>
                      )}
                    </div>

                    {outlineError && (
                      <p className="mb-2 text-xs text-red-400">
                        {outlineError}
                      </p>
                    )}

                    {outline ? (
                      <div className="space-y-3 text-xs text-zinc-200">
                        {outline.sections.map((section) => (
                          <div key={section.heading}>
                            <p className="font-medium text-zinc-50">
                              {section.heading}
                            </p>
                            <ul className="mt-1 list-disc pl-4">
                              {section.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-[11px] text-zinc-500">
                        Generate an outline to turn this idea into a ready-to-use
                        structure for your script, blog post, or carousel.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                  Select an idea from the list to see full details and generate
                  an outline that you can paste into your script or document.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
