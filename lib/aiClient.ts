import { Idea, EffortLevel, Platform } from "./types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "openrouter/auto";

type GenerateIdeasParams = {
  topic: string;
  audience?: string;
  platform: Platform;
  contentType?: string;
  tone?: string;
  creativity?: number;
  count?: number;
};

export async function generateIdeasFromLLM(
  params: GenerateIdeasParams,
): Promise<Idea[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your environment to enable idea generation.",
    );
  }

  const {
    topic,
    audience,
    platform,
    contentType,
    tone = "friendly",
    creativity = 0.7,
    count = 10,
  } = params;

  const system = [
    "You are an expert content strategist for online creators.",
    "You generate concrete, high-signal content ideas as JSON.",
    "Each idea must be self-contained, specific, and niche-aware.",
  ].join(" ");

  const user = `
Generate ${count} distinct content ideas as JSON for:
- Topic: ${topic}
- Audience: ${audience || "General audience"}
- Primary platform: ${platform}
- Content type: ${contentType || "Any"}
- Tone: ${tone}

Return ONLY valid JSON with this exact shape:
{
  "ideas": [
    {
      "id": "string - short unique id",
      "title": "short punchy title or hook",
      "description": "2-4 sentence explanation with angle, hook, and value",
      "platform": "${platform}",
      "tags": ["short", "comma-separated", "keywords"],
      "status": "raw",
      "effort": "low" | "medium" | "high",
      "createdAt": "ISO timestamp string"
    }
  ]
}

Rules:
- Do not include any commentary outside the JSON.
- Match the platform and audience in each idea.
- Vary the angles, formats, and depths.
  `.trim();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Content Ideas Studio",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: creativity,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Ideas model error (${res.status}): ${errorText || res.statusText}`,
    );
  }

  const json = (await res.json()) as {
    choices: { message?: { content?: string } }[];
  };

  const content = json.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from ideas model.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  const ideas = (parsed as { ideas?: Idea[] }).ideas ?? [];

  // Basic runtime normalization to avoid crashes from imperfect model output
  const now = new Date().toISOString();

  return ideas.map((idea, index) => ({
    id: idea.id || `idea-${Date.now()}-${index}`,
    title: idea.title || `Idea ${index + 1}`,
    description: idea.description || "",
    platform: idea.platform || platform,
    tags: Array.isArray(idea.tags) ? idea.tags : [],
    status: idea.status || "raw",
    effort: (idea.effort as EffortLevel) || "medium",
    createdAt: idea.createdAt || now,
    plannedDate: idea.plannedDate,
    outlineId: idea.outlineId,
  }));
}

