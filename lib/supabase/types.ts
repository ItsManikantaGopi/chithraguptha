export type Language = "en" | "te" | "hi" | "ta" | "kn" | "ml" | "mr" | "bn";
export type ReactionType = "punya" | "paapa";
export type ModerationStatus = "pending" | "published" | "rejected";

export type Profile = {
  id: string;
  soul_id: string | null;
  role: "user" | "admin";
  language: Language;
  region: string;
  created_at: string;
};

export type Confession = {
  id: string;
  soul_id: string | null;
  display_soul: string | null;
  language: Language;
  region: string;
  category: string;
  content: string;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
};

export type Reaction = {
  id: string;
  confession_id: string;
  soul_id: string;
  type: ReactionType;
  created_at: string;
};
