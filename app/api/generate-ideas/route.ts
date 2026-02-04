import { NextRequest, NextResponse } from "next/server";
import { generateIdeasFromLLM } from "../../../lib/aiClient";
import type { Platform } from "../../../lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      audience?: string;
      platform?: Platform;
      contentType?: string;
      tone?: string;
      creativity?: number;
      count?: number;
    };

    if (!body.topic || typeof body.topic !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'topic'." },
        { status: 400 },
      );
    }

    const platform: Platform = body.platform ?? "generic";

    const ideas = await generateIdeasFromLLM({
      topic: body.topic,
      audience: body.audience,
      platform,
      contentType: body.contentType,
      tone: body.tone,
      creativity: body.creativity,
      count: body.count,
    });

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("[generate-ideas] Error:", error);
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

