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
  is_seed: boolean;
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

/**
 * Database contract used by the Supabase client.
 * Keeping this here means Supabase query builders know the shape of every
 * table, including update/insert payloads, instead of inferring `never`.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: boolean;
          moderation_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          moderation_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          moderation_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      confessions: {
        Row: Confession;
        Insert: {
          id?: string;
          soul_id?: string | null;
          display_soul?: string | null;
          is_seed?: boolean;
          language: Language;
          region: string;
          category: string;
          content: string;
          status?: ModerationStatus;
          created_at?: string;
          updated_at?: string;
          moderated_at?: string | null;
          moderated_by?: string | null;
        };
        Update: Partial<Confession>;
        Relationships: [];
      };
      reactions: {
        Row: Reaction;
        Insert: {
          id?: string;
          confession_id: string;
          soul_id: string;
          type: ReactionType;
          created_at?: string;
        };
        Update: Partial<Reaction>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
