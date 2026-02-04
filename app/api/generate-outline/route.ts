import { NextRequest, NextResponse } from "next/server";
import type { Outline, Platform } from "../../../lib/types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "openrouter/auto";

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not set. Add it to your environment to enable outline generation.",
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      ideaId?: string;
      ideaTitle?: string;
      ideaDescription?: string;
      platform?: Platform;
      audience?: string;
      tone?: string;
    };

    if (!body.ideaId || !body.ideaTitle) {
      return NextResponse.json(
        { error: "ideaId and ideaTitle are required." },
        { status: 400 },
      );
    }

    const platform: Platform = body.platform ?? "generic";
    const tone = body.tone ?? "friendly";

    const system = [
      "You are an expert content strategist and script writer.",
      "You turn a single content idea into a clear, structured outline.",
      "You always respond with JSON only.",
    ].join(" ");

    const user = `
Create a detailed outline as JSON for the following idea:

Title: ${body.ideaTitle}
Description: ${body.ideaDescription || "N/A"}
Platform: ${platform}
Audience: ${body.audience || "General audience"}
Preferred tone: ${tone}

Return ONLY valid JSON with this shape:
{
  "outline": {
    "id": "string - short unique id",
    "ideaId": "${body.ideaId}",
    "platform": "${platform}",
    "sections": [
      {
        "heading": "string",
        "bullets": ["bullet point 1", "bullet point 2"]
      }
    ]
  }
}

Rules:
- No commentary outside the JSON.
- Sections should flow logically (hook, body, CTA, etc).
- Make bullets concrete and actionable, not generic advice.
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
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Outline model error (${res.status}): ${
            errorText || res.statusText
          }`,
        },
        { status: 500 },
      );
    }

    const json = (await res.json()) as {
      choices: { message?: { content?: string } }[];
    };

    const content = json.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from outline model." },
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON." },
        { status: 500 },
      );
    }

    const outline = (parsed as { outline?: Outline }).outline;
    if (!outline) {
      return NextResponse.json(
        { error: "Model response is missing 'outline'." },
        { status: 500 },
      );
    }

    return NextResponse.json({ outline });
  } catch (error) {
    console.error("[generate-outline] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json(
      { error: message },
      {
        status: 500,
      },
    );
  }
}

