/**
 * Database Types
 * Supabaseテーブルの型定義
 */

// ============================================
// Enums
// ============================================

export const MatchType = {
  LEAGUE: 'league',
  CHAMPIONSHIP: 'championship',
  FRIENDLY: 'friendly',
} as const;

export type MatchType = (typeof MatchType)[keyof typeof MatchType];

export const MatchStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const EventType = {
  GOAL: 'goal',
  YELLOW_CARD: 'yellow_card',
  RED_CARD: 'red_card',
  SUBSTITUTION: 'substitution',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const Position = {
  GK: 'GK',
  DF: 'DF',
  MF: 'MF',
  FW: 'FW',
} as const;

export type Position = (typeof Position)[keyof typeof Position];

// ============================================
// Database Tables
// ============================================

export interface Region {
  id: string;
  name: string;
  name_en: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Prefecture {
  id: string;
  region_id: string;
  name: string;
  name_en: string;
  code: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  prefecture_id: string;
  name: string;
  name_kana: string | null;
  short_name: string | null;
  logo_url: string | null;
  founded_year: number | null;
  home_ground: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  user_id: string | null;

  // 基本情報
  family_name: string;
  given_name: string;
  family_name_kana: string;
  given_name_kana: string;
  date_of_birth: string;
  grade: number;

  // 選手情報
  uniform_number: number | null;
  position: string | null;
  photo_url: string | null;

  // デジタル選手証
  player_card_number: string | null;
  qr_code_data: string | null;
  card_issued_at: string | null;
  card_expires_at: string | null;

  // メタ情報
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  championship_date: string | null;
  championship_venue: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  season_id: string;

  // 試合情報
  match_date: string;
  venue: string;
  match_type: MatchType;
  round: string | null;

  // チーム情報
  home_team_id: string;
  away_team_id: string;

  // スコア
  home_score: number | null;
  away_score: number | null;

  // 試合状態
  status: MatchStatus;

  // 詳細情報
  weather: string | null;
  temperature: number | null;
  attendance: number | null;
  referee: string | null;
  notes: string | null;

  // メタ情報
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string | null;
  team_id: string;

  // イベント情報
  event_type: EventType;
  minute: number;
  description: string | null;

  // 交代時の情報
  substitution_player_out_id: string | null;
  substitution_player_in_id: string | null;

  created_at: string;
}

export interface TeamStanding {
  id: string;
  season_id: string;
  team_id: string;

  // 成績
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;

  // ランキング
  rank: number | null;

  // メタ情報
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStat {
  id: string;
  season_id: string;
  player_id: string;

  // 成績
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;

  // メタ情報
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Joined Types (リレーション含む)
// ============================================

export interface TeamWithPrefecture extends Team {
  prefecture: Prefecture;
}

export interface TeamWithRegion extends TeamWithPrefecture {
  region: Region;
}

export interface PlayerWithTeam extends Player {
  team: Team;
}

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

export interface MatchEventWithPlayer extends MatchEvent {
  player: Player | null;
  team: Team;
}

export interface TeamStandingWithTeam extends TeamStanding {
  team: Team;
}

export interface PlayerStatWithPlayer extends PlayerStat {
  player: Player;
}

// ============================================
// Insert Types (作成用)
// ============================================

export type TeamInsert = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type PlayerInsert = Omit<Player, 'id' | 'created_at' | 'updated_at'>;
export type MatchInsert = Omit<Match, 'id' | 'created_at' | 'updated_at'>;
export type MatchEventInsert = Omit<MatchEvent, 'id' | 'created_at'>;

// ============================================
// Update Types (更新用)
// ============================================

export type TeamUpdate = Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>;
export type PlayerUpdate = Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>;
export type MatchUpdate = Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>;
