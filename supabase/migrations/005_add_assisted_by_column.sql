-- アシスト情報を記録するためのカラムを追加

-- match_eventsテーブルにassisted_by_player_idカラムを追加
ALTER TABLE public.match_events
ADD COLUMN IF NOT EXISTS assisted_by_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL;

-- カラムにコメントを追加
COMMENT ON COLUMN public.match_events.assisted_by_player_id IS 'ゴールをアシストした選手のID（ゴールイベントの場合のみ）';
