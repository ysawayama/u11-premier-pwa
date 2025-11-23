-- ============================================
-- Phase 1: 権限システム
-- 拡張性のあるロールベースアクセス制御（RBAC）
-- ============================================

-- ============================================
-- 1. ロール定義テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  level INT NOT NULL DEFAULT 0, -- 権限レベル（大きいほど上位）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期ロールデータ
INSERT INTO public.roles (name, display_name, description, level) VALUES
  ('webmaster', 'Webマスター', '全ての操作が可能な最上位権限', 100),
  ('admin', '管理者', '大会運営に関わる全ての入力・編集が可能', 80),
  ('team_manager', 'チーム代表', '所属チームの管理と試合結果の入力が可能', 50),
  ('player', 'プレイヤー', '自分のマイページの入力・編集が可能', 10),
  ('guardian', '保護者', '選手情報の閲覧と連絡機能の利用が可能', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. ユーザーロール紐付けテーブル
-- （1ユーザーが複数ロールを持てる設計）
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = 無期限
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active);

-- ============================================
-- 3. チームメンバーテーブル
-- （ユーザーとチームの紐付け + チーム内ロール）
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'coach', 'member', 'player', 'guardian')),
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL, -- プレイヤー/保護者の場合、関連選手
  is_primary_contact BOOLEAN DEFAULT false, -- 主連絡先かどうか
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ, -- NULL = 現在所属中
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_player ON public.team_members(player_id);
CREATE INDEX idx_team_members_active ON public.team_members(is_active);

-- ============================================
-- 4. 招待テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  team_role TEXT CHECK (team_role IN ('manager', 'coach', 'member', 'player', 'guardian')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  message TEXT, -- 招待メッセージ
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- ============================================
-- 5. 選手の連絡先情報（保護者情報）
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('father', 'mother', 'guardian', 'emergency', 'other')),
  name TEXT NOT NULL,
  relationship TEXT, -- 続柄
  phone TEXT,
  email TEXT,
  line_id TEXT,
  is_primary BOOLEAN DEFAULT false,
  can_receive_notifications BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_contacts_player ON public.player_contacts(player_id);
CREATE INDEX idx_player_contacts_primary ON public.player_contacts(is_primary);

-- ============================================
-- 6. 権限チェック関数
-- ============================================

-- ユーザーが特定のロールを持っているかチェック
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーの最高権限レベルを取得
CREATE OR REPLACE FUNCTION public.get_user_max_role_level()
RETURNS INT AS $$
DECLARE
  max_level INT;
BEGIN
  SELECT COALESCE(MAX(r.level), 0) INTO max_level
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  AND ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());

  RETURN max_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Webマスターかチェック
CREATE OR REPLACE FUNCTION public.is_webmaster()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_role('webmaster');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者以上かチェック
CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_max_role_level() >= 80;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- チーム代表以上かチェック
CREATE OR REPLACE FUNCTION public.is_team_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_max_role_level() >= 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 特定チームの代表かチェック
CREATE OR REPLACE FUNCTION public.is_team_manager_of(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 管理者以上なら全チームOK
  IF public.is_admin_or_above() THEN
    RETURN true;
  END IF;

  -- チームメンバーとしてmanagerロールを持っているか
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND role = 'manager'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 特定チームのメンバーかチェック
CREATE OR REPLACE FUNCTION public.is_team_member_of(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 管理者以上なら全チームOK
  IF public.is_admin_or_above() THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 試合の編集権限チェック（両チーム代表 + 管理者）
CREATE OR REPLACE FUNCTION public.can_edit_match(match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_home_team_id UUID;
  v_away_team_id UUID;
BEGIN
  -- 管理者以上なら編集可能
  IF public.is_admin_or_above() THEN
    RETURN true;
  END IF;

  -- 試合のホーム/アウェイチームを取得
  SELECT home_team_id, away_team_id INTO v_home_team_id, v_away_team_id
  FROM public.matches
  WHERE id = match_uuid;

  -- どちらかのチームの代表なら編集可能
  RETURN public.is_team_manager_of(v_home_team_id)
      OR public.is_team_manager_of(v_away_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RLSポリシー
-- ============================================

-- roles テーブル
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles"
  ON public.roles FOR SELECT USING (true);

CREATE POLICY "Webmaster can manage roles"
  ON public.roles FOR ALL USING (public.is_webmaster());

-- user_roles テーブル
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_above());

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin_or_above());

-- team_members テーブル
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view own team members"
  ON public.team_members FOR SELECT
  USING (public.is_team_member_of(team_id) OR public.is_admin_or_above());

CREATE POLICY "Team managers can manage team members"
  ON public.team_members FOR ALL
  USING (public.is_team_manager_of(team_id));

-- invitations テーブル
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations"
  ON public.invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())
         OR invited_by = auth.uid()
         OR public.is_admin_or_above());

CREATE POLICY "Appropriate users can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    -- Webmaster can invite admins
    (public.is_webmaster() AND role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'team_manager', 'player', 'guardian')))
    OR
    -- Admins can invite team managers and below
    (public.is_admin_or_above() AND role_id IN (SELECT id FROM roles WHERE name IN ('team_manager', 'player', 'guardian')))
    OR
    -- Team managers can invite players and guardians to their team
    (public.is_team_manager_of(team_id) AND role_id IN (SELECT id FROM roles WHERE name IN ('player', 'guardian')))
  );

-- player_contacts テーブル
ALTER TABLE public.player_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view player contacts"
  ON public.player_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = player_contacts.player_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
    OR public.is_admin_or_above()
  );

CREATE POLICY "Team managers can manage player contacts"
  ON public.player_contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_contacts.player_id
      AND public.is_team_manager_of(p.team_id)
    )
  );

-- ============================================
-- 8. matchesテーブルの編集ポリシー更新
-- ============================================

-- 既存ポリシーを削除して新しいポリシーを作成
DROP POLICY IF EXISTS "Coaches and admins can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Coaches and admins can update matches" ON public.matches;

CREATE POLICY "Authorized users can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (public.is_admin_or_above());

CREATE POLICY "Authorized users can update matches"
  ON public.matches FOR UPDATE
  USING (public.can_edit_match(id));

-- ============================================
-- 9. トリガー: updated_at自動更新
-- ============================================
CREATE TRIGGER set_updated_at_roles
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_player_contacts
  BEFORE UPDATE ON public.player_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Phase 1: 権限システムのセットアップが完了しました';
  RAISE NOTICE '作成されたテーブル: roles, user_roles, team_members, invitations, player_contacts';
  RAISE NOTICE '作成された関数: has_role, get_user_max_role_level, is_webmaster, is_admin_or_above, is_team_manager_or_above, is_team_manager_of, is_team_member_of, can_edit_match';
END $$;
