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

  // CMS用フィールド
  hero_image_url: string | null;
  description: string | null;
  concept: string | null;
  philosophy: string | null;
  training_schedule: string | null;
  practice_location: string | null;
  target_age: string | null;
  monthly_fee: string | null;
  entry_fee: string | null;
  achievements: string | null;
  sns_twitter: string | null;
  sns_instagram: string | null;
  sns_facebook: string | null;
  sns_youtube: string | null;
  contact_form_enabled: boolean;
  accepting_members: boolean;
  accepting_matches: boolean;

  // 追加フィールド（020で追加）
  representative_name: string | null;
  address: string | null;
  established_date: string | null;
  registration_status: string | null;
}

export interface TeamGallery {
  id: string;
  team_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export const InquiryType = {
  JOIN: 'join',
  MATCH: 'match',
  GENERAL: 'general',
  OTHER: 'other',
} as const;

export type InquiryType = (typeof InquiryType)[keyof typeof InquiryType];

export const InquiryStatus = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  CLOSED: 'closed',
} as const;

export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export interface TeamInquiry {
  id: string;
  team_id: string;
  inquiry_type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  child_name: string | null;
  child_grade: string | null;
  message: string;
  status: InquiryStatus;
  replied_at: string | null;
  replied_by: string | null;
  notes: string | null;
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

  // 追加プロフィール
  height: number | null;
  weight: number | null;
  dominant_foot: 'right' | 'left' | 'both' | null;
  bio: string | null;
  hero_image_url: string | null;

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

// ============================================
// 権限システム
// ============================================

export const UserRole = {
  WEBMASTER: 'webmaster',
  ADMIN: 'admin',
  TEAM_MANAGER: 'team_manager',
  PLAYER: 'player',
  GUARDIAN: 'guardian',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TeamMemberRole = {
  MANAGER: 'manager',
  COACH: 'coach',
  MEMBER: 'member',
  PLAYER: 'player',
  GUARDIAN: 'guardian',
} as const;

export type TeamMemberRole = (typeof TeamMemberRole)[keyof typeof TeamMemberRole];

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  player_id: string | null;
  is_primary_contact: boolean;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role_id: string | null;
  team_id: string | null;
  team_role: TeamMemberRole | null;
  invited_by: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  message: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface PlayerContact {
  id: string;
  player_id: string;
  contact_type: 'father' | 'mother' | 'guardian' | 'emergency' | 'other';
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  line_id: string | null;
  is_primary: boolean;
  can_receive_notifications: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// チーム機能
// ============================================

export const ScheduleEventType = {
  MATCH: 'match',
  PRACTICE: 'practice',
  MEETING: 'meeting',
  EVENT: 'event',
  OTHER: 'other',
} as const;

export type ScheduleEventType = (typeof ScheduleEventType)[keyof typeof ScheduleEventType];

export const AttendanceStatus = {
  PENDING: 'pending',
  ATTENDING: 'attending',
  NOT_ATTENDING: 'not_attending',
  MAYBE: 'maybe',
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const PostType = {
  GENERAL: 'general',
  ANNOUNCEMENT: 'announcement',
  IMPORTANT: 'important',
  QUESTION: 'question',
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];

export interface TeamSchedule {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  event_type: ScheduleEventType;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  location_url: string | null;
  match_id: string | null;
  is_all_day: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  schedule_id: string;
  player_id: string;
  status: AttendanceStatus;
  responded_by: string | null;
  responded_at: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamBoardPost {
  id: string;
  team_id: string;
  author_id: string;
  title: string | null;
  content: string;
  post_type: PostType;
  is_pinned: boolean;
  is_archived: boolean;
  attachment_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TeamBoardComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamAlbum {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  schedule_id: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamAlbumPhoto {
  id: string;
  album_id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  taken_at: string | null;
  uploaded_by: string | null;
  sort_order: number;
  created_at: string;
}

export interface MatchRequest {
  id: string;
  requesting_team_id: string;
  request_type: 'looking' | 'offering';
  title: string;
  description: string | null;
  preferred_dates: any; // JSONB
  location_preference: string | null;
  location_details: string | null;
  player_count_min: number | null;
  player_count_max: number | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any' | null;
  status: 'open' | 'matched' | 'closed' | 'cancelled';
  matched_team_id: string | null;
  matched_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchRequestResponse {
  id: string;
  request_id: string;
  responding_team_id: string;
  message: string | null;
  proposed_datetime: string | null;
  proposed_location: string | null;
  status: 'pending' | 'accepted' | 'declined';
  responded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// コミュニケーション（チャット）
// ============================================

export const ChatRoomType = {
  TEAM: 'team',
  GROUP: 'group',
  DIRECT: 'direct',
} as const;

export type ChatRoomType = (typeof ChatRoomType)[keyof typeof ChatRoomType];

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ChatRoom {
  id: string;
  team_id: string | null;
  room_type: ChatRoomType;
  name: string | null;
  description: string | null;
  icon_url: string | null;
  created_by: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  is_muted: boolean;
  joined_at: string;
  last_read_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  attachment_url: string | null;
  attachment_name: string | null;
  reply_to_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface ChatMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// ============================================
// Joined Types（追加分）
// ============================================

export interface TeamMemberWithUser extends TeamMember {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface TeamMemberWithPlayer extends TeamMember {
  player: Player | null;
}

export interface TeamScheduleWithMatch extends TeamSchedule {
  match: MatchWithTeams | null;
}

export interface AttendanceWithPlayer extends Attendance {
  player: Player;
}

export interface TeamBoardPostWithAuthor extends TeamBoardPost {
  author: {
    id: string;
    full_name: string | null;
  };
  comments_count?: number;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string;
    full_name: string | null;
  };
}

// ============================================
// 選手ページ機能
// ============================================

export const SoccerLifeLogType = {
  PRACTICE: 'practice',
  MATCH: 'match',
  TRAINING: 'training',
  STUDY: 'study',
  OTHER: 'other',
} as const;

export type SoccerLifeLogType = (typeof SoccerLifeLogType)[keyof typeof SoccerLifeLogType];

export interface SoccerLifeLog {
  id: string;
  player_id: string;
  log_date: string;
  log_type: SoccerLifeLogType;
  title: string;
  content: string | null;
  mood: number | null;
  duration_minutes: number | null;
  image_urls: string[] | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SoccerNote {
  id: string;
  player_id: string;
  schedule_id: string | null;
  match_id: string | null;
  note_date: string;
  title: string | null;
  what_went_well: string | null;
  what_to_improve: string | null;
  next_goal: string | null;
  self_rating: number | null;
  coach_comment: string | null;
  coach_id: string | null;
  coach_commented_at: string | null;
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerAlbum {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const MediaType = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export interface PlayerAlbumMedia {
  id: string;
  album_id: string;
  media_url: string;
  thumbnail_url: string | null;
  media_type: MediaType;
  caption: string | null;
  taken_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface PlayerPerformance {
  player_id: string;
  team_id: string;
  family_name: string;
  given_name: string;
  uniform_number: number | null;
  position: string | null;
  practice_attendance_count: number;
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

// Joined Types
export interface SoccerNoteWithCoach extends SoccerNote {
  coach: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface PlayerAlbumWithMedia extends PlayerAlbum {
  media: PlayerAlbumMedia[];
}

// ============================================
// Announcements (お知らせ)
// ============================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
