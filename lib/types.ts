export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "blog"
  | "linkedin"
  | "twitter"
  | "generic";

export type IdeaStatus = "raw" | "refined" | "approved" | "scheduled";

export type EffortLevel = "low" | "medium" | "high";

export interface Idea {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  tags: string[];
  status: IdeaStatus;
  effort: EffortLevel;
  createdAt: string;
  plannedDate?: string;
  outlineId?: string;
}

export interface OutlineSection {
  heading: string;
  bullets: string[];
}

export interface Outline {
  id: string;
  ideaId: string;
  platform: Platform;
  sections: OutlineSection[];
}

