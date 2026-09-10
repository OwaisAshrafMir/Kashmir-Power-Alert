export type UserRole = "user" | "admin";
export type PlanType = "free" | "pro";
export type ShutdownStatus = "active" | "upcoming" | "past";

/** Where a notice (or the ingest health) came from. */
export type NoticeSource =
  | "kpdcl"
  | "kpdcl_portal"
  | "dipr"
  | "press"
  | "sample"
  | "unavailable";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  plan: PlanType;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  district: string | null;
  locality: string | null;
  watch_localities: string[];
  notifications_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export interface ShutdownNotice {
  id: string;
  fingerprint: string;
  title: string;
  summary: string;
  lineName: string | null;
  reason: string | null;
  districts: string[];
  localities: string[];
  startsAt: string | null;
  endsAt: string | null;
  dates: string[];
  source: NoticeSource;
  sourceUrl: string;
  sourceLabel: string;
  publishedAt: string | null;
  status: ShutdownStatus;
}

export interface IngestHealth {
  lastFetchAt: string | null;
  lastSuccessAt: string | null;
  noticeCount: number;
  source: NoticeSource | string;
  error: string | null;
}
